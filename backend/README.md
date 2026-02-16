# Backend - Secure Fair API

FastAPI backend for the Secure Fair system.

## Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── routes/       # Route modules
│   │   │   ├── auth.py
│   │   │   ├── admin.py
│   │   │   ├── student.py
│   │   │   └── socio.py
│   │   └── deps.py       # Dependencies (auth, etc.)
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings
│   │   ├── security.py   # Auth, crypto
│   │   └── database.py   # DB connection
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── project.py
│   │   ├── slot.py
│   │   ├── enrollment.py
│   │   └── ...
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   ├── project.py
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── auth_service.py
│   │   ├── enrollment_service.py
│   │   ├── code_service.py
│   │   └── crypto_service.py
│   └── main.py           # FastAPI app
├── alembic/              # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                # Tests
│   ├── test_api/
│   ├── test_services/
│   └── conftest.py
├── scripts/              # Utility scripts
│   └── seed_data.py
├── requirements.txt      # Python dependencies
├── alembic.ini          # Alembic configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/securefair

# Security
JWT_SECRET_KEY=your-secret-key-here
CODE_SECRET_KEY=your-code-secret-here
ED25519_PRIVATE_KEY=your-private-key-here
ED25519_PUBLIC_KEY=your-public-key-here

# Server
ENVIRONMENT=development
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Database Setup

```bash
# Run migrations
alembic upgrade head

# (Optional) Seed data
python scripts/seed_data.py
```

### Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Student
- `GET /api/student/slots` - Get available slots
- `POST /api/student/slot-registrations` - Register for slot
- `GET /api/student/slot-qr` - Get QR code
- `POST /api/student/enrollments/redeem` - Redeem enrollment code

### Socioformador
- `GET /api/socio/projects` - Get assigned projects
- `POST /api/socio/projects/{id}/codes` - Generate enrollment code
- `GET /api/socio/projects/{id}/enrollments` - Get enrolled students
- `GET /api/socio/projects/{id}/enrollments/export` - Export students

### Admin
- CRUD for periods, organizations, projects, slots
- `POST /api/admin/checkin` - Perform check-in
- `GET /api/admin/dashboard` - Analytics
- `GET /api/admin/exports/master` - Master export

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api/test_auth.py
```

## Code Style

```bash
# Format code
black app/

# Lint
ruff check app/

# Type check
mypy app/
```

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View current version
alembic current
```

## Development Tips

- Use FastAPI's dependency injection for auth and database
- All business logic goes in `services/`
- Models are SQLAlchemy, schemas are Pydantic
- Use transactions for critical operations
- Test all endpoints with automatic and manual tests

## Production

See main project documentation for deployment instructions.
