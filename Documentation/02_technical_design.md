# Technical Design Document - Secure Fair

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Design](#api-design)
4. [Cryptographic Implementation](#cryptographic-implementation)
5. [Business Logic](#business-logic)

## 1. System Architecture

### 1.1 Three-Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                       │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Student    │  │   Socio     │  │   Admin     │      │
│  │  React App  │  │  React App  │  │  React App  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                            │
│              React + TypeScript + Vite                    │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼─────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                    │
│                                                            │
│              FastAPI + Python 3.11+                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │           API Endpoints                             │  │
│  │  /auth  /admin  /student  /socio                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │       Business Logic & Services                     │  │
│  │  - Enrollment Service                               │  │
│  │  - Code Generation Service                          │  │
│  │  - Crypto Service (Ed25519)                         │  │
│  │  - Check-in Service                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │          ORM & Data Access                          │  │
│  │          SQLAlchemy 2.0                             │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ SQL / Transactions
┌────────────────────────▼─────────────────────────────────┐
│                   DATA LAYER                              │
│                                                            │
│                  PostgreSQL 15+                           │
│                                                            │
│  - Normalized tables                                      │
│  - Integrity constraints                                  │
│  - Optimized indexes                                      │
│  - ACID transactions                                      │
└───────────────────────────────────────────────────────────┘
```

### 1.2 Component Diagram

**Frontend Components:**
```
├── Auth Module
│   ├── Login
│   ├── Role Guard
│   └── Token Manager
├── Student Module
│   ├── Slot Registration
│   ├── QR Display
│   ├── Code Redemption
│   └── Enrollment Status
├── Socio Module
│   ├── Project Dashboard
│   ├── Code Generator
│   ├── Enrollment List
│   └── Export Tools
└── Admin Module
    ├── CRUD Organizations
    ├── CRUD Projects
    ├── CRUD Slots
    ├── Check-in Interface
    ├── Analytics Dashboard
    └── Master Export
```

**Backend Services:**
```
├── Auth Service
│   ├── JWT Generation
│   ├── Password Hashing (Argon2)
│   └── Role Verification
├── Enrollment Service
│   ├── Capacity Check
│   ├── Duplicate Prevention
│   └── Transaction Management
├── Code Service
│   ├── Code Generation
│   ├── HMAC Hashing
│   └── Expiry Management
├── Crypto Service
│   ├── Ed25519 Key Management
│   ├── Receipt Signing
│   └── Signature Verification
└── Export Service
    ├── CSV Generation
    └── XLSX Generation
```

### 1.3 Authentication Model

#### Authentication Flow

1. User sends credentials to POST `/auth/login`
2. Backend verifies credentials with Argon2 hash
3. If valid, generates JWT with payload:
```json
{
    "sub": "<user_id>",
    "email": "<email>",
    "role": "STUDENT|SOCIO|ADMIN",
    "exp": <timestamp>,
    "iat": <timestamp>
}
```
4. Client stores JWT in localStorage
5. Each request includes header: `Authorization: Bearer <token>`
6. Backend validates signature and expiration on each protected endpoint

#### Token Strategy

- **Access Token Duration**: 15 minutes
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Environment variable (minimum 256 bits)
- **Refresh**: Re-login required after expiration (simplified for MVP)

### 1.4 Deployment Diagram

```
                        Internet
                           │
                           ▼
                   ┌───────────────┐
                   │  CDN / Nginx  │
                   │   (Frontend)  │
                   └───────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌──────────────┐
│   Student     │  │     Socio     │  │    Admin     │
│   SPA         │  │     SPA       │  │    SPA       │
│(Vercel/Netlify│  │(Vercel/Netlify│  │(Vercel/Netlify│
└───────┬───────┘  └───────┬───────┘  └──────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │ HTTPS/TLS 1.3
                           ▼
                   ┌───────────────┐
                   │  FastAPI App  │
                   │ (Render/Fly.io)│
                   │  + Gunicorn   │
                   └───────┬───────┘
                           │ Internal Network
                           ▼
                   ┌───────────────┐
                   │  PostgreSQL   │
                   │   Database    │
                   │ (Managed DB)  │
                   └───────────────┘
```

## 2. Database Schema

### 2.1 Entity-Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│    users    │         │organizations │         │fair_periods  │
├─────────────┤         ├──────────────┤         ├──────────────┤
│ id PK       │         │ id PK        │         │ id PK        │
│ email UQ    │         │ name         │         │ name         │
│ password_h..│         │ created_at   │         │ starts_at    │
│ role        │         └──────┬───────┘         │ ends_at      │
│ is_active   │                │                 │ is_active    │
│ created_at  │                │                 └──────┬───────┘
└──────┬──────┘                │                        │
       │                       │                        │
       │ 1                     │                        │ 1
       │                       │ N                      │
       │                       ▼                        │
       │              ┌──────────────┐                  │
       │              │   projects   │◄─────────────────┘
       │              ├──────────────┤         N
       │              │ id PK        │
       │              │ org_id FK    │
       │              │ period_id FK │
       │              │ name         │
       │              │ description  │
       │              │ rules_text   │
       │              │ capacity     │
       │              │ is_active    │
       │              └──────┬───────┘
       │                     │
       │                     │ N
       │                     │
       │              ┌──────▼──────────────┐
       │              │project_socio_users  │
       │              ├─────────────────────┤
       │     ┌────────┤ project_id FK  PK   │
       │     │        │ user_id FK  PK      │
       │     │        └─────────────────────┘
       │     │
       │ 1   │ N              ┌──────────────┐
       ▼     └───────────────►│  time_slots  │
┌─────────────┐               ├──────────────┤
│  students   │               │ id PK        │
├─────────────┤               │ period_id FK │
│ user_id PK,F│               │ starts_at    │
│ matricula UQ│               │ ends_at      │
│ full_name   │               │ capacity     │
│ phone       │               │ location     │
└──────┬──────┘               └──────┬───────┘
       │                             │
       │ 1                           │ 1
       │                             │
       │                             │ N
       │                      ┌──────▼─────────────┐
       │                      │slot_registrations  │
       │                      ├────────────────────┤
       │                      │ id PK              │
       │            ┌─────────┤ slot_id FK         │
       │            │         │ student_user_id FK │
       │            │         │ created_at         │
       │            │         └────────┬───────────┘
       │            │                  │
       │            │                  │ 1
       │            │                  │
       │            │                  │ 1
       │            │           ┌──────▼──────┐
       │            │           │  checkins   │
       │            │           ├─────────────┤
       │            │           │ id PK       │
       │            │           │ slot_reg.FK │
       │            │           │ checked_in.a│
       │            │           │ checked_by..│
       │            │           └─────────────┘
       │            │
       │ 1          │
       │            │
       │ N          │
┌──────▼─────────┐  │          ┌──────────────┐
│  enrollments   │  │          │project_codes │
├────────────────┤  │          ├──────────────┤
│ id PK          │  │          │ id PK        │
│ period_id FK   │  │          │ project_id FK│
│ project_id FK  │◄─┘          │ code_hash    │
│ student_u.. FK │             │ expires_at   │
│ accepted_ru..  │             │ issued_by FK │
│ receipt_sig.   │             │ used_by_st.. │
│ created_at     │             │ used_at      │
└────────────────┘             └──────────────┘
UQ: (student_user_id, period_id)
```

### 2.2 Table Definitions

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'SOCIO', 'STUDENT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### fair_periods
```sql
CREATE TABLE fair_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CHECK (ends_at > starts_at)
);

CREATE INDEX idx_fair_periods_active ON fair_periods(is_active);
```

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES fair_periods(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules_text TEXT,
    capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_period ON projects(period_id);
CREATE INDEX idx_projects_active ON projects(is_active);
```

#### project_socio_users
```sql
CREATE TABLE project_socio_users (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_proj_socio_user ON project_socio_users(user_id);
```

#### time_slots
```sql
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES fair_periods(id) ON DELETE CASCADE,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location VARCHAR(255),
    CHECK (ends_at > starts_at)
);

CREATE INDEX idx_slots_period ON time_slots(period_id, starts_at);
```

#### students
```sql
CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    non_tec_email VARCHAR(255)
);

CREATE INDEX idx_students_matricula ON students(matricula);
```

#### slot_registrations
```sql
CREATE TABLE slot_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slot_id, student_user_id)
);

CREATE INDEX idx_slot_reg_student ON slot_registrations(student_user_id);
CREATE INDEX idx_slot_reg_slot ON slot_registrations(slot_id);
```

#### checkins
```sql
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_registration_id UUID NOT NULL UNIQUE 
        REFERENCES slot_registrations(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_by_admin_user_id UUID REFERENCES users(id)
);

CREATE INDEX idx_checkins_slot_reg ON checkins(slot_registration_id);
```

#### enrollments
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES fair_periods(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted_rules_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_user_id, period_id)
);

CREATE INDEX idx_enrollments_project ON enrollments(project_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_user_id);
CREATE INDEX idx_enrollments_period ON enrollments(period_id);
```

#### project_codes
```sql
CREATE TABLE project_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    issued_by_user_id UUID NOT NULL REFERENCES users(id),
    used_by_student_user_id UUID REFERENCES users(id),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proj_codes_project ON project_codes(project_id);
CREATE INDEX idx_proj_codes_expires ON project_codes(expires_at);
CREATE INDEX idx_proj_codes_used ON project_codes(used_at);
```

### 2.3 Key Constraints

#### Critical Constraints

1. **Unique enrollment per period**: `UNIQUE(student_user_id, period_id)` in enrollments
2. **Unique registration per slot**: `UNIQUE(slot_id, student_user_id)` in slot_registrations
3. **Unique check-in per registration**: `UNIQUE(slot_registration_id)` in checkins
4. **Unique email**: `UNIQUE(email)` in users
5. **Unique matricula**: `UNIQUE(matricula)` in students

#### CHECK Validations

- Valid roles: `CHECK (role IN ('ADMIN', 'SOCIO', 'STUDENT'))`
- Positive capacity: `CHECK (capacity > 0)`
- Coherent dates: `CHECK (ends_at > starts_at)`

### 2.4 Indexing Strategy

**Main Indexes:**
- `users.email`: Fast lookup in login
- `students.matricula`: Search by student ID
- `projects (organization_id, period_id)`: Filtered listings
- `time_slots (period_id, starts_at)`: Available slots search
- `enrollments (project_id)`: Count enrollments per project
- `project_codes (expires_at)`: Cleanup expired codes

**Composite Indexes:**

For common queries like "get available slots for a period ordered by date":
```sql
CREATE INDEX idx_slots_period_time 
    ON time_slots(period_id, starts_at);
```

---

**Continued in Part 2...**
