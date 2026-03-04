"""
Alembic migration script initialization.
Run this to generate the Ed25519 key pair for digital signatures.
"""
import secrets
import nacl.signing
import nacl.encoding


def generate_ed25519_keypair():
    """
    Generate Ed25519 key pair for digital signatures.
    
    This should be run once during initial setup and the keys
    should be stored securely in environment variables.
    
    NEVER commit these keys to version control!
    """
    # Generate signing key (private key)
    signing_key = nacl.signing.SigningKey.generate()
    
    # Get verify key (public key)
    verify_key = signing_key.verify_key
    
    # Encode keys as hex strings
    private_key_hex = signing_key.encode(encoder=nacl.encoding.HexEncoder).decode()
    public_key_hex = verify_key.encode(encoder=nacl.encoding.HexEncoder).decode()
    
    return private_key_hex, public_key_hex


def generate_secret_key(length=32):
    """
    Generate a cryptographically secure random secret key.
    
    Args:
        length: Length of the key in bytes (default: 32 = 256 bits)
    
    Returns:
        Hex-encoded secret key
    """
    return secrets.token_hex(length)


if __name__ == "__main__":
    print("=" * 60)
    print("Secure Fair - Cryptographic Key Generation")
    print("=" * 60)
    print()
    
    # Generate Ed25519 key pair
    print("Generating Ed25519 key pair for digital signatures...")
    private_key, public_key = generate_ed25519_keypair()
    
    print()
    print("✓ Ed25519 Keys Generated")
    print()
    print("Add these to your .env file:")
    print("-" * 60)
    print(f"SIGNING_PRIVATE_KEY={private_key}")
    print(f"SIGNING_PUBLIC_KEY={public_key}")
    print()
    
    # Generate JWT secret
    print("Generating JWT secret key...")
    jwt_secret = generate_secret_key(32)
    print()
    print("✓ JWT Secret Generated")
    print()
    print(f"JWT_SECRET_KEY={jwt_secret}")
    print()
    
    # Generate code secret
    print("Generating enrollment code secret key...")
    code_secret = generate_secret_key(32)
    print()
    print("✓ Code Secret Generated")
    print()
    print(f"CODE_SECRET_KEY={code_secret}")
    print()
    
    print("=" * 60)
    print("SECURITY WARNING:")
    print("=" * 60)
    print("1. NEVER commit these keys to version control!")
    print("2. Store them securely in your .env file")
    print("3. Use different keys for development and production")
    print("4. Rotate keys periodically in production")
    print("5. Back up keys in a secure location")
    print("=" * 60)
