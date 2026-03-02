# Secure Fair - Arquitectura de Seguridad

## Visión General

Este documento describe la arquitectura de seguridad implementada en el backend de Secure Fair, enfocándose en las responsabilidades del Security/Crypto + Auth Engineer.

## 🔐 Componentes de Seguridad

### 1. Autenticación (Authentication)

#### 1.1 Hashing de Contraseñas - Argon2id

**Ubicación**: `app/core/security.py`

**Implementación**:
```python
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=2,        # Iteraciones
    memory_cost=65536,  # 64 MB de memoria
    parallelism=1,      # Número de hilos paralelos
    hash_len=32,        # Longitud del hash
    salt_len=16         # Longitud del salt
)
```

**Características**:
- ✅ Resistente a ataques de GPU/ASIC
- ✅ Salt único por contraseña
- ✅ Verificación en tiempo constante
- ✅ Rehashing automático si parámetros cambian

**Proceso**:
1. Usuario envía contraseña en texto plano (solo en login/registro)
2. Backend hashea con Argon2id antes de almacenar
3. Nunca se almacena la contraseña en texto plano
4. Verificación usa comparación resistente a timing attacks

#### 1.2 JSON Web Tokens (JWT)

**Ubicación**: `app/services/auth_service.py`

**Algoritmo**: HS256 (HMAC con SHA-256)

**Estructura del Token**:
```json
{
  "sub": "123",           // user_id
  "email": "user@example.com",
  "role": "STUDENT",      // ADMIN | SOCIO | STUDENT
  "exp": 1705315200,      // Timestamp de expiración
  "iat": 1705314300       // Timestamp de emisión
}
```

**Configuración**:
- **Duración**: 15 minutos (900 segundos)
- **Secret Key**: 256 bits (64 caracteres hex)
- **Almacenamiento Cliente**: localStorage (limpiado en logout)

**Flujo de Autenticación**:
```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Cliente │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /auth/login         │                          │
     ├─────────────────────────>│                          │
     │ {email, password}        │                          │
     │                          │ SELECT user WHERE email  │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │ User + password_hash     │
     │                          │                          │
     │                          │ Verify password          │
     │                          │ (Argon2id)               │
     │                          │                          │
     │                          │ Generate JWT             │
     │                          │                          │
     │<─────────────────────────┤                          │
     │ {access_token, ...}      │                          │
     │                          │                          │
     │ GET /auth/me             │                          │
     │ Authorization: Bearer .. │                          │
     ├─────────────────────────>│                          │
     │                          │ Verify JWT               │
     │                          │ Extract user_id          │
     │                          │                          │
     │                          │ SELECT user WHERE id     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │<─────────────────────────┤                          │
     │ User info                │                          │
```

### 2. Autorización (Authorization) - RBAC

**Ubicación**: `app/core/dependencies.py`

**Roles del Sistema**:

| Rol | Código | Descripción |
|-----|--------|-------------|
| Administrador | `ADMIN` | Acceso completo al sistema |
| Socioformador | `SOCIO` | Gestión de proyectos y códigos |
| Estudiante | `STUDENT` | Registro y check-in |

**Implementación de Dependencias**:

```python
# Requiere autenticación
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Extrae y verifica JWT, retorna usuario."""
    ...

# Requiere rol específico
def require_role(*allowed_roles: str):
    """Factory para dependencias de rol."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Helpers específicos por rol
async def get_current_admin(user = Depends(require_role("ADMIN"))) -> User: ...
async def get_current_socio(user = Depends(require_role("SOCIO"))) -> Socio: ...
async def get_current_student(user = Depends(require_role("STUDENT"))) -> Student: ...
```

**Uso en Endpoints**:
```python
@router.get("/admin/dashboard")
async def admin_dashboard(admin: User = Depends(get_current_admin)):
    """Solo accesible por ADMIN."""
    ...

@router.post("/student/enroll")
async def enroll(student: Student = Depends(get_current_student)):
    """Solo accesible por STUDENT."""
    ...
```

### 3. Criptografía

#### 3.1 Códigos de Inscripción - HMAC-SHA256

**Ubicación**: `app/services/crypto_service.py`

**Propósito**: Almacenar códigos de inscripción sin revelar texto plano

**Algoritmo**: HMAC-SHA256

