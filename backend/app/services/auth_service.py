"""
Authentication service for JWT token generation and validation.
Implements HS256 JWT tokens with role-based claims.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.core.config import settings


class AuthService:
    """Handle JWT token operations and authentication logic."""

    def __init__(self):
        """Initialize auth service with configuration."""
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def create_access_token(
        self,
        user_id: int,
        email: str,
        role: str,
        additional_claims: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Create a JWT access token.

        Token payload includes:
        - sub: user_id (subject)
        - email: user's email
        - role: user's role (ADMIN, SOCIO, STUDENT)
        - exp: expiration timestamp
        - iat: issued at timestamp

        Args:
            user_id: The user's unique identifier
            email: The user's email address
            role: The user's role
            additional_claims: Optional extra claims to include

        Returns:
            Encoded JWT token string
        """
        now = datetime.utcnow()
        expire = now + timedelta(minutes=self.access_token_expire_minutes)

        payload = {"sub": str(user_id), "email": email, "role": role, "exp": expire, "iat": now}

        # Add any additional claims
        if additional_claims:
            payload.update(additional_claims)

        encoded_jwt = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

        return encoded_jwt

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify and decode a JWT token.

        Args:
            token: The JWT token to verify

        Returns:
            Decoded token payload

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

    def get_user_id_from_token(self, token: str) -> int:
        """
        Extract user ID from a valid token.

        Args:
            token: The JWT token

        Returns:
            User ID as integer
        """
        payload = self.verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user ID"
            )
        return int(user_id)

    def get_role_from_token(self, token: str) -> str:
        """
        Extract role from a valid token.

        Args:
            token: The JWT token

        Returns:
            User role string
        """
        payload = self.verify_token(token)
        role = payload.get("role")
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing role"
            )
        return role

    def validate_token_not_expired(self, token: str) -> bool:
        """
        Check if token is not expired.

        Args:
            token: The JWT token

        Returns:
            True if token is valid and not expired
        """
        try:
            payload = self.verify_token(token)
            exp = payload.get("exp")
            if exp is None:
                return False

            expiration = datetime.fromtimestamp(exp)
            return datetime.utcnow() < expiration
        except HTTPException:
            return False


# Global auth service instance
auth_service = AuthService()
