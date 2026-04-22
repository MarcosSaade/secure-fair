"""
Main FastAPI application configuration for Secure Fair.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.endpoints import auth, organizations, projects, enrollments, signatures
from app.db.database import engine, Base


# Create database tables only in development; production must use Alembic migrations.
if settings.ENVIRONMENT == "development":
    Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI application
app = FastAPI(
    title="Secure Fair API",
    description="""
    Backend API for Secure Fair - A cryptographically secure event management system.
    
    ## Features
    
    * **Authentication**: JWT-based authentication with Argon2id password hashing
    * **Authorization**: Role-based access control (RBAC) with ADMIN, SOCIO, and STUDENT roles
    * **Cryptography**: Ed25519 digital signatures for enrollment receipts
    * **Security**: HMAC-SHA256 for enrollment code hashing
    * **QR Codes**: Signed QR tokens for physical check-in verification
    
    ## Security Principles
    
    * **Defense in Depth**: Multiple layers of security validation
    * **Least Privilege**: Role-based access control with minimal permissions
    * **Fail-Secure**: Default-deny approach to authorization
    * **Separation of Concerns**: Clear security boundaries between components
    
    ## Authentication
    
    Most endpoints require authentication via JWT token:
    
    1. Login at `/auth/login` with email and password
    2. Receive JWT access token (valid for 15 minutes)
    3. Include token in Authorization header: `Bearer <token>`
    
    ## Rate Limiting
    
    API endpoints are protected with rate limiting to prevent abuse:
    
    * Login endpoint: 5 requests per minute per IP
    * General endpoints: 100 requests per minute per IP
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROUTERS ====================

# Include API routers with /api prefix (primary)
app.include_router(auth.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(enrollments.router, prefix="/api")
app.include_router(signatures.router, prefix="/api")

# Backward-compatible routes without /api prefix
app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(projects.router)
app.include_router(enrollments.router)
app.include_router(signatures.router)


# ==================== ROOT ENDPOINTS ====================


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint providing API information.
    """
    return {
        "message": "Secure Fair API",
        "version": "1.0.0",
        "docs": "/docs",
        "security": {
            "authentication": "JWT (HS256)",
            "password_hashing": "Argon2id",
            "signatures": "Ed25519",
            "code_hashing": "HMAC-SHA256",
        },
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


@app.get("/api/info", tags=["Root"])
async def api_info():
    """
    API configuration information.
    """
    return {
        "jwt_expiration_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "code_expiration_seconds": settings.ENROLLMENT_CODE_EXPIRE_SECONDS,
        "code_length": settings.ENROLLMENT_CODE_LENGTH,
        "algorithm": settings.ALGORITHM,
    }
