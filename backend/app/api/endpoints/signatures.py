"""
Ed25519 signature endpoints for student contract verification.

Flow:
1) STUDENT key registration (or server-assisted keygen)
2) ADMIN activates student's signing key after identity/matricula check
3) STUDENT requests challenge for a contract hash
4) STUDENT signs challenge message client-side and sends signature
5) Backend verifies signature and stores cryptographic evidence
6) ADMIN opens time-limited registration window
"""

from datetime import datetime, timedelta, timezone
import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.dependencies import get_current_admin, get_current_student
from app.db.database import get_db
from app.models.models import (
    SignedContract,
    SigningChallenge,
    Student,
    StudentSignatureKey,
    RegistrationWindow,
    User,
)
from app.services.crypto_service import crypto_service


router = APIRouter(prefix="/signatures", tags=["Signatures"])
limiter = Limiter(key_func=get_remote_address)


class KeyGenResponse(BaseModel):
    algorithm: str
    private_key: str
    public_key: str
    warning: str


class PublicKeyRegisterRequest(BaseModel):
    public_key: str = Field(..., min_length=64, max_length=64)


class PublicKeyResponse(BaseModel):
    student_id: int
    public_key: str
    algorithm: str
    is_active: bool
    activated_at: datetime | None


class ChallengeCreateRequest(BaseModel):
    contract_hash: str = Field(..., min_length=64, max_length=64)


class ChallengeResponse(BaseModel):
    challenge_id: int
    nonce: str
    expires_at: datetime
    message_to_sign: str


class VerifySignatureRequest(BaseModel):
    challenge_id: int
    signature: str = Field(..., min_length=128)


class VerifySignatureResponse(BaseModel):
    verified: bool
    signed_contract_id: int | None = None
    verified_at: datetime | None = None


class ActivateWindowResponse(BaseModel):
    window_id: int
    student_id: int
    opened_at: datetime
    expires_at: datetime


def _validate_contract_hash(value: str) -> str:
    if not re.fullmatch(r"[0-9a-fA-F]{64}", value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="contract_hash must be a SHA-256 hex string (64 chars)",
        )
    return value.lower()


@router.post("/keygen", response_model=KeyGenResponse, summary="Generate Student Ed25519 Key Pair")
@limiter.limit("3/minute")
async def keygen_student_ed25519(
    request: Request,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Server-assisted key generation for students.

    WARNING: private key is returned once and never stored server-side.
    """
    private_key, public_key = crypto_service.generate_student_ed25519_keypair()

    key_record = (
        db.query(StudentSignatureKey)
        .filter(StudentSignatureKey.student_id == current_student.id)
        .first()
    )

    if key_record is None:
        key_record = StudentSignatureKey(
            student_id=current_student.id,
            public_key=public_key,
            algorithm="Ed25519",
            is_active=False,
        )
        db.add(key_record)
    else:
        key_record.public_key = public_key
        key_record.algorithm = "Ed25519"
        key_record.is_active = False
        key_record.activated_at = None
        key_record.activated_by_user_id = None

    db.commit()

    return KeyGenResponse(
        algorithm="Ed25519",
        private_key=private_key,
        public_key=public_key,
        warning="Store this private key securely. It is never saved by the server and cannot be recovered.",
    )


@router.post("/public-key", response_model=PublicKeyResponse, summary="Register Student Public Key")
@limiter.limit("10/minute")
async def register_public_key(
    request: Request,
    payload: PublicKeyRegisterRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Register or rotate student Ed25519 public key (requires ADMIN reactivation)."""
    public_key = payload.public_key.strip().lower()

    if not crypto_service.is_valid_ed25519_public_key(public_key):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid Ed25519 public key format",
        )

    key_record = (
        db.query(StudentSignatureKey)
        .filter(StudentSignatureKey.student_id == current_student.id)
        .first()
    )

    if key_record is None:
        key_record = StudentSignatureKey(
            student_id=current_student.id,
            public_key=public_key,
            algorithm="Ed25519",
            is_active=False,
        )
        db.add(key_record)
    else:
        key_record.public_key = public_key
        key_record.algorithm = "Ed25519"
        key_record.is_active = False
        key_record.activated_at = None
        key_record.activated_by_user_id = None

    db.commit()
    db.refresh(key_record)

    return PublicKeyResponse(
        student_id=current_student.id,
        public_key=key_record.public_key,
        algorithm=key_record.algorithm,
        is_active=key_record.is_active,
        activated_at=key_record.activated_at,
    )


