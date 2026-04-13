"""
Cryptographic services for Secure Fair.
Implements Ed25519 signatures and HMAC-based code hashing.
"""

import hashlib
import hmac
import re
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

import nacl.encoding
import nacl.exceptions
import nacl.signing

from app.core.config import settings


class CryptoService:
    """Handle cryptographic operations for the application."""

    def __init__(self):
        """Initialize crypto service with keys from configuration."""
        self.private_key = nacl.signing.SigningKey(
            settings.SIGNING_PRIVATE_KEY.encode(),
            encoder=nacl.encoding.HexEncoder,
        )
        self.verify_key = nacl.signing.VerifyKey(
            settings.SIGNING_PUBLIC_KEY.encode(),
            encoder=nacl.encoding.HexEncoder,
        )
        self.code_secret = settings.CODE_SECRET_KEY.encode()

    # ==================== ENROLLMENT CODE OPERATIONS ====================

    def generate_enrollment_code(self, length: Optional[int] = None) -> str:
        """Generate a cryptographically secure random enrollment code."""
        code_length = length or settings.ENROLLMENT_CODE_LENGTH
        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(code_length))

    def normalize_enrollment_code(self, code: str) -> str:
        """Normalize enrollment codes before hashing or verifying."""
        return "".join(code.split()).upper()

    def hash_enrollment_code(self, code: str) -> str:
        """Hash enrollment code using HMAC-SHA256."""
        normalized = self.normalize_enrollment_code(code)
        return hmac.new(self.code_secret, normalized.encode(), hashlib.sha256).hexdigest()

    def verify_enrollment_code(self, code: str, code_hash: str) -> bool:
        """Verify an enrollment code against its hash in constant time."""
        expected_hash = self.hash_enrollment_code(code)
        return hmac.compare_digest(expected_hash, code_hash)

    def is_enrollment_code_expired(
        self,
        expires_at: datetime,
        current_time: Optional[datetime] = None,
    ) -> bool:
        """Check whether an enrollment code has expired (timezone-safe)."""
        now = current_time or datetime.now(timezone.utc)
        normalized_expires_at = self._to_utc_datetime(expires_at)
        normalized_now = self._to_utc_datetime(now)
        return normalized_now >= normalized_expires_at

    def _to_utc_datetime(self, value: datetime) -> datetime:
        """Convert a datetime to a UTC-aware datetime."""
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    # ==================== STUDENT SIGNATURE KEYS (Ed25519) ====================

    def generate_student_ed25519_keypair(self) -> tuple[str, str]:
        """Generate a student Ed25519 key pair as hex strings."""
        student_signing_key = nacl.signing.SigningKey.generate()
        private_key_hex = student_signing_key.encode(encoder=nacl.encoding.HexEncoder).decode()
        public_key_hex = student_signing_key.verify_key.encode(encoder=nacl.encoding.HexEncoder).decode()
        return private_key_hex, public_key_hex

    def is_valid_ed25519_public_key(self, public_key_hex: str) -> bool:
        """Validate Ed25519 public key encoding and size."""
        if not re.fullmatch(r"[0-9a-fA-F]{64}", public_key_hex or ""):
            return False
        try:
            nacl.signing.VerifyKey(public_key_hex.encode(), encoder=nacl.encoding.HexEncoder)
            return True
        except Exception:
            return False

    def build_contract_challenge_message(
        self,
        student_id: int,
        contract_hash: str,
        nonce: str,
        expires_at: datetime,
    ) -> str:
        """Build canonical message for student contract signing."""
        expiration_ts = int(self._to_utc_datetime(expires_at).timestamp())
        return f"{student_id}|{contract_hash}|{nonce}|{expiration_ts}"

    def verify_student_contract_signature(
        self,
        public_key_hex: str,
        message: str,
        signature_hex: str,
    ) -> bool:
        """Verify student Ed25519 signature for contract challenge."""
        try:
            verify_key = nacl.signing.VerifyKey(
                public_key_hex.encode(),
                encoder=nacl.encoding.HexEncoder,
            )
            verify_key.verify(message.encode(), bytes.fromhex(signature_hex))
            return True
        except (ValueError, nacl.exceptions.BadSignatureError):
            return False

    # ==================== DIGITAL SIGNATURES (SERVER RECEIPTS) ====================

    def sign_enrollment_receipt(self, data: dict) -> str:
        """Create a digital signature for enrollment receipt."""
        message = self._create_canonical_message(data)
        signed = self.private_key.sign(message.encode(), encoder=nacl.encoding.HexEncoder)
        return signed.signature.decode()

    def verify_enrollment_receipt(self, data: dict, signature: str) -> bool:
        """Verify the digital signature of an enrollment receipt."""
        try:
            message = self._create_canonical_message(data)
            self.verify_key.verify(message.encode(), bytes.fromhex(signature))
            return True
        except (ValueError, nacl.exceptions.BadSignatureError):
            return False

    def _create_canonical_message(self, data: dict) -> str:
        """Create canonical enrollment message format."""
        required_fields = ["student_id", "project_id", "slot_id", "timestamp"]
        values = [str(data.get(field, "")) for field in required_fields]
        return "|".join(values)

    # ==================== QR TOKEN GENERATION ====================

    def generate_qr_token(self, student_id: int, slot_id: int, expiration_minutes: int = 30) -> str:
        """Generate a signed token for QR code check-in."""
        expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
        expiration_ts = int(expiration.timestamp())
        message = f"{student_id}|{slot_id}|{expiration_ts}"
        signature = self.private_key.sign(
            message.encode(), encoder=nacl.encoding.HexEncoder
        ).signature.decode()
        return f"{message}|{signature}"

    def verify_qr_token(self, token: str) -> Optional[dict]:
        """Verify and parse a QR token."""
        try:
            parts = token.split("|")
            if len(parts) != 4:
                return None

            student_id, slot_id, expiration_ts, signature = parts

            if int(expiration_ts) < int(datetime.utcnow().timestamp()):
                return None

            message = f"{student_id}|{slot_id}|{expiration_ts}"
            self.verify_key.verify(message.encode(), bytes.fromhex(signature))

            return {"student_id": int(student_id), "slot_id": int(slot_id)}
        except (ValueError, nacl.exceptions.BadSignatureError):
            return None


crypto_service = CryptoService()
