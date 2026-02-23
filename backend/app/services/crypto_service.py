"""
Cryptographic services for Secure Fair.
Implements Ed25519 signatures and HMAC-based code hashing.
"""
import hmac
import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional

import nacl.signing
import nacl.encoding
from app.core.config import settings


class CryptoService:
    """Handle cryptographic operations for the application."""
    
    def __init__(self):
        """Initialize crypto service with keys from configuration."""
        # Ed25519 keys for digital signatures
        self.private_key = nacl.signing.SigningKey(
            settings.SIGNING_PRIVATE_KEY.encode(),
            encoder=nacl.encoding.HexEncoder
        )
        self.verify_key = nacl.signing.VerifyKey(
            settings.SIGNING_PUBLIC_KEY.encode(),
            encoder=nacl.encoding.HexEncoder
        )
        
        # HMAC secret for code hashing
        self.code_secret = settings.CODE_SECRET_KEY.encode()
    
    # ==================== ENROLLMENT CODE OPERATIONS ====================
    
    def generate_enrollment_code(self, length: Optional[int] = None) -> str:
        """
        Generate a cryptographically secure random enrollment code.
        
        Args:
            length: Length of code (default from settings)
            
        Returns:
            Random alphanumeric code (uppercase)
        """
        code_length = length or settings.ENROLLMENT_CODE_LENGTH
        alphabet = string.ascii_uppercase + string.digits
        code = ''.join(secrets.choice(alphabet) for _ in range(code_length))
        return code
    
    def hash_enrollment_code(self, code: str) -> str:
        """
        Hash enrollment code using HMAC-SHA256.
        
        This prevents storing codes in plaintext while allowing verification.
        Uses constant-time comparison to prevent timing attacks.
        
        Args:
            code: The enrollment code to hash
            
        Returns:
            Hexadecimal hash of the code
        """
        return hmac.new(
            self.code_secret,
            code.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def verify_enrollment_code(self, code: str, code_hash: str) -> bool:
        """
        Verify an enrollment code against its hash in constant time.
        
        Args:
            code: The code to verify
            code_hash: The stored hash
            
        Returns:
            True if code matches hash, False otherwise
        """
        expected_hash = self.hash_enrollment_code(code)
        return hmac.compare_digest(expected_hash, code_hash)
    
    # ==================== DIGITAL SIGNATURES (Ed25519) ====================
    
    def sign_enrollment_receipt(self, data: dict) -> str:
        """
        Create a digital signature for enrollment receipt.
        
        This provides authenticity and non-repudiation for enrollments.
        
        Args:
            data: Dictionary containing enrollment data
                  (student_id, project_id, slot_id, timestamp)
            
        Returns:
            Hexadecimal signature string
        """
        # Create canonical string representation
        message = self._create_canonical_message(data)
        
        # Sign the message
        signed = self.private_key.sign(
            message.encode(),
            encoder=nacl.encoding.HexEncoder
        )
        
        # Return just the signature part
        return signed.signature.decode()
    
    def verify_enrollment_receipt(self, data: dict, signature: str) -> bool:
        """
        Verify the digital signature of an enrollment receipt.
        
        Args:
            data: Dictionary containing enrollment data
            signature: The signature to verify
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            message = self._create_canonical_message(data)
            
            # Verify the signature
            self.verify_key.verify(
                message.encode(),
                bytes.fromhex(signature)
            )
            return True
        except nacl.exceptions.BadSignatureError:
            return False
    
    def _create_canonical_message(self, data: dict) -> str:
        """
        Create a canonical string representation of data for signing.
        
        Format: "student_id|project_id|slot_id|timestamp"
        
        Args:
            data: Dictionary with required fields
            
        Returns:
            Canonical string representation
        """
        required_fields = ['student_id', 'project_id', 'slot_id', 'timestamp']
        values = [str(data.get(field, '')) for field in required_fields]
        return '|'.join(values)
    
    # ==================== QR TOKEN GENERATION ====================
    
    def generate_qr_token(self, student_id: int, slot_id: int, 
                         expiration_minutes: int = 30) -> str:
        """
        Generate a signed token for QR code check-in.
        
        Format: "student_id|slot_id|expiration_timestamp|signature"
        
        Args:
            student_id: The student's ID
            slot_id: The time slot ID
            expiration_minutes: Token validity duration
            
        Returns:
            Signed token string
        """
        expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
        expiration_ts = int(expiration.timestamp())
        
        data = {
            'student_id': student_id,
            'slot_id': slot_id,
            'expiration': expiration_ts
        }
        
        message = f"{student_id}|{slot_id}|{expiration_ts}"
        signature = self.private_key.sign(
            message.encode(),
            encoder=nacl.encoding.HexEncoder
        ).signature.decode()
        
        return f"{message}|{signature}"
    
    def verify_qr_token(self, token: str) -> Optional[dict]:
        """
        Verify and parse a QR token.
        
        Args:
            token: The token string to verify
            
        Returns:
            Dictionary with student_id and slot_id if valid, None otherwise
        """
        try:
            parts = token.split('|')
            if len(parts) != 4:
                return None
            
            student_id, slot_id, expiration_ts, signature = parts
            
            # Check expiration
            if int(expiration_ts) < int(datetime.utcnow().timestamp()):
                return None
            
            # Verify signature
            message = f"{student_id}|{slot_id}|{expiration_ts}"
            self.verify_key.verify(
                message.encode(),
                bytes.fromhex(signature)
            )
            
            return {
                'student_id': int(student_id),
                'slot_id': int(slot_id)
            }
        except (ValueError, nacl.exceptions.BadSignatureError):
            return None


# Global crypto service instance
crypto_service = CryptoService()
