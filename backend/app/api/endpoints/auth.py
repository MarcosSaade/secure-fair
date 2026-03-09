"""
Authentication endpoints for Secure Fair.
Implements login, registration, and user info endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.database import get_db
from app.models.models import User, Student, Socio, UserRole
from app.schemas.auth_schemas import (
    LoginRequest,
    TokenResponse,
    RegisterRequest,
    UserResponse,
    PasswordChangeRequest
)
from app.core.security import pwd_handler
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_user, get_current_active_user, get_current_admin
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
    request: Request,
    registration: RegisterRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Register a new user.
    
    Creates user account and associated Student or Socio record based on role.
    Passwords are hashed with Argon2id before storage.
    
    **Required fields:**
    - For STUDENT role: student_id_number
    - For SOCIO role: organization_id
    - For ADMIN role: no additional fields
    
    **Security:**
    - Password minimum length: 8 characters
    - Passwords hashed with Argon2id
    - Email must be unique
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == registration.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate role-specific requirements
    if registration.role == "STUDENT" and not registration.student_id_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id_number is required for STUDENT role"
        )
    
    if registration.role == "SOCIO" and not registration.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="organization_id is required for SOCIO role"
        )
    
    # Validate role value
    try:
        user_role = UserRole(registration.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"
        )
    
    # Hash password
    password_hash = pwd_handler.hash_password(registration.password)
    
    # Create user
    new_user = User(
        email=registration.email,
        password_hash=password_hash,
        role=user_role,
        full_name=registration.full_name
    )
    
    db.add(new_user)
    db.flush()  # Get user.id without committing
    
    # Create role-specific record
    if user_role == UserRole.STUDENT:
        # Check if student_id_number is unique
        existing_student = db.query(Student).filter(
            Student.student_id_number == registration.student_id_number
        ).first()
        if existing_student:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID number already registered"
            )
        
        student = Student(
            user_id=new_user.id,
            student_id_number=registration.student_id_number,
            major=registration.major,
            semester=registration.semester
        )
        db.add(student)
    
    elif user_role == UserRole.SOCIO:
        # Verify organization exists
        from app.models.models import Organization
        org = db.query(Organization).filter(
            Organization.id == registration.organization_id
        ).first()
        if not org:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        socio = Socio(
            user_id=new_user.id,
            organization_id=registration.organization_id,
            position=registration.position
        )
        db.add(socio)
    
    # Commit transaction
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    
    **Authentication Flow:**
    1. Verify email exists
    2. Verify password hash with Argon2id
    3. Generate JWT token with user claims
    
    **Token Claims:**
    - sub: user_id
    - email: user's email
    - role: USER role (ADMIN, SOCIO, STUDENT)
    - exp: expiration timestamp
    - iat: issued at timestamp
    
    **Token Duration:** 15 minutes (configured in settings)
    
    **Security:**
    - Constant-time password comparison
    - Fail-secure: returns same error for invalid email or password
    """
    # Retrieve user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # Fail-secure: same error message whether email or password is wrong
    if not user or not pwd_handler.verify_password(user.password_hash, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if password needs rehashing (due to updated security parameters)
    if pwd_handler.check_needs_rehash(user.password_hash):
        user.password_hash = pwd_handler.hash_password(credentials.password)
        db.commit()
    
    # Generate JWT token
    access_token = auth_service.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
@limiter.limit("100/minute")
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    
    **Headers:**
    - Authorization: Bearer <token>
    
    **Returns:**
    - User information (id, email, role, full_name, created_at)
    """
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def change_password(
    request: Request,
    password_change: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    Requires:
    - Valid JWT token
    - Current password for verification
    - New password (minimum 8 characters)
    
    **Security:**
    - Verifies current password before allowing change
    - New password hashed with Argon2id
    """
    # Verify current password
    if not pwd_handler.verify_password(current_user.password_hash, password_change.current_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Hash and update new password
    current_user.password_hash = pwd_handler.hash_password(password_change.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/logout", status_code=status.HTTP_200_OK)
@limiter.limit("100/minute")
async def logout(request: Request, current_user: User = Depends(get_current_active_user)):
    """
    Logout current user.
    
    Note: In a stateless JWT implementation, actual logout happens on the client
    by deleting the token from storage. This endpoint exists for consistency
    and can be extended with token blacklisting if needed.
    
    **Client Action Required:**
    - Delete JWT token from localStorage/sessionStorage
    """
    return {"message": "Logged out successfully. Please delete your token on the client."}