**Flujo**:
```
1. Socio solicita generar código
   └─> Backend genera código aleatorio (ej: "ABC123")

2. Backend hashea código con HMAC
   └─> hash = HMAC-SHA256(secret_key, "ABC123")
   
3. Se almacena hash en DB, código se muestra al socio UNA VEZ
   └─> DB: {code_hash: "a1b2c3...", expires_at: timestamp}
   
4. Estudiante intenta redimir código "ABC123"
   └─> Backend hashea código ingresado
   └─> Compara hashes en tiempo constante
   └─> Si coincide y no expiró → válido
```

**Características de Seguridad**:
- ✅ **One-way**: No se puede revertir hash a código original
- ✅ **Constant-time comparison**: Previene timing attacks
- ✅ **Secret key**: Capa adicional de seguridad
- ✅ **Expiración**: 60-120 segundos
- ✅ **Single-use**: Marcado como usado después de redención

**Código**:
```python
def hash_enrollment_code(code: str) -> str:
    return hmac.new(
        secret_key.encode(),
        code.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_enrollment_code(code: str, code_hash: str) -> bool:
    expected_hash = hash_enrollment_code(code)
    return hmac.compare_digest(expected_hash, code_hash)
```

#### 3.2 Firmas Digitales - Ed25519

**Ubicación**: `app/services/crypto_service.py`

**Propósito**: Proveer autenticidad e integridad a recibos de inscripción

**Algoritmo**: Ed25519 (Curva Elíptica)

**Librería**: PyNaCl

**Generación de Claves** (una vez al inicio):
```python
import nacl.signing

# Generar par de claves
signing_key = nacl.signing.SigningKey.generate()
verify_key = signing_key.verify_key

# Almacenar en variables de entorno
SIGNING_PRIVATE_KEY = signing_key.encode(hex).decode()
SIGNING_PUBLIC_KEY = verify_key.encode(hex).decode()
```

**Firma de Recibos**:
```python
def sign_enrollment_receipt(data: dict) -> str:
    """
    data = {
        'student_id': 123,
        'project_id': 45,
        'slot_id': 67,
        'timestamp': '2024-01-15T10:30:00'
    }
    """
    message = f"{data['student_id']}|{data['project_id']}|{data['slot_id']}|{data['timestamp']}"
    signature = signing_key.sign(message.encode()).signature
    return signature.hex()
```

**Verificación de Recibos**:
```python
def verify_enrollment_receipt(data: dict, signature: str) -> bool:
    message = f"{data['student_id']}|{data['project_id']}|{data['slot_id']}|{data['timestamp']}"
    try:
        verify_key.verify(message.encode(), bytes.fromhex(signature))
        return True
    except nacl.exceptions.BadSignatureError:
        return False
```

**Propiedades**:
- ✅ **Autenticidad**: Solo el backend puede crear firmas válidas
- ✅ **Integridad**: Cualquier modificación invalida la firma
- ✅ **No repudio**: La firma prueba que el backend emitió el recibo
- ✅ **Verificación rápida**: Con clave pública

#### 3.3 Tokens QR para Check-in

**Propósito**: Verificación segura de entrada física

**Formato del Token**:
```
student_id|slot_id|expiration_timestamp|signature
123|45|1705315200|a1b2c3d4e5f6...
```

**Generación**:
```python
def generate_qr_token(student_id: int, slot_id: int, expiration_minutes: int = 30) -> str:
    expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
    expiration_ts = int(expiration.timestamp())
    
    message = f"{student_id}|{slot_id}|{expiration_ts}"
    signature = signing_key.sign(message.encode()).signature.hex()
    
    return f"{message}|{signature}"
```

**Verificación en Check-in**:
```python
def verify_qr_token(token: str) -> Optional[dict]:
    parts = token.split('|')
    student_id, slot_id, expiration_ts, signature = parts
    
    # Verificar expiración
    if int(expiration_ts) < int(datetime.utcnow().timestamp()):
        return None  # Expirado
    
    # Verificar firma
    message = f"{student_id}|{slot_id}|{expiration_ts}"
    try:
        verify_key.verify(message.encode(), bytes.fromhex(signature))
        return {'student_id': int(student_id), 'slot_id': int(slot_id)}
    except:
        return None  # Firma inválida
```

## 🛡️ Principios de Seguridad Implementados

### Defense in Depth (Defensa en Profundidad)

