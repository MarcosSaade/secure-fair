# API Reference - Secure Fair

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.securefair.com/api`

## Response Format

### Success Response
```json
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable error message",
        "details": { ... }
    }
}
```

## HTTP Status Codes

- `200`: Success on GET/PUT operation
- `201`: Resource created successfully (POST)
- `400`: Validation error or business rule violation
- `401`: Not authenticated
- `403`: Not authorized (insufficient role)
- `404`: Resource not found
- `409`: Conflict (e.g., uniqueness violation)
- `500`: Internal server error

## Authentication

All endpoints except `/auth/login` require authentication.

**Header Format**:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth Endpoints

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body**:
```json
{
    "email": "student@example.com",
    "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "user": {
            "id": "uuid",
            "email": "student@example.com",
            "role": "STUDENT"
        }
    }
}
```

**Errors**:
- `401`: Invalid credentials

---

### GET /api/auth/me

Get current authenticated user information.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "student@example.com",
        "role": "STUDENT",
        "is_active": true
    }
}
```

---

## Student Endpoints

### GET /api/student/slots

Get available time slots for a period.

**Query Parameters**:
- `period_id` (required): UUID of the fair period

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "starts_at": "2026-03-15T10:00:00Z",
            "ends_at": "2026-03-15T12:00:00Z",
            "capacity": 50,
            "registered_count": 42,
            "location": "Auditorio Principal",
            "available": true
        }
    ]
}
```

---

### POST /api/student/slot-registrations

Register for a time slot.

**Request Body**:
```json
{
    "slot_id": "uuid"
}
```

**Response (201)**:
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "slot_id": "uuid",
        "created_at": "2026-03-10T15:30:00Z"
    },
    "message": "Registro exitoso"
}
```

**Errors**:
- `400`: Already registered for this slot
- `409`: Slot at full capacity

---

### GET /api/student/slot-qr

Get QR code for check-in.

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "qr_data_url": "data:image/png;base64,iVBORw0KG...",
        "slot_info": {
            "starts_at": "2026-03-15T10:00:00Z",
            "location": "Auditorio Principal"
        }
    }
}
```

---

### POST /api/student/enrollments/redeem

Redeem enrollment code for a project.

**Request Body**:
```json
{
    "code": "ABC123",
    "accept_rules": true
}
```

**Response (201)**:
```json
{
    "success": true,
    "data": {
        "enrollment_id": "uuid",
        "project_name": "Reforestación Comunitaria",
        "organization_name": "EcoAmigos AC",
        "receipt": {
            "student_id": "uuid",
            "project_id": "uuid",
            "period_id": "uuid",
            "timestamp": "2026-03-15T10:45:00Z",
            "nonce": "random-nonce"
        },
        "signature": "base64-encoded-signature"
    },
    "message": "Inscripción exitosa"
}
```

**Errors**:
- `400`: "Código inválido o expirado"
- `400`: "No estás verificado (check-in). Primero presenta tu QR en la entrada"
- `409`: "Ya estás inscrito en un proyecto para este período"
- `409`: "Proyecto sin capacidad disponible"

---

## Socio (Socioformador) Endpoints

### GET /api/socio/projects

Get projects assigned to the socioformador.

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Reforestación Comunitaria",
            "organization_name": "EcoAmigos AC",
            "period_name": "Feb-Jun 2026",
            "capacity": 20,
            "enrolled_count": 15,
            "is_active": true
        }
    ]
}
```

---

### POST /api/socio/projects/{project_id}/codes

Generate enrollment code for a project.

**Response (201)**:
```json
{
    "success": true,
    "data": {
        "code": "XK7M9P",
        "expires_at": "2026-03-15T10:47:00Z",
        "expires_in_seconds": 120
    },
    "message": "Muestra este código al estudiante"
}
```

---

### GET /api/socio/projects/{project_id}/enrollments

