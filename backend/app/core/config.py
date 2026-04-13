"""
Configuration settings for Secure Fair application.
Loads settings from .env file with validation.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator
import json


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database
    DATABASE_URL: str
    
    # Security - JWT
    JWT_SECRET_KEY: str
    CODE_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    ALGORITHM: str = "HS256"
    
    # Security - Ed25519 Keys
    SIGNING_PRIVATE_KEY: str
    SIGNING_PUBLIC_KEY: str
    
    # Code Configuration
    ENROLLMENT_CODE_EXPIRE_SECONDS: int = 120
    ENROLLMENT_CODE_LENGTH: int = 6

    # Student signature flow
    SIGNATURE_CHALLENGE_EXPIRE_SECONDS: int = 120
    REGISTRATION_WINDOW_EXPIRE_MINUTES: int = 10
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from JSON string or list."""
        if isinstance(v, str):
            return json.loads(v)
        return v
    
    @field_validator("ENROLLMENT_CODE_EXPIRE_SECONDS")
    @classmethod
    def validate_enrollment_code_expiration(cls, value: int) -> int:
        """Keep enrollment code expiration within the supported security window."""
        if value < 60 or value > 120:
            raise ValueError("ENROLLMENT_CODE_EXPIRE_SECONDS must be between 60 and 120 seconds")
        return value

    @field_validator("SIGNATURE_CHALLENGE_EXPIRE_SECONDS")
    @classmethod
    def validate_signature_challenge_expiration(cls, value: int) -> int:
        """Keep challenge validity in a short-lived secure range."""
        if value < 60 or value > 300:
            raise ValueError("SIGNATURE_CHALLENGE_EXPIRE_SECONDS must be between 60 and 300 seconds")
        return value

    @field_validator("REGISTRATION_WINDOW_EXPIRE_MINUTES")
    @classmethod
    def validate_registration_window_expiration(cls, value: int) -> int:
        """Registration window must be short-lived and bounded."""
        if value < 1 or value > 60:
            raise ValueError("REGISTRATION_WINDOW_EXPIRE_MINUTES must be between 1 and 60 minutes")
        return value
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
