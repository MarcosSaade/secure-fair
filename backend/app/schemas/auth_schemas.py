"""
Pydantic schemas for authentication and authorization.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ==================== AUTH SCHEMAS ====================


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")

    model_config = {
        "json_schema_extra": {
            "example": {"email": "student@example.com", "password": "securepassword123"}
        }
    }


class UserResponse(BaseModel):
    """Schema for user information response."""

    id: int
    email: str
    role: str
    full_name: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "student@example.com",
                "role": "STUDENT",
                "full_name": "Juan Pérez",
                "created_at": "2024-01-15T10:30:00",
            }
        },
    }


class TokenResponse(BaseModel):
    """Schema for JWT token response (token only)."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")


class LoginResponse(BaseModel):
    """Schema for login response: token + user data in one call."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    user: UserResponse

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 900,
                "user": {
                    "id": 1,
                    "email": "student@example.com",
                    "role": "STUDENT",
                    "full_name": "Juan Pérez",
                    "created_at": "2024-01-15T10:30:00",
                },
            }
        }
    }


class RegisterRequest(BaseModel):
    """Schema for user registration."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")
    full_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., description="User role: STUDENT, SOCIO, or ADMIN")

    # Optional fields for students
    student_id_number: Optional[str] = Field(
        None, description="Student ID (required for STUDENT role)"
    )
    major: Optional[str] = Field(None, description="Student's major")
    semester: Optional[int] = Field(None, ge=1, le=12, description="Student's semester")

    # Optional fields for socios
    organization_id: Optional[int] = Field(
        None, description="Organization ID (required for SOCIO role)"
    )
    position: Optional[str] = Field(None, description="Position in organization")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "student@example.com",
                "password": "securepassword123",
                "full_name": "Juan Pérez",
                "role": "STUDENT",
                "student_id_number": "A01234567",
                "major": "Computer Science",
                "semester": 5,
            }
        }
    }


class PasswordChangeRequest(BaseModel):
    """Schema for password change."""

    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

    model_config = {
        "json_schema_extra": {
            "example": {
                "current_password": "oldpassword123",
                "new_password": "newsecurepassword456",
            }
        }
    }


# ==================== ENROLLMENT CODE SCHEMAS ====================


class EnrollmentCodeCreate(BaseModel):
    """Schema for creating enrollment codes."""

    project_id: int = Field(..., description="Project ID for the code")
    expiration_seconds: Optional[int] = Field(
        default=120, ge=60, le=300, description="Code expiration time in seconds"
    )

    model_config = {"json_schema_extra": {"example": {"project_id": 1, "expiration_seconds": 120}}}


class EnrollmentCodeResponse(BaseModel):
    """Schema for enrollment code response (includes plaintext code)."""

    code: str = Field(..., description="The enrollment code (shown only once)")
    project_id: int
    expires_at: datetime
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "code": "ABC123",
                "project_id": 1,
                "expires_at": "2024-01-15T10:32:00",
                "created_at": "2024-01-15T10:30:00",
            }
        }
    }


class CodeRedemptionRequest(BaseModel):
    """Schema for redeeming an enrollment code."""

    code: str = Field(..., min_length=6, max_length=6, description="The enrollment code")
    time_slot_id: int = Field(..., description="Time slot to enroll in")

    model_config = {"json_schema_extra": {"example": {"code": "ABC123", "time_slot_id": 5}}}


# ==================== ENROLLMENT SCHEMAS ====================


class EnrollmentCreate(BaseModel):
    """Schema for creating an enrollment."""

    time_slot_id: int = Field(..., description="Time slot ID to enroll in")

    model_config = {"json_schema_extra": {"example": {"time_slot_id": 5}}}


class EnrollmentResponse(BaseModel):
    """Schema for enrollment response with digital signature."""

    id: int
    student_id: int
    time_slot_id: int
    signature: str = Field(..., description="Ed25519 digital signature for receipt")
    enrolled_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "student_id": 1,
                "time_slot_id": 5,
                "signature": "a1b2c3d4e5f6...",
                "enrolled_at": "2024-01-15T10:30:00",
            }
        },
    }


# ==================== QR TOKEN SCHEMAS ====================


class QRTokenResponse(BaseModel):
    """Schema for QR token response."""

    token: str = Field(..., description="Signed QR token for check-in")
    student_id: int
    slot_id: int
    expires_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "token": "1|5|1705315200|a1b2c3d4e5f6...",
                "student_id": 1,
                "slot_id": 5,
                "expires_at": "2024-01-15T11:00:00",
            }
        }
    }


class CheckInRequest(BaseModel):
    """Schema for check-in using QR token."""

    qr_token: str = Field(..., description="The signed QR token")

    model_config = {
        "json_schema_extra": {"example": {"qr_token": "1|5|1705315200|a1b2c3d4e5f6..."}}
    }


class CheckInResponse(BaseModel):
    """Schema for check-in confirmation."""

    id: int
    enrollment_id: int
    student_id: int
    checked_in_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "enrollment_id": 1,
                "student_id": 1,
                "checked_in_at": "2024-01-15T09:00:00",
            }
        },
    }