@router.post(
    "/public-key/activate/{student_id}",
    response_model=PublicKeyResponse,
    summary="Activate Student Public Key (ADMIN)",
)
@limiter.limit("20/minute")
async def activate_public_key(
    request: Request,
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Activate student's key after identity/matricula verification by ADMIN."""
    key_record = (
        db.query(StudentSignatureKey)
        .filter(StudentSignatureKey.student_id == student_id)
        .first()
    )

    if key_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student public key not found",
        )

    key_record.is_active = True
    key_record.activated_at = datetime.now(timezone.utc)
    key_record.activated_by_user_id = current_admin.id

    db.commit()
    db.refresh(key_record)

    return PublicKeyResponse(
        student_id=key_record.student_id,
        public_key=key_record.public_key,
        algorithm=key_record.algorithm,
        is_active=key_record.is_active,
        activated_at=key_record.activated_at,
    )


@router.post("/challenges", response_model=ChallengeResponse, summary="Create Signing Challenge")
@limiter.limit("20/minute")
async def create_signing_challenge(
    request: Request,
    payload: ChallengeCreateRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Create a short-lived challenge to be signed by student's private key."""
    contract_hash = _validate_contract_hash(payload.contract_hash)

    key_record = (
        db.query(StudentSignatureKey)
        .filter(StudentSignatureKey.student_id == current_student.id)
        .first()
    )
    if key_record is None or not key_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student public key must be active before requesting a challenge",
        )

    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.SIGNATURE_CHALLENGE_EXPIRE_SECONDS
    )
    nonce = secrets.token_urlsafe(24)

    challenge = SigningChallenge(
        student_id=current_student.id,
        nonce=nonce,
        contract_hash=contract_hash,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    message = crypto_service.build_contract_challenge_message(
        student_id=current_student.id,
        contract_hash=contract_hash,
        nonce=nonce,
        expires_at=expires_at,
    )

    return ChallengeResponse(
        challenge_id=challenge.id,
        nonce=challenge.nonce,
        expires_at=challenge.expires_at,
        message_to_sign=message,
    )


@router.post("/verify", response_model=VerifySignatureResponse, summary="Verify Contract Signature")
@limiter.limit("20/minute")
async def verify_signature(
    request: Request,
    payload: VerifySignatureRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Verify student signature and store cryptographic evidence."""
    challenge = (
        db.query(SigningChallenge)
        .filter(
            SigningChallenge.id == payload.challenge_id,
            SigningChallenge.student_id == current_student.id,
        )
        .first()
    )
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    if challenge.is_used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge already used")

    if crypto_service.is_enrollment_code_expired(challenge.expires_at):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge expired")

    key_record = (
        db.query(StudentSignatureKey)
        .filter(StudentSignatureKey.student_id == current_student.id)
        .first()
    )
    if key_record is None or not key_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active public key found for this student",
        )

    message = crypto_service.build_contract_challenge_message(
        student_id=current_student.id,
        contract_hash=challenge.contract_hash,
        nonce=challenge.nonce,
        expires_at=challenge.expires_at,
    )

    verified = crypto_service.verify_student_contract_signature(
        public_key_hex=key_record.public_key,
        message=message,
        signature_hex=payload.signature,
    )

    if not verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    signed_contract = SignedContract(
        student_id=current_student.id,
        challenge_id=challenge.id,
        contract_hash=challenge.contract_hash,
        signature=payload.signature,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(signed_contract)

    challenge.is_used = True
    challenge.used_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(signed_contract)

    return VerifySignatureResponse(
        verified=True,
        signed_contract_id=signed_contract.id,
        verified_at=signed_contract.verified_at,
    )


@router.post(
    "/registration-window/activate/{student_id}",
    response_model=ActivateWindowResponse,
    summary="Activate Registration Window (ADMIN)",
)
@limiter.limit("20/minute")
async def activate_registration_window(
    request: Request,
    student_id: int,
    minutes: int = Query(
        default=settings.REGISTRATION_WINDOW_EXPIRE_MINUTES,
        ge=1,
        le=60,
        description="Registration window lifetime in minutes",
    ),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Activate a short registration window after identity/matricula checks.

    Requires at least one verified signed contract for the student.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    signed_contract = (
        db.query(SignedContract)
        .filter(SignedContract.student_id == student_id)
        .order_by(SignedContract.verified_at.desc())
        .first()
    )
    if signed_contract is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student must complete contract signature verification first",
        )

    opened_at = datetime.now(timezone.utc)
    window = RegistrationWindow(
        student_id=student_id,
        activated_by_user_id=current_admin.id,
        opened_at=opened_at,
        expires_at=opened_at + timedelta(minutes=minutes),
        is_used=False,
    )
    db.add(window)
    db.commit()
    db.refresh(window)

    return ActivateWindowResponse(
        window_id=window.id,
        student_id=window.student_id,
        opened_at=window.opened_at,
        expires_at=window.expires_at,
    )
