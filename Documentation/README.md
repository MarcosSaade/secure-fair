# Secure Fair - Documentation

## Sistema de Registro Criptográficamente Controlado para Ferias de Servicio Social

### Overview

**Secure Fair** es un sistema de gestión integral para ferias de servicio social que garantiza la asistencia física verificada de estudiantes antes de permitir su inscripción a proyectos. El sistema implementa componentes criptográficos avanzados para prevenir fraude y asegurar la integridad de los registros.

### Documentos Disponibles

1. **[Project Specification](./01_project_specification.md)** - Especificación completa del proyecto, objetivos y alcance
2. **[Technical Design](./02_technical_design.md)** - Arquitectura del sistema, diseño de base de datos y API
3. **[Development Roadmap](./03_development_roadmap.md)** - Plan de desarrollo de 16 semanas con tareas por rol
4. **[API Reference](./04_api_reference.md)** - Documentación detallada de todos los endpoints
5. **[Security & Cryptography](./05_security_cryptography.md)** - Implementación de seguridad y componentes criptográficos
6. **[Deployment Guide](./06_deployment_guide.md)** - Guía de despliegue y configuración
7. **[User Guide](./07_user_guide.md)** - Manual de usuario para los tres roles

### Quick Start para Desarrolladores

#### Requisitos Previos
- Node.js 18+ y npm/yarn
- Python 3.11+
- PostgreSQL 15+
- Docker y Docker Compose (opcional pero recomendado)

#### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd secure-fair

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (nueva terminal)
cd frontend
npm install
npm run dev
```

#### Variables de Entorno

Ver `.env.example` en cada directorio para las configuraciones necesarias.

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Student    │  │    Socio    │  │    Admin    │         │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / REST API
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth  │  Enrollment  │  Code Gen  │  Crypto Service │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SQLAlchemy ORM                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL
┌─────────────────────────▼───────────────────────────────────┐
│                    PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) o shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **QR**: react-qr-code, html5-qrcode

#### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Auth**: python-jose (JWT)
- **Password Hashing**: argon2-cffi
- **Cryptography**: PyNaCl (Ed25519)
- **Validation**: Pydantic v2

#### Database
- **Primary**: PostgreSQL 15+
- **Features**: ACID transactions, constraints, indexes

#### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render / Fly.io / Railway
- **CI/CD**: GitHub Actions

### Roles del Sistema

1. **Estudiante**
   - Registrarse a franjas horarias
   - Obtener código QR de entrada
   - Verificar entrada (check-in)
   - Redimir códigos de inscripción
   - Ver confirmación de inscripción firmada

2. **Socioformador**
   - Ver proyectos asignados
   - Generar códigos de inscripción efímeros
   - Ver lista de estudiantes inscritos
   - Exportar datos del proyecto

3. **Administrador**
   - Gestionar organizaciones, proyectos y períodos
   - Configurar franjas horarias
   - Realizar check-in de estudiantes
   - Ver analíticas y métricas
   - Exportar datos maestros

### Componentes Criptográficos

1. **Password Hashing**: Argon2id para almacenamiento seguro de contraseñas
2. **HMAC Codes**: HMAC-SHA256 para códigos de inscripción de un solo uso
3. **Digital Signatures**: Ed25519 para recibos de inscripción verificables
4. **JWT Tokens**: HS256 para autenticación y sesiones

### Características Principales

✅ Verificación de asistencia física obligatoria  
✅ Prevención de inscripciones múltiples  
✅ Control de capacidad en tiempo real  
✅ Códigos efímeros de un solo uso  
✅ Recibos de inscripción firmados digitalmente  
✅ Dashboard de analíticas en tiempo real  
✅ Exportación de datos (CSV/XLSX)  
✅ Sistema RBAC completo  

### Equipo de Desarrollo

El proyecto está diseñado para un equipo de 5 personas:

1. **Scrum Master / PM / QA Lead**
2. **Backend Lead** (API + Database)
3. **Security/Crypto Engineer** (Auth + Crypto)
4. **Frontend Lead** (Student & Socio apps)
5. **Admin Dashboard + Data Engineer**

### Timeline

**Duración**: 16 semanas (Semana 2 - Semana 17)

**Hitos principales**:
- Semana 3: Aplicación esqueleto con autenticación
- Semana 6: Sistema de check-in operativo
- Semana 8: Inscripción con verificación física
- Semana 9: Endurecimiento y seguridad
- Semana 13: Componente criptográfico finalizado
- Semana 15: Despliegue en producción
- Semana 17: Presentación final

### Licencia

[Especificar licencia]

### Contacto

[Información de contacto del equipo]

---

**Última actualización**: Febrero 2026
