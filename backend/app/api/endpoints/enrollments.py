"""
Enrollment endpoints for Secure Fair.
Student enrollment with cryptographic protections and duplicate prevention.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.db.database import get_db
from app.models.models import (
    Enrollment,
    Student,
    TimeSlot,
    EnrollmentCode,
    User,
    UserRole,
    SlotStatus,
)
from app.core.dependencies import get_current_user, get_current_student, get_current_admin
from app.services.crypto_service import crypto_service
from slowapi import Limiter
from slowapi.util import get_remote_address


router = APIRouter(prefix="/enrollments", tags=["Enrollments"])
limiter = Limiter(key_func=get_remote_address)


# ==================== PYDANTIC SCHEMAS ====================

from pydantic import BaseModel, Field


class EnrollmentCreate(BaseModel):
    """Schema for creating an enrollment."""

    time_slot_id: int
    enrollment_code: str = Field(..., min_length=6, max_length=6)


class EnrollmentResponse(BaseModel):
    """Schema for enrollment response."""

    id: int
    student_id: int
    time_slot_id: int
    signature: str
    enrolled_at: datetime

    class Config:
        from_attributes = True


class EnrollmentDetailResponse(EnrollmentResponse):
    """Detailed enrollment response with related data."""

    student_id_number: str | None = None
    project_name: str | None = None
    slot_start_time: datetime | None = None
    slot_end_time: datetime | None = None


# ==================== ENDPOINTS ====================


@router.post(
    "/",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll Student in Time Slot",
)
@limiter.limit("10/minute")
async def create_enrollment(
    request: Request,
    enrollment_data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Enroll a student in a time slot using an enrollment code.

    **STUDENT ONLY** - Requires STUDENT role.

    **Security Protections:**
    1. **Duplicate Prevention**: Database-level unique constraint on (student_id, time_slot_id)
    2. **Code Validation**: HMAC-SHA256 verification of enrollment code
    3. **Expiration Check**: Codes expire after 60-120 seconds
    4. **Single-Use Enforcement**: Codes can only be used once
    5. **Capacity Check**: Prevents enrollment when slot is full
    6. **Digital Signature**: Ed25519 signature for non-repudiation
    7. **Rate Limiting**: 10 enrollments per minute per IP

    **Process:**
    1. Validates enrollment code (hash match, not expired, not used)
    2. Checks for duplicate enrollment (unique constraint)
    3. Verifies slot capacity
    4. Creates enrollment with digital signature
    5. Increments slot enrollment counter
    6. Marks code as used
    """
    # Step 1: Validate time slot exists
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == enrollment_data.time_slot_id).first()

    if not time_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time slot with ID {enrollment_data.time_slot_id} not found",
        )

    # Step 2: Check if slot is available
    if time_slot.status == SlotStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This time slot has been cancelled"
        )

    if time_slot.status == SlotStatus.FULL or time_slot.current_enrollments >= time_slot.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This time slot is full"
        )

    # Step 3: Validate enrollment code
    code_hash = crypto_service.hash_enrollment_code(enrollment_data.enrollment_code)

    enrollment_code = (
        db.query(EnrollmentCode)
        .filter(
            EnrollmentCode.code_hash == code_hash, EnrollmentCode.project_id == time_slot.project_id
        )
        .first()
    )

    if not enrollment_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid enrollment code"
        )

    # Check if code is expired
    if crypto_service.is_enrollment_code_expired(enrollment_code.expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Enrollment code has expired"
        )

    # Check if code was already used
    if enrollment_code.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Enrollment code has already been used"
        )

    # Step 4: Check for duplicate enrollment (application-level check before DB constraint)
    existing_enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_student.id,
            Enrollment.time_slot_id == enrollment_data.time_slot_id,
        )
        .first()
    )

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already enrolled in this time slot",
        )

    # Step 5: Create enrollment with digital signature
    enrollment_receipt_data = {
        "student_id": current_student.id,
        "project_id": time_slot.project_id,
        "slot_id": time_slot.id,
        "timestamp": datetime.utcnow().isoformat(),
    }

    signature = crypto_service.sign_enrollment_receipt(enrollment_receipt_data)

    new_enrollment = Enrollment(
        student_id=current_student.id,
        time_slot_id=enrollment_data.time_slot_id,
        signature=signature,
        enrollment_code_id=enrollment_code.id,
    )

    # Step 6: Mark code as used
    enrollment_code.is_used = True
    enrollment_code.used_by_student_id = current_student.id
    enrollment_code.used_at = datetime.utcnow()

    # Step 7: Increment slot enrollment counter
    time_slot.current_enrollments += 1

    # Mark slot as full if capacity reached
    if time_slot.current_enrollments >= time_slot.capacity:
        time_slot.status = SlotStatus.FULL

    try:
        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)
    except IntegrityError as e:
        db.rollback()
        # This catches the database-level unique constraint violation
        if "uq_student_slot" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate enrollment detected: You are already enrolled in this time slot",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error occurred"
        )

    return new_enrollment