Get list of enrolled students for a project.

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "student_name": "Juan Pérez",
            "matricula": "A01234567",
            "email": "juan@example.com",
            "phone": "5551234567",
            "enrolled_at": "2026-03-15T10:45:00Z"
        }
    ]
}
```

---

### GET /api/socio/projects/{project_id}/enrollments/export

Export enrolled students as CSV/XLSX.

**Query Parameters**:
- `format` (optional): "csv" or "xlsx" (default: "csv")

**Response (200)**: File download (CSV or XLSX)

---

## Admin Endpoints

### Fair Periods

#### GET /api/admin/periods

Get all fair periods.

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Feb-Jun 2026",
            "starts_at": "2026-02-01T00:00:00Z",
            "ends_at": "2026-06-30T23:59:59Z",
            "is_active": true
        }
    ]
}
```

#### POST /api/admin/periods

Create a new fair period.

**Request Body**:
```json
{
    "name": "Feb-Jun 2026",
    "starts_at": "2026-02-01T00:00:00Z",
    "ends_at": "2026-06-30T23:59:59Z",
    "is_active": true
}
```

**Response (201)**: Created period object

#### PUT /api/admin/periods/{id}

Update a fair period.

#### DELETE /api/admin/periods/{id}

Delete a fair period.

---

### Organizations

#### GET /api/admin/orgs

Get all organizations.

#### POST /api/admin/orgs

Create a new organization.

**Request Body**:
```json
{
    "name": "EcoAmigos AC"
}
```

#### PUT /api/admin/orgs/{id}

Update an organization.

#### DELETE /api/admin/orgs/{id}

Delete an organization.

---

### Projects

#### GET /api/admin/projects

Get projects (optionally filtered by period).

**Query Parameters**:
- `period_id` (optional): Filter by period UUID

#### POST /api/admin/projects

Create a new project.

**Request Body**:
```json
{
    "organization_id": "uuid",
    "period_id": "uuid",
    "name": "Reforestación Comunitaria",
    "description": "Proyecto de reforestación...",
    "rules_text": "Compromiso de 480 horas...",
    "capacity": 20,
    "socio_user_ids": ["uuid1", "uuid2"]
}
```

#### PUT /api/admin/projects/{id}

Update a project.

#### DELETE /api/admin/projects/{id}

Delete a project.

---

### Time Slots

#### POST /api/admin/slots

Create a new time slot.

**Request Body**:
```json
{
    "period_id": "uuid",
    "starts_at": "2026-03-15T10:00:00Z",
    "ends_at": "2026-03-15T12:00:00Z",
    "capacity": 50,
    "location": "Auditorio Principal"
}
```

---

### Check-in

#### POST /api/admin/checkin

Perform student check-in.

**Request Body**:
```json
{
    "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "checkin_id": "uuid",
        "student_name": "Juan Pérez",
        "matricula": "A01234567",
        "slot_info": {
            "starts_at": "2026-03-15T10:00:00Z",
            "location": "Auditorio Principal"
        },
        "checked_in_at": "2026-03-15T09:55:00Z"
    },
    "message": "Check-in exitoso"
}
```

**Errors**:
- `400`: Invalid or expired QR token
- `409`: Already checked in

---

### Dashboard

#### GET /api/admin/dashboard

Get analytics dashboard data.

**Query Parameters**:
- `period_id` (required): UUID of the fair period

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "total_slots": 10,
        "total_registrations": 450,
        "total_checkins": 420,
        "total_enrollments": 380,
        "slots_by_attendance": [
            {
                "slot_starts_at": "2026-03-15T10:00:00Z",
                "registered": 50,
                "checked_in": 48
            }
        ],
        "projects_by_enrollment": [
            {
                "project_name": "Reforestación Comunitaria",
                "capacity": 20,
                "enrolled": 18,
                "fill_rate": 0.90
            }
        ]
    }
}
```

---

### Exports

#### GET /api/admin/exports/master

Export master table with all data.

**Query Parameters**:
- `period_id` (required): UUID of the fair period
- `format` (optional): "csv" or "xlsx" (default: "csv")

**Response (200)**: File download (CSV or XLSX)

**Columns**:
- Matricula, Nombre, Email, Teléfono
- Slot (fecha/hora), Check-in (fecha/hora)
- Proyecto, Organización
- Fecha de inscripción

---

## Rate Limiting

The following endpoints have rate limiting:

- `/auth/login`: 5 requests per minute per IP
- `/student/enrollments/redeem`: 10 requests per minute per user
- `/admin/checkin`: 60 requests per minute per admin

---

## Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/v1/`

---

**Version**: 1.0  
**Last Update**: February 2026
