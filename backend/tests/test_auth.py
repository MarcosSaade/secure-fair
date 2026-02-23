"""
Test suite for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.models.models import User, UserRole
from app.core.security import pwd_handler


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Create test database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def test_user(test_db):
    """Create a test user."""
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        password_hash=pwd_handler.hash_password("testpassword123"),
        role=UserRole.STUDENT,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


class TestAuthentication:
    """Test authentication endpoints."""
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 900  # 15 minutes
    
    def test_login_invalid_email(self, client):
        """Test login with invalid email."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with invalid password."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"
    
    def test_get_current_user(self, client, test_user):
        """Test getting current user info."""
        # Login first
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Get user info
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == "STUDENT"
        assert data["full_name"] == "Test User"
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without token."""
        response = client.get("/auth/me")
        assert response.status_code == 403  # No credentials provided


class TestRegistration:
    """Test user registration."""
    
    def test_register_student_success(self, client):
        """Test successful student registration."""
        response = client.post(
            "/auth/register",
            json={
                "email": "newstudent@example.com",
                "password": "password123",
                "full_name": "New Student",
                "role": "STUDENT",
                "student_id_number": "A01234567",
                "major": "Computer Science",
                "semester": 5
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newstudent@example.com"
        assert data["role"] == "STUDENT"
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123",
                "full_name": "Duplicate User",
                "role": "STUDENT",
                "student_id_number": "A07654321"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_register_student_missing_student_id(self, client):
        """Test student registration without student_id_number."""
        response = client.post(
            "/auth/register",
            json={
                "email": "student@example.com",
                "password": "password123",
                "full_name": "Student",
                "role": "STUDENT"
            }
        )
        assert response.status_code == 400
        assert "student_id_number is required" in response.json()["detail"]


class TestPasswordSecurity:
    """Test password security features."""
    
    def test_password_hashing(self):
        """Test password is properly hashed."""
        password = "testpassword123"
        hash1 = pwd_handler.hash_password(password)
        hash2 = pwd_handler.hash_password(password)
        
        # Hashes should be different (due to salt)
        assert hash1 != hash2
        
        # Both should verify correctly
        assert pwd_handler.verify_password(hash1, password)
        assert pwd_handler.verify_password(hash2, password)
    
    def test_password_verification_fails_wrong_password(self):
        """Test password verification fails with wrong password."""
        password = "testpassword123"
        password_hash = pwd_handler.hash_password(password)
        
        assert not pwd_handler.verify_password(password_hash, "wrongpassword")
