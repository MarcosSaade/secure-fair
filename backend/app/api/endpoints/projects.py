"""
Project endpoints for Secure Fair.
ADMIN and SOCIO role management for projects.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Project, Organization, Socio, User, UserRole
from app.core.dependencies import get_current_admin, get_current_socio, get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address


router = APIRouter(prefix="/projects", tags=["Projects"])
limiter = Limiter(key_func=get_remote_address)


# ==================== PYDANTIC SCHEMAS ====================

from pydantic import BaseModel, Field
from datetime import datetime


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""
    organization_id: int
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1, max_length=255)
    max_students_per_slot: int = Field(default=30, ge=1, le=100)
    is_active: bool = True


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    location: str | None = Field(None, min_length=1, max_length=255)
    max_students_per_slot: int | None = Field(None, ge=1, le=100)
    is_active: bool | None = None


class ProjectResponse(BaseModel):
    """Schema for project response."""
    id: int
    organization_id: int
    socio_id: int
    name: str
    description: str
    location: str
    max_students_per_slot: int
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True


# ==================== ENDPOINTS ====================

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Project (ADMIN Only)"
)
@limiter.limit("20/minute")
async def create_project(
    request: Request,
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Create a new project.
    
    **ADMIN ONLY** - Requires ADMIN role.
    
    ADMIN can assign projects to any organization and socio.
    
    **Security:**
    - RBAC: Only users with ADMIN role can create projects
    - Rate limited: 20 requests per minute per IP
    - Validates organization and socio existence
    """
    # Verify organization exists
    org = db.query(Organization).filter(
        Organization.id == project_data.organization_id
    ).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {project_data.organization_id} not found"
        )
    
    # Get first socio from the organization (or create logic to assign)
    # For now, we'll require a socio_id in a production system
    # Using first available socio as proof of concept
    socio = db.query(Socio).filter(
        Socio.organization_id == project_data.organization_id
    ).first()
    
    if not socio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No socio found for organization {project_data.organization_id}. Create a socio user first."
        )
    
    new_project = Project(
        **project_data.model_dump(),
        socio_id=socio.id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return new_project


@router.get(
    "/",
    response_model=List[ProjectResponse],
    summary="List All Projects"
)
@limiter.limit("100/minute")
async def list_projects(
    request: Request,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = None,
    organization_id: int | None = None
):
    """
    Retrieve all projects with optional filtering.
    
    **Public endpoint** - No authentication required for listing.
    
    **Filters:**
    - is_active: Filter by active status (true/false)
    - organization_id: Filter by organization
    
    **Pagination:**
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 100)
    """
    query = db.query(Project)
    
    if is_active is not None:
        query = query.filter(Project.is_active == is_active)
    
    if organization_id is not None:
        query = query.filter(Project.organization_id == organization_id)
    
    projects = query.offset(skip).limit(min(limit, 100)).all()
    return projects


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get Project by ID"
)
@limiter.limit("100/minute")
async def get_project(
    request: Request,
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific project by ID.
    
    **Public endpoint** - No authentication required.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update Project (ADMIN or Assigned SOCIO)"
)
@limiter.limit("20/minute")
async def update_project(
    request: Request,
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing project.
    
    **Authorization:**
    - ADMIN: Can update any project
    - SOCIO: Can only update their own assigned projects
    
    **Security:**
    - RBAC: ADMIN or assigned SOCIO only
    - Rate limited: 20 requests per minute per IP
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.SOCIO:
        # SOCIO can only update their own projects
        socio = db.query(Socio).filter(Socio.user_id == current_user.id).first()
        if not socio or project.socio_id != socio.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update projects assigned to you"
            )
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ADMIN or assigned SOCIO can update projects"
        )
    
    # Update only provided fields
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return project


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Project (ADMIN Only)"
)
@limiter.limit("10/minute")
async def delete_project(
    request: Request,
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Delete a project.
    
    **ADMIN ONLY** - Requires ADMIN role.
    
    **Security:**
    - RBAC: Only users with ADMIN role can delete projects
    - Rate limited: 10 requests per minute per IP
    
    **Warning:** This will cascade delete all associated time slots and enrollments.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    db.delete(project)
    db.commit()
    
    return None
