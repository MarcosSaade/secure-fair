"""
Security dependencies for FastAPI endpoints.
Implements authentication and role-based access control (RBAC).
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Student, Socio
from app.services.auth_service import auth_service


# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials containing JWT token
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Verify and decode token
    payload = auth_service.verify_token(token)
    user_id = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retrieve user from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user is active.
    Can be extended with user.is_active field if needed.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active user
    """
    # Currently all users are considered active
    # Can add is_active field to User model later
    return current_user


def require_role(*allowed_roles: str):
    """
    Dependency factory to require specific roles.
    
    Usage:
        @router.get("/admin/dashboard")
        async def get_dashboard(user = Depends(require_role("ADMIN"))):
            ...
    
    Args:
        allowed_roles: One or more role names that are allowed
        
    Returns:
        Dependency function that validates user role
    """
    async def role_checker(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """Check if current user has required role."""
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker


# ==================== ROLE-SPECIFIC DEPENDENCIES ====================

async def get_current_admin(
    current_user: User = Depends(require_role("ADMIN"))
) -> User:
    """
    Dependency to get current user as admin.
    Ensures user has ADMIN role.
    """
    return current_user


async def get_current_socio(
    current_user: User = Depends(require_role("SOCIO")),
    db: Session = Depends(get_db)
) -> Socio:
    """
    Dependency to get current user as socio.
    Returns Socio model with organization information.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Socio model instance
        
    Raises:
        HTTPException: If socio record not found
    """
    socio = db.query(Socio).filter(Socio.user_id == current_user.id).first()
    
    if socio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Socio record not found"
        )
    
    return socio


async def get_current_student(
    current_user: User = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db)
) -> Student:
    """
    Dependency to get current user as student.
    Returns Student model with academic information.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Student model instance
        
    Raises:
        HTTPException: If student record not found
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found"
        )
    
    return student


# ==================== OPTIONAL USER DEPENDENCIES ====================

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to get current user if token is provided, None otherwise.
    Useful for endpoints that work differently for authenticated users.
    
    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session
        
    Returns:
        User if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = auth_service.verify_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user
    except HTTPException:
        return None
