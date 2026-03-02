"""
Database models for Secure Fair application.
Implements the complete schema as per technical design.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey,
    Text, Enum as SQLEnum, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "ADMIN"
    SOCIO = "SOCIO"
    STUDENT = "STUDENT"


class SlotStatus(str, enum.Enum):
    """Time slot status enumeration."""
    ACTIVE = "ACTIVE"
    FULL = "FULL"
    CANCELLED = "CANCELLED"


# ==================== MODELS ====================

class User(Base):
    """
    User model for authentication and authorization.
    Stores credentials and role information.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    socio = relationship("Socio", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class Organization(Base):
    """
    Organization (Socioformador) model.
    Represents external organizations hosting projects.
    """
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="organization")
    socios = relationship("Socio", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization {self.name}>"


class Socio(Base):
    """
    Socioformador (partner) model.
    Links users with SOCIO role to organizations and projects.
    """
    __tablename__ = "socios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    position = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="socio")
    organization = relationship("Organization", back_populates="socios")
    projects = relationship("Project", back_populates="socio")
    
    def __repr__(self):
        return f"<Socio {self.id} - Org: {self.organization_id}>"


class Project(Base):
    """
    Project model representing social responsibility projects.
    Each project belongs to an organization and has multiple time slots.
    """
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    
    # Max students allowed per time slot
    max_students_per_slot = Column(Integer, nullable=False, default=30)
    
    # Project status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    socio = relationship("Socio", back_populates="projects")
    slots = relationship("TimeSlot", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project {self.name}>"


class TimeSlot(Base):
    """
    Time slot model for project scheduling.
    Students register for specific time slots within projects.
    """
    __tablename__ = "time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    # Capacity management
    capacity = Column(Integer, nullable=False)
    current_enrollments = Column(Integer, default=0, nullable=False)
    
    # Status
    status = Column(SQLEnum(SlotStatus), default=SlotStatus.ACTIVE, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="slots")
    enrollments = relationship("Enrollment", back_populates="time_slot")
    
    # Indexes
    __table_args__ = (
        Index('ix_time_slots_start_time', 'start_time'),
        Index('ix_time_slots_project_time', 'project_id', 'start_time'),
    )
    
    def __repr__(self):
        return f"<TimeSlot {self.id} - Project: {self.project_id}>"


class Student(Base):
    """
    Student model.
    Links users with STUDENT role to their academic information.
    """
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    student_id_number = Column(String(50), unique=True, nullable=False, index=True)
    major = Column(String(255), nullable=True)
    semester = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    check_ins = relationship("CheckIn", back_populates="student")
    
    def __repr__(self):
        return f"<Student {self.student_id_number}>"


class EnrollmentCode(Base):
    """
    Enrollment code model.
    Stores HMAC-hashed codes generated by socioformadores.
    Codes are single-use and time-limited.
    """
    __tablename__ = "enrollment_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # HMAC hash of the actual code (not stored in plaintext)
    code_hash = Column(String(64), nullable=False, unique=True, index=True)
    
    # Expiration and usage
    expires_at = Column(DateTime, nullable=False, index=True)
    is_used = Column(Boolean, default=False, nullable=False)
    used_by_student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    used_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_by_socio_id = Column(Integer, ForeignKey("socios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project")
    student = relationship("Student")
    socio = relationship("Socio")
    
    def __repr__(self):
        return f"<EnrollmentCode {self.id} - Project: {self.project_id}>"


class Enrollment(Base):
    """
    Enrollment model representing student registration in time slots.
    Includes digital signature for authenticity and non-repudiation.
    """
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    
    # Digital signature (Ed25519) for receipt authenticity
    signature = Column(String(128), nullable=False)
    
    # Enrollment metadata
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Code redemption (optional - if enrolled via code)
    enrollment_code_id = Column(Integer, ForeignKey("enrollment_codes.id"), nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="enrollments")
    time_slot = relationship("TimeSlot", back_populates="enrollments")
    enrollment_code = relationship("EnrollmentCode")
    check_in = relationship("CheckIn", back_populates="enrollment", uselist=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('student_id', 'time_slot_id', name='uq_student_slot'),
        Index('ix_enrollments_student', 'student_id'),
        Index('ix_enrollments_slot', 'time_slot_id'),
    )
    
    def __repr__(self):
        return f"<Enrollment Student: {self.student_id} Slot: {self.time_slot_id}>"


class CheckIn(Base):
    """
    Check-in model for physical attendance verification.
    Uses QR code tokens with digital signatures.
    """
    __tablename__ = "check_ins"
    
    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # Check-in timestamp
    checked_in_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # QR token used for check-in (for audit purposes)
    qr_token = Column(Text, nullable=True)
    
    # Admin who verified the check-in (optional)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    enrollment = relationship("Enrollment", back_populates="check_in")
    student = relationship("Student", back_populates="check_ins")
    verified_by = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('ix_check_ins_student', 'student_id'),
        Index('ix_check_ins_time', 'checked_in_at'),
    )
    
    def __repr__(self):
        return f"<CheckIn Enrollment: {self.enrollment_id}>"
