"""
Script to create initial admin user for Secure Fair.
Run this after setting up the database to create the first admin account.
"""
import sys
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine
from app.models.models import Base, User, UserRole
from app.core.security import pwd_handler


def create_admin_user(
    email: str,
    password: str,
    full_name: str = "System Administrator"
):
    """
    Create an admin user in the database.
    
    Args:
        email: Admin email
        password: Admin password (will be hashed)
        full_name: Admin's full name
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User with email {email} already exists!")
            return False
        
        # Hash password
        password_hash = pwd_handler.hash_password(password)
        
        # Create admin user
        admin_user = User(
            email=email,
            password_hash=password_hash,
            role=UserRole.ADMIN,
            full_name=full_name
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✓ Admin user created successfully!")
        print(f"  Email: {admin_user.email}")
        print(f"  Role: {admin_user.role.value}")
        print(f"  ID: {admin_user.id}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {e}")
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Secure Fair - Admin User Creation")
    print("=" * 60)
    print()
    
    if len(sys.argv) >= 3:
        # Use command line arguments
        email = sys.argv[1]
        password = sys.argv[2]
        full_name = sys.argv[3] if len(sys.argv) > 3 else "System Administrator"
    else:
        # Interactive mode
        print("Enter admin user details:")
        email = input("Email: ").strip()
        password = input("Password: ").strip()
        full_name = input("Full Name (default: System Administrator): ").strip() or "System Administrator"
    
    # Validate input
    if not email or not password:
        print("❌ Email and password are required!")
        sys.exit(1)
    
    if len(password) < 8:
        print("❌ Password must be at least 8 characters long!")
        sys.exit(1)
    
    print()
    print(f"Creating admin user: {email}")
    print()
    
    # Create admin user
    success = create_admin_user(email, password, full_name)
    
    if success:
        print()
        print("=" * 60)
        print("✓ Setup Complete!")
        print("=" * 60)
        print()
        print("You can now login with:")
        print(f"  Email: {email}")
        print(f"  Password: <your password>")
        print()
    else:
        sys.exit(1)
