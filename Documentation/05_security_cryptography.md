# Security & Cryptography - Secure Fair

## Table of Contents

1. [Security Principles](#security-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Cryptographic Implementations](#cryptographic-implementations)
4. [Threat Model](#threat-model)
5. [Attack Mitigations](#attack-mitigations)

## 1. Security Principles

### Defense in Depth
- Validation on both client and server
- Multiple layers of protection
- No single point of failure

### Principle of Least Privilege
- Each role accesses only necessary resources
- Fine-grained permission control
- Explicit authorization checks

### Fail-Secure
- Failures result in access denial, not permission grants
- Default-deny approach
- Explicit allow lists

### Separation of Concerns
- Critical logic isolated in business layer
- Clear boundaries between components
- Independent security domains

## 2. Authentication & Authorization

### 2.1 Password Hashing

**Algorithm**: Argon2id

**Library**: `argon2-cffi`

**Implementation**:
```python
from argon2 import PasswordHasher

ph = PasswordHasher()

# Hashing
password_hash = ph.hash("user_password")

# Verification
try:
    ph.verify(password_hash, "user_password")
    # Password correct
except:
    # Password incorrect
```

**Parameters**: Default secure values (memory cost, iterations)

**Purpose**: Protect credentials in database against rainbow table and brute-force attacks

### 2.2 JWT Tokens

**Algorithm**: HS256 (HMAC with SHA-256)

**Library**: `python-jose`

**Token Structure**:
```json
{
    "sub": "<user_id>",
    "email": "<email>",
    "role": "STUDENT|SOCIO|ADMIN",
    "exp": <timestamp>,
    "iat": <timestamp>
}
```

**Configuration**:
- **Access Token Duration**: 15 minutes
- **Secret Key**: 256-bit random key stored in environment variable
- **Storage**: LocalStorage on client (cleared on logout)

**Implementation**:
```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
```

### 2.3 Role-Based Access Control (RBAC)

**Roles**:
- `ADMIN`: Full access to all operations
- `SOCIO`: Access to assigned projects, code generation, view enrollments
- `STUDENT`: Slot registration, code redemption, view own status

**Implementation**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = verify_token(token)
        user = await get_user_by_id(payload["sub"])
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication")

def require_role(role: str):
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Usage in endpoints
@router.get("/admin/dashboard")
async def get_dashboard(admin = Depends(require_role("ADMIN"))):
    # Only admins can access
    pass
```

## 3. Cryptographic Implementations

### 3.1 Enrollment Code Hashing (HMAC)

**Purpose**: Store enrollment codes securely without revealing plaintext

**Algorithm**: HMAC-SHA256

**Implementation**:
```python
import hmac
import hashlib
import secrets
import string

CODE_SECRET = os.getenv("CODE_SECRET_KEY")

def generate_code(length=6):
    """Generate random alphanumeric code"""
    alphabet = string.ascii_uppercase + string.digits
    code = ''.join(secrets.choice(alphabet) for _ in range(length))
    return code

def hash_code(code: str) -> str:
    """Hash code using HMAC-SHA256"""
    return hmac.new(
        CODE_SECRET.encode(),
        code.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_code(code: str, code_hash: str) -> bool:
    """Verify code in constant time"""
    expected_hash = hash_code(code)
    return hmac.compare_digest(expected_hash, code_hash)
```

**Properties**:
- **One-way**: Cannot reverse hash to get original code
- **Constant-time comparison**: Prevents timing attacks
- **Secret key**: Additional security layer
- **Expiration**: Codes expire after 60-120 seconds
- **Single-use**: Marked as used after redemption

### 3.2 Digital Signatures (Ed25519)

**Purpose**: Provide proof of enrollment authenticity and integrity

**Algorithm**: Ed25519 (Elliptic Curve Digital Signature)

**Library**: `PyNaCl` or `cryptography`

**Key Generation**:
```python
import nacl.signing
import nacl.encoding

# Generate keys (once, at initialization)
signing_key = nacl.signing.SigningKey.generate()
verify_key = signing_key.verify_key

# Store in environment variables (Base64 encoded)
PRIVATE_KEY = signing_key.encode(encoder=nacl.encoding.Base64Encoder)
PUBLIC_KEY = verify_key.encode(encoder=nacl.encoding.Base64Encoder)
```

**Receipt Structure**:
```json
{
    "student_id": "uuid",
    "project_id": "uuid",
    "period_id": "uuid",
    "timestamp": "2026-03-15T10:45:00Z",
    "nonce": "random-string"
}
```

**Signing Process**:
```python
import json
import nacl.signing
import nacl.encoding

def create_receipt(enrollment):
    """Create enrollment receipt"""
    return {
        "student_id": str(enrollment.student_user_id),
        "project_id": str(enrollment.project_id),
        "period_id": str(enrollment.period_id),
        "timestamp": enrollment.created_at.isoformat(),
        "nonce": secrets.token_hex(16)
    }

def sign_receipt(receipt: dict) -> str:
    """Sign receipt with Ed25519"""
    # Load private key
    signing_key = nacl.signing.SigningKey(
        PRIVATE_KEY,
        encoder=nacl.encoding.Base64Encoder
    )
    
    # Canonical JSON serialization
    message = json.dumps(receipt, sort_keys=True).encode()
    
    # Sign
    signed = signing_key.sign(message)
    
    # Return signature (Base64)
    return nacl.encoding.Base64Encoder.encode(signed.signature).decode()

def verify_receipt(receipt: dict, signature: str) -> bool:
    """Verify receipt signature"""
    try:
        # Load public key
        verify_key = nacl.signing.VerifyKey(
            PUBLIC_KEY,
            encoder=nacl.encoding.Base64Encoder
        )
        
        # Canonical JSON
        message = json.dumps(receipt, sort_keys=True).encode()
        
        # Decode signature
        sig_bytes = nacl.encoding.Base64Encoder.decode(signature)
        
        # Verify (raises exception if invalid)
        verify_key.verify(message, sig_bytes)
        return True
    except:
        return False
```

**Properties**:
- **Authenticity**: Proves receipt was issued by the server
- **Integrity**: Detects any tampering with receipt data
- **Non-repudiation**: Server cannot deny issuing the receipt
- **Compact**: Small signature size (~64 bytes)

### 3.3 QR Code Tokens

**Purpose**: Secure check-in process

**Implementation**: Signed JWT token

**Token Payload**:
```json
{
    "student_id": "uuid",
    "slot_registration_id": "uuid",
    "slot_starts_at": "2026-03-15T10:00:00Z",
    "exp": <timestamp>
}
```

**Generation**:
```python
def generate_qr_token(slot_registration):
    """Generate signed QR token"""
    payload = {
        "student_id": str(slot_registration.student_user_id),
        "slot_registration_id": str(slot_registration.id),
        "slot_starts_at": slot_registration.slot.starts_at.isoformat(),
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return create_access_token(payload)
```

**Verification**:
- Signature validation (JWT)
- Expiration check
- Slot date validation
- Single-use enforcement (check-in table)

## 4. Threat Model

### 4.1 Identified Threats

#### T1: QR Code Sharing
**Description**: Students photograph and share project QR codes

**Impact**: Remote enrollment without physical attendance

**Likelihood**: High

**Mitigation**: Use ephemeral codes instead of static QR codes

#### T2: Remote Registration
**Description**: Students enroll without attending fair

**Impact**: Defeats purpose of in-person interaction

**Likelihood**: High without mitigation

**Mitigation**: Mandatory physical check-in gate before enrollment

#### T3: Multiple Project Enrollment
**Description**: Students enroll in multiple projects

**Impact**: Violates university policy

**Likelihood**: Medium

**Mitigation**: Database UNIQUE constraint on (student_id, period_id)

#### T4: Capacity Overflow
**Description**: More students enroll than project capacity

**Impact**: Organizational chaos, unfair allocation

**Likelihood**: Medium without mitigation

**Mitigation**: Atomic transactions with SELECT FOR UPDATE

#### T5: Code Brute Force
**Description**: Attackers guess enrollment codes

**Impact**: Unauthorized enrollment

**Likelihood**: Low (with proper code complexity)

**Mitigation**: 6-8 character codes + expiration + rate limiting

#### T6: Man-in-the-Middle (MITM)
**Description**: Attacker intercepts communications

**Impact**: Token theft, data exposure

**Likelihood**: Low (with HTTPS)

**Mitigation**: Enforce HTTPS/TLS 1.3, HSTS headers

#### T7: Receipt Tampering
**Description**: Students modify enrollment receipts

**Impact**: False proof of enrollment

**Likelihood**: Medium without mitigation

**Mitigation**: Ed25519 digital signatures

#### T8: Race Conditions
**Description**: Concurrent enrollments exceed capacity

**Impact**: Data integrity violation

**Likelihood**: Medium without mitigation

**Mitigation**: Database transactions with row locking

### 4.2 Assumptions

1. Server private keys are secured in environment variables
2. Social Service staff verify physical identity during check-in
3. Client-server communication uses HTTPS (TLS 1.3)
4. Database is protected by firewall and restricted access
5. Socioformador devices are under their physical control
6. PostgreSQL is properly configured with secure defaults

## 5. Attack Mitigations

### 5.1 SQL Injection
**Protection**: 
- SQLAlchemy ORM with parameterized queries
- No raw SQL string concatenation
- Input validation with Pydantic

### 5.2 Cross-Site Scripting (XSS)
**Protection**:
- React automatic escaping
- Content-Security-Policy headers
- Input sanitization

### 5.3 Cross-Site Request Forgery (CSRF)
**Protection**:
- JWT in Authorization header (not cookies)
- SameSite cookie attribute if cookies used
- State-changing operations require authentication

### 5.4 Brute Force
**Protection**:
- Rate limiting on login endpoint (5 req/min)
- Rate limiting on code redemption (10 req/min)
- Argon2 password hashing (slow by design)
- Account lockout after N failed attempts

### 5.5 Timing Attacks
**Protection**:
- Constant-time comparison for HMAC (`hmac.compare_digest`)
- Constant-time comparison for passwords (Argon2 library handles this)

### 5.6 Denial of Service (DoS)
**Protection**:
- Rate limiting on all endpoints
- Request size limits
- Database connection pooling
- Timeout configurations

### 5.7 Privilege Escalation
**Protection**:
- Role verification on every request
- Explicit permission checks
- No client-side role determination
- Immutable roles (cannot self-promote)

## 6. Security Checklist

### Pre-Deployment
- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS/TLS configured and enforced
- [ ] Database credentials secured
- [ ] Ed25519 keys generated and secured
- [ ] JWT secret key is cryptographically random (256+ bits)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)

### Code Review
- [ ] No hardcoded credentials
- [ ] All user inputs validated
- [ ] All database queries use ORM
- [ ] All sensitive operations require authentication
- [ ] Role checks on protected endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't expose secrets

### Testing
- [ ] Attempt enrollment without check-in (should fail)
- [ ] Attempt double enrollment (should fail)
- [ ] Exceed project capacity (should fail)
- [ ] Use expired code (should fail)
- [ ] Modify receipt and verify (should fail)
- [ ] Access admin endpoint as student (should fail)
- [ ] SQL injection attempts (should be blocked)

---

**Version**: 1.0  
**Last Update**: February 2026
