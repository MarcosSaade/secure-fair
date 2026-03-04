# Secure Fair - Project File Structure

This document describes the complete file structure for the Secure Fair project.

## Root Directory

```
secure-fair/
├── Documentation/              # Complete documentation
├── backend/                    # FastAPI backend
├── frontend/                   # React frontend
├── docker/                     # Docker configurations
├── .github/                    # GitHub Actions CI/CD
├── .gitignore                 # Git ignore rules
├── docker-compose.yml         # Docker Compose configuration
├── PROJECT_README.md          # Main project README
└── README.md                  # Original requirements
```

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI application entry point
│   ├── api/                   # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependency injection (auth, db)
│   │   └── routes/            # Route modules
│   │       ├── __init__.py
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── admin.py       # Admin endpoints
│   │       ├── student.py     # Student endpoints
│   │       └── socio.py       # Socioformador endpoints
│   ├── core/                  # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py          # Settings and configuration
│   │   ├── security.py        # Security functions (JWT, crypto)
│   │   └── database.py        # Database connection and session
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── organization.py
│   │   ├── fair_period.py
│   │   ├── project.py
│   │   ├── time_slot.py
│   │   ├── slot_registration.py
│   │   ├── checkin.py
│   │   ├── enrollment.py
│   │   └── project_code.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── enrollment.py
│   │   └── ...
│   └── services/              # Business logic services
│       ├── __init__.py
│       ├── auth_service.py
│       ├── enrollment_service.py
│       ├── code_service.py
│       ├── crypto_service.py
│       ├── checkin_service.py
│       └── export_service.py
├── alembic/                   # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── tests/                     # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   │   ├── test_auth.py
│   │   ├── test_student.py
│   │   ├── test_socio.py
│   │   └── test_admin.py
│   └── test_services/
│       ├── test_enrollment.py
│       └── test_crypto.py
├── scripts/                   # Utility scripts
│   ├── seed_data.py          # Database seeding
│   └── generate_keys.py      # Generate crypto keys
├── .env.example              # Environment variables template
├── .gitignore
├── alembic.ini              # Alembic configuration
├── Dockerfile
├── requirements.txt         # Python dependencies
└── README.md
```

## Frontend Structure

```
frontend/
├── public/                    # Static files
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/            # React components
│   │   ├── common/            # Shared components
│   │   │   ├── Layout.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── student/
│   │   │   ├── SlotCard.tsx
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   ├── CodeRedemption.tsx
│   │   │   └── EnrollmentReceipt.tsx
│   │   ├── socio/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── CodeGenerator.tsx
│   │   │   └── StudentList.tsx
│   │   └── admin/
│   │       ├── PeriodForm.tsx
│   │       ├── ProjectForm.tsx
│   │       ├── CheckinScanner.tsx
│   │       ├── Dashboard.tsx
│   │       └── DataTable.tsx
│   ├── pages/                 # Page components
│   │   ├── Login.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── SlotSelection.tsx
│   │   │   ├── MyQRCode.tsx
│   │   │   ├── EnrollProject.tsx
│   │   │   └── MyEnrollment.tsx
│   │   ├── socio/
│   │   │   ├── SocioDashboard.tsx
│   │   │   ├── MyProjects.tsx
│   │   │   └── EnrolledStudents.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── ManagePeriods.tsx
│   │       ├── ManageOrganizations.tsx
│   │       ├── ManageProjects.tsx
│   │       ├── ManageSlots.tsx
│   │       ├── CheckIn.tsx
│   │       ├── Analytics.tsx
│   │       └── Exports.tsx
│   ├── services/              # API clients
│   │   ├── api.ts             # Axios instance
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── socio.ts
│   │   └── admin.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useSlots.ts
│   │   └── useEnrollments.ts
│   ├── utils/                 # Utility functions
│   │   ├── constants.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── storage.ts
│   ├── types/                 # TypeScript types
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── slot.ts
│   │   ├── enrollment.ts
│   │   └── api.ts
│   ├── App.tsx                # Main app component
│   ├── App.css
│   ├── main.tsx               # Entry point
│   ├── index.css
│   ├── routes.tsx             # Route configuration
│   └── vite-env.d.ts
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── Dockerfile
├── nginx.conf                 # Nginx configuration for production
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Documentation Structure

```
Documentation/
├── README.md                          # Documentation index
├── 01_project_specification.md        # Requirements and objectives
├── 02_technical_design.md             # Architecture and database
├── 03_development_roadmap.md          # 16-week development plan
├── 04_api_reference.md                # API documentation
├── 05_security_cryptography.md        # Security implementation
├── 06_deployment_guide.md             # Deployment instructions
└── 07_user_guide.md                   # End-user manual
```

## GitHub Actions

```
.github/
└── workflows/
    ├── backend-tests.yml      # Backend CI
    ├── frontend-tests.yml     # Frontend CI
    └── deploy.yml             # Deployment workflow
```

## Key Files to Create

### Backend Priority
1. `app/main.py` - FastAPI application
2. `app/core/config.py` - Settings
3. `app/core/database.py` - Database connection
4. `app/core/security.py` - Auth and crypto
5. `app/models/*.py` - All database models
6. `app/api/routes/*.py` - All endpoints
7. `app/services/*.py` - Business logic
8. `alembic/versions/*.py` - Migrations

### Frontend Priority
1. `src/main.tsx` - Entry point
2. `src/App.tsx` - Main component
3. `src/routes.tsx` - Routing
4. `src/services/api.ts` - API client
5. `src/hooks/useAuth.ts` - Auth hook
6. `src/pages/Login.tsx` - Login page
7. `src/components/common/ProtectedRoute.tsx` - Route guard
8. Role-specific pages and components

### Configuration Priority
1. `.env` files (backend and frontend)
2. `docker-compose.yml`
3. `requirements.txt`
4. `package.json`
5. `alembic.ini`
6. TypeScript and ESLint configs

## Notes for Development Team

- **Backend Lead**: Focus on `backend/app/` structure
- **Frontend Lead**: Focus on `frontend/src/` structure
- **Security Engineer**: Focus on crypto and auth in both stacks
- **Admin Engineer**: Focus on admin panel and exports
- **PM**: Coordinate file creation and integration

---

This structure is ready for your team to start development following the 16-week roadmap!
