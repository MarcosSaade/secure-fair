"""
Enrollment endpoints for Secure Fair.
Student enrollment with cryptographic protections and duplicate prevention.
"""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.dependencies import get_current_admin, get_current_student
from app.db.database import get_db
from app.models.models import (
    Enrollment,
    EnrollmentCode,
    RegistrationWindow,
    SlotStatus,
    Student,
    TimeSlot,
    User,
)
from app.services.crypto_service import crypto_service


router = APIRouter(prefix="/enrollments", tags=["Enrollments"])
limiter = Limiter(key_func=get_remote_address)


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

    Requires a valid registration window activated by ADMIN.
    """
    now_utc = datetime.now(timezone.utc)

    active_window = (
        db.query(RegistrationWindow)
        .filter(
            RegistrationWindow.student_id == current_student.id,
            RegistrationWindow.is_used.is_(False),
            RegistrationWindow.expires_at > now_utc,
        )
        .order_by(RegistrationWindow.opened_at.desc())
        .first()
    )
    if not active_window:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration window is not active. Complete signature verification and admin activation first.",
        )

    time_slot = db.query(TimeSlot).filter(TimeSlot.id == enrollment_data.time_slot_id).first()
    if not time_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time slot with ID {enrollment_data.time_slot_id} not found",
        )

    if time_slot.status == SlotStatus.CANCELLED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This time slot has been cancelled")

    if time_slot.status == SlotStatus.FULL or time_slot.current_enrollments >= time_slot.capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This time slot is full")

    code_hash = crypto_service.hash_enrollment_code(enrollment_data.enrollment_code)
    enrollment_code = (
        db.query(EnrollmentCode)
        .filter(
            EnrollmentCode.code_hash == code_hash,
            EnrollmentCode.project_id == time_slot.project_id,
        )
        .first()
    )

    if not enrollment_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid enrollment code")

    if crypto_service.is_enrollment_code_expired(enrollment_code.expires_at):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enrollment code has expired")

    if enrollment_code.is_used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enrollment code has already been used")

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

    enrollment_receipt_data = {
        "student_id": current_student.id,
        "project_id": time_slot.project_id,
        "slot_id": time_slot.id,
        "timestamp": now_utc.isoformat(),
    }
    signature = crypto_service.sign_enrollment_receipt(enrollment_receipt_data)

    new_enrollment = Enrollment(
        student_id=current_student.id,
        time_slot_id=enrollment_data.time_slot_id,
        signature=signature,
        enrollment_code_id=enrollment_code.id,
    )

    enrollment_code.is_used = True
    enrollment_code.used_by_student_id = current_student.id
    enrollment_code.used_at = now_utc

    active_window.is_used = True
    active_window.used_at = now_utc

    time_slot.current_enrollments += 1
    if time_slot.current_enrollments >= time_slot.capacity:
        time_slot.status = SlotStatus.FULL

    try:
        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)
    except IntegrityError as e:
        db.rollback()
        if "uq_student_slot" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate enrollment detected: You are already enrolled in this time slot",
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error occurred")

    return new_enrollment


@router.get("/my-enrollments", response_model=List[EnrollmentDetailResponse], summary="Get My Enrollments")
@limiter.limit("100/minute")
async def get_my_enrollments(
    request: Request,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Get all enrollments for the current student."""
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_student.id).all()

    detailed_enrollments = []
    for enrollment in enrollments:
        detailed_enrollments.append(
            EnrollmentDetailResponse(
                id=enrollment.id,
                student_id=enrollment.student_id,
                time_slot_id=enrollment.time_slot_id,
                signature=enrollment.signature,
                enrolled_at=enrollment.enrolled_at,
                student_id_number=current_student.student_id_number,
                project_name=enrollment.time_slot.project.name if enrollment.time_slot and enrollment.time_slot.project else None,
                slot_start_time=enrollment.time_slot.start_time if enrollment.time_slot else None,
                slot_end_time=enrollment.time_slot.end_time if enrollment.time_slot else None,
            )
        )

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
    """Get all enrollments for a specific time slot."""
    _ = current_admin
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == time_slot_id).first()
    if not time_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time slot with ID {time_slot_id} not found",
        )

    return db.query(Enrollment).filter(Enrollment.time_slot_id == time_slot_id).all()


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Cancel Enrollment (ADMIN Only)")
@limiter.limit("20/minute")
async def cancel_enrollment(
    request: Request,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Cancel a student enrollment."""
    _ = current_admin
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with ID {enrollment_id} not found",
        )

    time_slot = enrollment.time_slot
    db.delete(enrollment)

    if time_slot and time_slot.current_enrollments > 0:
        time_slot.current_enrollments -= 1
        if time_slot.status == SlotStatus.FULL:
            time_slot.status = SlotStatus.ACTIVE

    db.commit()
    return None


@router.post("/verify/{enrollment_id}", summary="Verify Enrollment Signature")
@limiter.limit("50/minute")
async def verify_enrollment_signature(
    request: Request,
    enrollment_id: int,
    db: Session = Depends(get_db),
):
    """Verify the digital signature of an enrollment."""
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with ID {enrollment_id} not found",
        )

    time_slot = enrollment.time_slot
    enrollment_receipt_data = {
        "student_id": enrollment.student_id,
        "project_id": time_slot.project_id if time_slot else None,
        "slot_id": enrollment.time_slot_id,
        "timestamp": enrollment.enrolled_at.isoformat(),
    }

    is_valid = crypto_service.verify_enrollment_receipt(enrollment_receipt_data, enrollment.signature)

    return {
        "enrollment_id": enrollment_id,
        "signature_valid": is_valid,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }
