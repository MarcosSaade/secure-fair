"""
Initialize database with sample data for development.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine
from app.models.models import (
    Base, User, UserRole, Organization, Socio, Project,
    TimeSlot, SlotStatus, Student
)
from app.core.security import pwd_handler


def init_db():
    """Initialize database with sample data."""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        print("Initializing database with sample data...")
        print()
        
        # Check if data already exists
        if db.query(User).count() > 0:
            print("⚠️  Database already contains data. Skipping initialization.")
            return
        
        # Create admin user
        print("Creating admin user...")
        admin = User(
            email="admin@securefair.com",
            password_hash=pwd_handler.hash_password("admin123"),
            role=UserRole.ADMIN,
            full_name="System Administrator"
        )
        db.add(admin)
        db.flush()
        print(f"✓ Admin created: {admin.email}")
        
        # Create organization
        print("\nCreating organization...")
        org = Organization(
            name="Banco de Alimentos de México",
            description="Organización dedicada a combatir el hambre en México",
            contact_email="contacto@bamx.org.mx",
            contact_phone="+52 55 1234 5678"
        )
        db.add(org)
        db.flush()
        print(f"✓ Organization created: {org.name}")
        
        # Create socio user
        print("\nCreating socioformador user...")
        socio_user = User(
            email="socio@bamx.org.mx",
            password_hash=pwd_handler.hash_password("socio123"),
            role=UserRole.SOCIO,
            full_name="María González"
        )
        db.add(socio_user)
        db.flush()
        
        socio = Socio(
            user_id=socio_user.id,
            organization_id=org.id,
            position="Coordinadora de Voluntariado"
        )
        db.add(socio)
        db.flush()
        print(f"✓ Socio created: {socio_user.email}")
        
        # Create project
        print("\nCreating project...")
        project = Project(
            organization_id=org.id,
            socio_id=socio.id,
            name="Clasificación y Empaque de Alimentos",
            description="Ayuda a clasificar y empacar alimentos para familias necesitadas. Se requiere compromiso y trabajo en equipo.",
            location="Centro de Distribución CDMX - Av. Insurgentes Sur 1234",
            max_students_per_slot=30,
            is_active=True
        )
        db.add(project)
        db.flush()
        print(f"✓ Project created: {project.name}")
        
        # Create time slots
        print("\nCreating time slots...")
        base_date = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
        base_date = base_date + timedelta(days=7)  # Next week
        
        slots_created = 0
        for day_offset in range(3):  # 3 days
            for hour_offset in [0, 3, 6]:  # 9:00, 12:00, 15:00
                start_time = base_date + timedelta(days=day_offset, hours=hour_offset)
                end_time = start_time + timedelta(hours=3)
                
                slot = TimeSlot(
                    project_id=project.id,
                    start_time=start_time,
                    end_time=end_time,
                    capacity=30,
                    current_enrollments=0,
                    status=SlotStatus.ACTIVE
                )
                db.add(slot)
                slots_created += 1
        
        db.flush()
        print(f"✓ Time slots created: {slots_created}")
        
        # Create student users
        print("\nCreating student users...")
        students_created = 0
        for i in range(3):
            student_user = User(
                email=f"student{i+1}@tec.mx",
                password_hash=pwd_handler.hash_password("student123"),
                role=UserRole.STUDENT,
                full_name=f"Estudiante {i+1}"
            )
            db.add(student_user)
            db.flush()
            
            student = Student(
                user_id=student_user.id,
                student_id_number=f"A0123456{i}",
                major="Ingeniería en Tecnologías Computacionales",
                semester=5 + i
            )
            db.add(student)
            students_created += 1
        
        db.flush()
        print(f"✓ Students created: {students_created}")
        
        # Commit all changes
        db.commit()
        
        print()
        print("=" * 60)
        print("✓ Database initialized successfully!")
        print("=" * 60)
        print()
        print("Sample credentials:")
        print()
        print("ADMIN:")
        print("  Email: admin@securefair.com")
        print("  Password: admin123")
        print()
        print("SOCIO:")
        print("  Email: socio@bamx.org.mx")
        print("  Password: socio123")
        print()
        print("STUDENTS:")
        print("  Email: student1@tec.mx, student2@tec.mx, student3@tec.mx")
        print("  Password: student123")
        print()
        print("=" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error initializing database: {e}")
        raise
        
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