Múltiples capas de seguridad:
1. **Nivel de Transporte**: HTTPS (en producción)
2. **Nivel de Aplicación**: JWT + RBAC
3. **Nivel de Datos**: Hashing + Firmas digitales
4. **Nivel de Código**: Validación Pydantic

### Least Privilege (Privilegio Mínimo)

Cada rol solo puede acceder a lo estrictamente necesario:
- **STUDENT**: Solo sus propias inscripciones
- **SOCIO**: Solo proyectos de su organización
- **ADMIN**: Acceso completo (auditado)

### Fail-Secure (Fallar de Forma Segura)

Sistema niega acceso por defecto:
```python
# Requiere autenticación explícita
@router.get("/protected")
async def protected(user = Depends(get_current_user)):
    ...

# Role checking levanta excepción si falla
if user.role not in allowed_roles:
    raise HTTPException(status_code=403)  # Deniega
```

### Separation of Concerns (Separación de Responsabilidades)

Responsabilidades claramente separadas:
- `security.py`: Hashing de contraseñas
- `auth_service.py`: Generación y validación de JWT
- `crypto_service.py`: Operaciones criptográficas
- `dependencies.py`: Control de acceso RBAC

## 📊 Modelo de Amenazas

### Amenazas Mitigadas

| Amenaza | Mitigación |
|---------|------------|
| **Credential Stuffing** | Argon2id (resistente a fuerza bruta), Rate limiting |
| **Rainbow Tables** | Salt único por contraseña en Argon2id |
| **Timing Attacks (códigos)** | Comparación en tiempo constante (HMAC) |
| **Token Replay** | Expiración de tokens (15 min), Single-use codes |
| **MITM** | HTTPS en producción + firmas digitales |
| **Privilege Escalation** | RBAC estricto con validación en cada request |
| **SQL Injection** | SQLAlchemy ORM + validación Pydantic |
| **Falsificación de recibos** | Firmas digitales Ed25519 |
| **Registro remoto** | Verificación QR con firma + timestamps |

### Amenazas Pendientes (Roadmap)

| Semana | Amenaza | Solución Planeada |
|--------|---------|-------------------|
| 6 | QR reutilización | Check-in con validación de firma + marca en DB |
| 7 | OTP interceptación | Códigos de 60-120 seg, single-use |
| 9 | Brute force | Rate limiting avanzado por IP/usuario |
| 13 | Documentación completa | Modelo de amenazas final |

## 🔧 Configuración de Seguridad

### Variables de Entorno Críticas

```bash
# JWT Secret (256 bits mínimo)
JWT_SECRET_KEY=<64 caracteres hex>

# HMAC Secret para códigos
CODE_SECRET_KEY=<64 caracteres hex>

# Ed25519 Keys
SIGNING_PRIVATE_KEY=<64 caracteres hex>
SIGNING_PUBLIC_KEY=<64 caracteres hex>
```

### Generación de Claves

```bash
python generate_keys.py
```

### Rotación de Claves (Producción)

1. **JWT_SECRET_KEY**: Rotar cada 90 días
   - Genera nueva clave
   - Mantén ambas activas por periodo de transición
   - Retira clave antigua

2. **Ed25519 Keys**: Rotar cada 6-12 meses
   - Genera nuevo par
   - Firma nuevos recibos con nueva clave
   - Mantén clave pública antigua para verificar recibos históricos

3. **CODE_SECRET_KEY**: Rotar cada 30 días
   - Los códigos expiran en 120 segundos, bajo riesgo

## 📈 Próximos Pasos (Roadmap)

### Semana 6: Check-in con QR
- [ ] Endpoint POST `/check-in/verify`
- [ ] Validación de firma QR
- [ ] Prevención de check-in duplicado

### Semana 7: Códigos OTP
- [ ] Generación de códigos de un solo uso
- [ ] Sistema de expiración 60-120 seg
- [ ] Limpieza automática de códigos expirados

### Semana 9: Endurecimiento
- [ ] Rate limiting por IP y usuario
- [ ] Protección contra fuerza bruta
- [ ] Logging de eventos de seguridad

### Semana 13: Documentación Final
- [ ] Modelo de amenazas completo
- [ ] Análisis de riesgos
- [ ] Evidencia de controles de seguridad
- [ ] Recomendaciones de producción

## 📚 Referencias

- [Argon2id RFC](https://tools.ietf.org/html/rfc9106)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Ed25519 Paper](https://ed25519.cr.yp.to/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
