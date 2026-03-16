"""
Organization endpoints for Secure Fair.
ADMIN-only CRUD operations for organizations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Organization, User
from app.core.dependencies import get_current_admin
from app.core.config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address


router = APIRouter(prefix="/organizations", tags=["Organizations"])
limiter = Limiter(key_func=get_remote_address)


# ==================== PYDANTIC SCHEMAS ====================

from pydantic import BaseModel, Field
from datetime import datetime


class OrganizationCreate(BaseModel):
    """Schema for creating a new organization."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    contact_email: str | None = Field(None, max_length=255)
    contact_phone: str | None = Field(None, max_length=50)


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    contact_email: str | None = Field(None, max_length=255)
    contact_phone: str | None = Field(None, max_length=50)


class OrganizationResponse(BaseModel):
    """Schema for organization response."""
    id: int
    name: str
    description: str | None
    contact_email: str | None
    contact_phone: str | None
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True


# ==================== ENDPOINTS ====================

@router.post(
    "/",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Organization (ADMIN Only)"
)
@limiter.limit("20/minute")
async def create_organization(
    request: Request,
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Create a new organization.
    
    **ADMIN ONLY** - Requires ADMIN role.
    
    **Security:**
    - RBAC: Only users with ADMIN role can create organizations
    - Rate limited: 20 requests per minute per IP
    """
    # Check for duplicate organization name
    existing = db.query(Organization).filter(
        Organization.name == org_data.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization with name '{org_data.name}' already exists"
        )
    
    new_org = Organization(**org_data.model_dump())
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return new_org


@router.get(
    "/",
    response_model=List[OrganizationResponse],
    summary="List All Organizations"
)
@limiter.limit("100/minute")
async def list_organizations(
    request: Request,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve all organizations.
    
    **Public endpoint** - No authentication required for listing.
    
    **Pagination:**
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 100)
    """
    organizations = db.query(Organization).offset(skip).limit(min(limit, 100)).all()
    return organizations


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
    summary="Get Organization by ID"
)
@limiter.limit("100/minute")
async def get_organization(
    request: Request,
    organization_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific organization by ID.
    
    **Public endpoint** - No authentication required.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found"
        )
    
    return org


@router.put(
    "/{organization_id}",
    response_model=OrganizationResponse,
    summary="Update Organization (ADMIN Only)"
)
@limiter.limit("20/minute")
async def update_organization(
    request: Request,
    organization_id: int,
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Update an existing organization.
    
    **ADMIN ONLY** - Requires ADMIN role.
    
    **Security:**
    - RBAC: Only users with ADMIN role can update organizations
    - Rate limited: 20 requests per minute per IP
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found"
        )
    
    # Update only provided fields
    update_data = org_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(org, field, value)
    
    db.commit()
    db.refresh(org)
    
    return org


@router.delete(
    "/{organization_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Organization (ADMIN Only)"
)
@limiter.limit("10/minute")
async def delete_organization(
    request: Request,
    organization_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Delete an organization.
    
    **ADMIN ONLY** - Requires ADMIN role.
    
    **Security:**
    - RBAC: Only users with ADMIN role can delete organizations
    - Rate limited: 10 requests per minute per IP
    
    **Warning:** This will cascade delete all associated projects and data.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found"
        )
    
    db.delete(org)
    db.commit()
    
    return None
