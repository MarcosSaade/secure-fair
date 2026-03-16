"""
Security utilities for password hashing and cryptographic operations.
Implements Argon2id for password hashing as per security requirements.
"""

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash


class PasswordHandler:
    """Handle password hashing and verification using Argon2id."""

    def __init__(self):
        """Initialize PasswordHasher with secure defaults."""
        self.ph = PasswordHasher(
            time_cost=2,  # Number of iterations
            memory_cost=65536,  # Memory usage in kibibytes (64 MB)
            parallelism=1,  # Number of parallel threads
            hash_len=32,  # Length of hash in bytes
            salt_len=16,  # Length of salt in bytes
        )

    def hash_password(self, password: str) -> str:
        """
        Hash a password using Argon2id.

        Args:
            password: Plain text password

        Returns:
            Hashed password string
        """
        return self.ph.hash(password)

    def verify_password(self, password_hash: str, password: str) -> bool:
        """
        Verify a password against its hash.

        Args:
            password_hash: The stored password hash
            password: The plain text password to verify

        Returns:
            True if password matches, False otherwise
        """
        try:
            self.ph.verify(password_hash, password)
            return True
        except (VerifyMismatchError, VerificationError, InvalidHash):
            return False

    def check_needs_rehash(self, password_hash: str) -> bool:
        """
        Check if password hash needs to be updated with new parameters.

        Args:
            password_hash: The stored password hash

        Returns:
            True if rehashing is recommended
        """
        return self.ph.check_needs_rehash(password_hash)


# Global password handler instance
pwd_handler = PasswordHandler()