@router.get(
    "/my-enrollments", response_model=List[EnrollmentDetailResponse], summary="Get My Enrollments"
)
@limiter.limit("100/minute")
async def get_my_enrollments(
    request: Request,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Get all enrollments for the current student.

    **STUDENT ONLY** - Requires STUDENT role.

    Returns enrollment details including project and time slot information.
    """
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_student.id).all()

    # Enrich with related data
    detailed_enrollments = []
    for enrollment in enrollments:
        response = EnrollmentDetailResponse(
            id=enrollment.id,
            student_id=enrollment.student_id,
            time_slot_id=enrollment.time_slot_id,
            signature=enrollment.signature,
            enrolled_at=enrollment.enrolled_at,
            student_id_number=current_student.student_id_number,
            project_name=enrollment.time_slot.project.name
            if enrollment.time_slot and enrollment.time_slot.project
            else None,
            slot_start_time=enrollment.time_slot.start_time if enrollment.time_slot else None,
            slot_end_time=enrollment.time_slot.end_time if enrollment.time_slot else None,
        )
        detailed_enrollments.append(response)

    return detailed_enrollments


@router.get(
    "/slot/{time_slot_id}",
    response_model=List[EnrollmentResponse],
    summary="Get Enrollments for Time Slot (ADMIN Only)",
)
@limiter.limit("100/minute")
async def get_slot_enrollments(
    request: Request,
    time_slot_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Get all enrollments for a specific time slot.

    **ADMIN ONLY** - Requires ADMIN role.

    Useful for attendance tracking and capacity management.
    """
    # Verify slot exists
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == time_slot_id).first()
    if not time_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time slot with ID {time_slot_id} not found",
        )

    enrollments = db.query(Enrollment).filter(Enrollment.time_slot_id == time_slot_id).all()

    return enrollments


@router.delete(
    "/{enrollment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel Enrollment (ADMIN Only)",
)
@limiter.limit("20/minute")
async def cancel_enrollment(
    request: Request,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Cancel a student enrollment.

    **ADMIN ONLY** - Requires ADMIN role.

    **Security:**
    - RBAC: Only ADMIN can cancel enrollments
    - Rate limited: 20 requests per minute per IP
    - Decrements slot enrollment counter
    - Updates slot status if it was full
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with ID {enrollment_id} not found",
        )

    # Get associated time slot to update counter
    time_slot = enrollment.time_slot

    # Delete enrollment
    db.delete(enrollment)

    # Decrement enrollment counter
    if time_slot and time_slot.current_enrollments > 0:
        time_slot.current_enrollments -= 1

        # If slot was full, mark as active again
        if time_slot.status == SlotStatus.FULL:
            time_slot.status = SlotStatus.ACTIVE

    db.commit()

    return None


@router.post("/verify/{enrollment_id}", summary="Verify Enrollment Signature")
@limiter.limit("50/minute")
async def verify_enrollment_signature(
    request: Request, enrollment_id: int, db: Session = Depends(get_db)
):
    """
    Verify the digital signature of an enrollment.

    **Public endpoint** - Anyone can verify signatures for transparency.

    Returns whether the signature is valid (proving authenticity and non-repudiation).
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with ID {enrollment_id} not found",
        )

    # Reconstruct the signed data
    time_slot = enrollment.time_slot
    enrollment_receipt_data = {
        "student_id": enrollment.student_id,
        "project_id": time_slot.project_id if time_slot else None,
        "slot_id": enrollment.time_slot_id,
        "timestamp": enrollment.enrolled_at.isoformat(),
    }

    is_valid = crypto_service.verify_enrollment_receipt(
        enrollment_receipt_data, enrollment.signature
    )

    return {
        "enrollment_id": enrollment_id,
        "signature_valid": is_valid,
        "verified_at": datetime.utcnow().isoformat(),
    }
