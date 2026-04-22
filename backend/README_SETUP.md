# Secure Fair - Backend

Backend API para el sistema Secure Fair, implementando autenticación segura, criptografía y gestión de eventos.

## 🔐 Security & Crypto Features

Este backend implementa las siguientes características de seguridad y criptografía:

### Autenticación
- **JWT (HS256)**: Tokens de acceso con expiración de 15 minutos
- **Argon2id**: Hashing de contraseñas con parámetros seguros
- **RBAC**: Control de acceso basado en roles (ADMIN, SOCIO, STUDENT)

### Criptografía
- **Ed25519**: Firmas digitales para recibos de inscripción (no repudio)
- **HMAC-SHA256**: Hashing de códigos de inscripción
- **QR Tokens**: Tokens firmados para verificación de entrada física

### Principios de Seguridad
- **Defensa en profundidad**: Múltiples capas de validación
- **Privilegio mínimo**: Acceso basado en necesidad
- **Fail-secure**: Denegar por defecto
- **Separación de responsabilidades**: Límites claros de seguridad

## 🚀 Quick Start

### 1. Generar Claves Criptográficas

```bash
python generate_keys.py
```

Este script genera:
- Par de claves Ed25519 (firma digital)
- Clave secreta JWT
- Clave secreta para HMAC de códigos

**⚠️ IMPORTANTE**: Copia las claves generadas a tu archivo `.env`

### 2. Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Luego actualiza con las claves generadas en el paso 1.

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 3.1 Migraciones de Base de Datos (Obligatorias)

Este proyecto usa Alembic para controlar cambios de esquema. Antes de ejecutar el backend en un entorno nuevo, aplica las migraciones en lugar de depender de la creación automática de tablas.

```bash
cd backend
alembic upgrade head
```

Si agregas o modificas modelos, genera una nueva migración y revísala antes de aplicarla.

### 4. Iniciar Base de Datos

Con Docker Compose (recomendado):

```bash
docker-compose up -d db
```

### 5. Crear Admin Inicial

```bash
python create_admin.py admin@securefair.com securepassword123 "Admin Name"
```

### 6. Iniciar Servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API estará disponible en: http://localhost:8000

### 6.1 Firma Ed25519 del Alumno

El diseño recomendado usa llaves Ed25519 generadas en el cliente del alumno. La llave privada debe permanecer en almacenamiento seguro no exportable; el servidor solo recibe la llave pública, el challenge firmado y la evidencia de verificación.

## 📚 Documentación API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       └── auth.py          # Endpoints de autenticación
│   ├── core/
│   │   ├── config.py           # Configuración de la aplicación
│   │   ├── security.py         # Hashing de contraseñas (Argon2id)
│   │   └── dependencies.py     # Dependencias de seguridad (RBAC)
│   ├── db/
│   │   └── database.py         # Configuración de base de datos
│   ├── models/
│   │   └── models.py           # Modelos SQLAlchemy
│   ├── schemas/
│   │   └── auth_schemas.py     # Esquemas Pydantic
│   ├── services/
│   │   ├── auth_service.py     # Servicio de JWT
│   │   └── crypto_service.py   # Servicio de criptografía
│   └── main.py                 # Aplicación FastAPI principal
├── create_admin.py             # Script para crear admin
├── generate_keys.py            # Script para generar claves
├── requirements.txt            # Dependencias Python
└── .env                        # Variables de entorno (no commit)
```

## 🔑 Endpoints Principales

### Autenticación

#### POST /auth/register
Registrar nuevo usuario (STUDENT, SOCIO, o ADMIN)

```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "full_name": "Juan Pérez",
  "role": "STUDENT",
  "student_id_number": "A01234567",
  "major": "Computer Science",
  "semester": 5
}
```

#### POST /auth/login
Iniciar sesión y obtener JWT token

```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

#### GET /auth/me
Obtener información del usuario actual (requiere autenticación)

**Headers**:
```
Authorization: Bearer <tu_token>
```

## 🛡️ Seguridad - Mejores Prácticas

### Almacenamiento de Claves

1. **NUNCA** comitear el archivo `.env` a git
2. Usar diferentes claves en desarrollo y producción
3. Rotar claves periódicamente en producción
4. Respaldar claves en ubicación segura

### Contraseñas

- Mínimo 8 caracteres
- Hashing con Argon2id (resistente a GPU cracking)
- Verificación de rehashing automático

### Tokens JWT

- Expiración de 15 minutos
- Incluyen claims: user_id, email, role
- Validación en cada request protegido

### Rate Limiting

- Login: 5 requests/minuto por IP
- Endpoints generales: 100 requests/minuto por IP

## 🧪 Testing

```bash
pytest
```

Con cobertura:
```bash
pytest --cov=app --cov-report=html
```

## 📝 Roles y Permisos

### ADMIN
- Gestión completa del sistema
- CRUD de organizaciones, proyectos, slots
- Verificación de check-ins
- Acceso a métricas y reportes

### SOCIO (Socioformador)
- Gestión de proyectos asignados
- Generación de códigos de inscripción
- Visualización de inscripciones
- Exportación de datos

### STUDENT
- Registro en franjas horarias
- Redención de códigos de inscripción
- Visualización de estado de inscripción
- Generación de QR para check-in

## 🔧 Variables de Entorno

```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Seguridad - JWT
JWT_SECRET_KEY=<generar con generate_keys.py>
ACCESS_TOKEN_EXPIRE_MINUTES=15
ALGORITHM=HS256

# Seguridad - Criptografía
CODE_SECRET_KEY=<generar con generate_keys.py>
SIGNING_PRIVATE_KEY=<generar con generate_keys.py>
SIGNING_PUBLIC_KEY=<generar con generate_keys.py>

# Códigos de inscripción
ENROLLMENT_CODE_EXPIRE_SECONDS=120
ENROLLMENT_CODE_LENGTH=6

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Entorno
ENVIRONMENT=development
```

## 🐳 Docker

Construir imagen:
```bash
docker build -t secure-fair-backend .
```

Ejecutar con Docker Compose:
```bash
docker-compose up
```

## 📊 Modelo de Base de Datos

Principales tablas:
- `users`: Usuarios y credenciales
- `students`: Información académica de estudiantes
- `socios`: Información de socioformadores
- `organizations`: Organizaciones socioformadoras
- `projects`: Proyectos solidarios
- `time_slots`: Franjas horarias de proyectos
- `enrollment_codes`: Códigos de inscripción (hasheados)
- `enrollments`: Inscripciones con firma digital
- `check_ins`: Registros de asistencia

## 🤝 Contribución

Este backend fue desarrollado como parte del proyecto Secure Fair para la Semana 3 (Esqueleto de Aplicación).

### Responsabilidades del Security/Crypto Engineer:

✅ Implementado:
- Sistema de autenticación JWT
- Hashing de contraseñas con Argon2id
- Control de acceso basado en roles (RBAC)
- Servicios de criptografía (Ed25519, HMAC)
- Endpoints de autenticación
- Modelos de base de datos seguros

🚧 Próximas semanas:
- Check-in con QR (Semana 6)
- Códigos OTP de un solo uso (Semana 7)
- Rate limiting avanzado (Semana 9)
- Documentación de modelo de amenazas (Semana 13)

## 📄 Licencia

Este proyecto es parte de un proyecto académico.
