# Project Specification - Secure Fair

## 1. Contexto

Cada semestre, el departamento de Servicio Social de la universidad organiza una feria donde los socioformadores presentan sus proyectos y los estudiantes se registran para participar. Actualmente, los estudiantes se registran para un horario específico para asistir a la feria (evitando aglomeraciones) y reciben un código QR para validar su entrada. Cada proyecto muestra un código QR estático que enlace a un formulario de registro.

Sin embargo, el sistema actual presenta desafíos operativos y de seguridad que requieren una solución integral y técnicamente robusta.

## 2. Planteamiento del Problema

El proceso actual sufre de cuatro problemas principales:

### 2.1 Compartir Códigos QR

Los estudiantes pueden tomar fotografías de los códigos QR de los proyectos y enviarlos a otros estudiantes, permitiendo registros remotos sin asistir físicamente a la feria. Esto elimina el propósito de la interacción presencial entre estudiantes y socioformadores.

### 2.2 Falta de Verificación de Presencia Física

Aunque los estudiantes deben reservar un horario, el proceso de registro al proyecto no está vinculado a la asistencia física verificada en la feria.

### 2.3 Registros Múltiples

Algunos estudiantes se registran en múltiples proyectos, lo cual viola las políticas de Servicio Social que requieren un único proyecto por período.

### 2.4 Control de Capacidad

Los proyectos con vacantes limitadas reciben aplicaciones excesivas sin mecanismos de control en tiempo real, utilizando formularios estáticos sin validación de capacidad o inscripción.

## 3. Objetivos del Proyecto

El sistema debe cumplir con los siguientes objetivos:

- ✅ Exigir asistencia física verificada antes del registro al proyecto
- ✅ Prevenir que los estudiantes se inscriban en múltiples proyectos dentro del mismo período
- ✅ Aplicar límites de capacidad por proyecto en tiempo real
- ✅ Proporcionar visibilidad operativa en tiempo real al departamento de Servicio Social
- ✅ Ser lo suficientemente simple para usuarios no técnicos (socioformadores)
- ✅ Incluir componentes criptográficos significativos como requisito del curso

## 4. Alcance

### 4.1 Incluido en el MVP

- Sistema de autenticación basado en roles (Administrador, Socioformador, Estudiante)
- Gestión de organizaciones, proyectos, períodos y franjas horarias
- Sistema de registro de estudiantes a franjas horarias con control de capacidad
- Generación de códigos QR firmados para entrada
- Verificación de entrada (check-in) con escaneo o entrada manual
- Generación de códigos de inscripción de un solo uso con caducidad
- Proceso de inscripción condicionado a verificación física
- Restricción de un proyecto por período por estudiante
- Panel de métricas y analíticas para administradores
- Exportación de datos maestros y por proyecto
- Implementación criptográfica (recibos de inscripción firmados digitalmente)

### 4.2 Excluido del MVP

- Lista de espera automática cuando los proyectos están llenos
- Importación de datos mediante Excel (se considerará para iteraciones posteriores)
- Sistema de notificaciones por correo o SMS
- Aplicación móvil nativa
- Integración con sistemas institucionales externos

## 5. Roles del Sistema

### 5.1 Estudiante

**Responsabilidades:**
- Registrarse en una franja horaria disponible
- Obtener código QR de entrada
- Verificar su entrada en la feria
- Ingresar código de inscripción proporcionado por el socioformador
- Aceptar las reglas del proyecto
- Recibir confirmación de inscripción firmada

**Restricciones:**
- Solo puede registrarse en un proyecto por período de feria
- Debe estar físicamente verificado (check-in) para inscribirse
- No puede compartir códigos de inscripción (son de un solo uso)

### 5.2 Socioformador

**Responsabilidades:**
- Acceder al panel con proyectos asignados
- Generar códigos de inscripción de corta duración
- Mostrar código en stand físico
- Ver conteo en tiempo real de inscripciones
- Exportar lista de estudiantes inscritos

**Características del diseño:**
- Interfaz minimalista diseñada para usuarios no técnicos
- Operación sin conocimientos de programación
- Generación de códigos con un clic

### 5.3 Administrador (Servicio Social)

**Responsabilidades:**
- Crear y gestionar períodos de feria
- Gestionar organizaciones y proyectos
- Definir franjas horarias con capacidades
- Asignar socioformadores a proyectos
- Monitorear asistencia en tiempo real
- Revisar analíticas de inscripciones
- Exportar tablas maestras de registro
- Realizar verificación de entrada (check-in)

## 6. Arquitectura del Sistema

### 6.1 Stack Tecnológico

- **Frontend**: React con Vite y TypeScript, Material-UI o shadcn/ui, React Router, React Query
- **Backend**: FastAPI (Python), SQLAlchemy 2.0, Alembic para migraciones
- **Base de Datos**: PostgreSQL con restricciones transaccionales
- **Autenticación**: JWT con tokens de acceso de corta duración
- **Criptografía**: Ed25519 para firmas digitales usando PyNaCl o cryptography
- **Hashing**: argon2-cffi para contraseñas, HMAC para códigos
- **DevOps**: Docker Compose, despliegue en Render/Fly.io/Railway

### 6.2 Diagrama de Alto Nivel

```
+-------------+         +-------------+         +--------------+
|   Cliente   | HTTPS   |   FastAPI   |  SQL    |  PostgreSQL  |
|   React     +-------->|   Backend   +-------->|   Database   |
|   (SPA)     |<--------+   (API)     |<--------+              |
+-------------+         +-------------+         +--------------+
                              |
                              | Crypto Operations
                              v
                        +-------------+
                        |  Ed25519    |
                        |  Signing    |
                        +-------------+
```

## 7. Características Centrales (MVP)

### 7.1 Autenticación y Control de Acceso Basado en Roles (RBAC)
- Login/logout con JWT
- Protección de endpoints por rol
- Verificación de permisos en servidor

### 7.2 Gestión de Organizaciones y Proyectos
- CRUD de organizaciones socioformadoras
- CRUD de proyectos con descripción y reglas
- Asignación de capacidad por proyecto
- Vinculación de socioformadores a proyectos

### 7.3 Registro a Franjas Horarias
- Estudiantes reservan franja horaria
- Validación de capacidad antes de confirmar
- Restricción de registro único por estudiante

### 7.4 Sistema de Verificación de Entrada
- Generación de QR firmado para cada reservación
- Endpoint de check-in para administradores
- Marca temporal de verificación
- Dashboard de asistencia en tiempo real

### 7.5 Generación de Códigos de Inscripción
- Socioformador genera código alfanumérico corto
- Almacenamiento como hash HMAC (no texto plano)
- Caducidad configurable (60-120 segundos)
- Un solo uso por código

### 7.6 Inscripción Condicionada
- Estudiante ingresa código manualmente
- Validación de check-in previo obligatorio
- Verificación de inscripción única por período
- Validación de capacidad disponible
- Transacción atómica para prevenir condiciones de carrera

### 7.7 Recibos de Inscripción Firmados
- Generación de recibo con firma Ed25519
- Almacenamiento de firma en base de datos
- Endpoint de verificación de integridad

### 7.8 Analíticas y Reportes
- Dashboard con métricas clave
- Gráficas de asistencia por franja horaria
- Inscripciones por proyecto
- Tasas de ocupación

### 7.9 Exportación de Datos
- Exportación maestra en CSV/XLSX
- Exportación por proyecto para socioformadores
- Filtros por período y organización

## 8. Flujos de Alto Nivel

### 8.1 Flujo de Registro a Franja Horaria

1. Estudiante ingresa al sistema
2. Visualiza franjas horarias disponibles del período activo
3. Selecciona franja con cupos disponibles
4. Sistema valida capacidad en tiempo real
5. Confirma registro
6. Sistema genera código QR firmado
7. Estudiante descarga o visualiza QR

### 8.2 Flujo de Verificación de Entrada

1. Estudiante llega a la entrada de la feria
2. Muestra código QR al personal de Servicio Social
3. Administrador escanea o ingresa token manualmente
4. Sistema verifica firma digital y validez temporal
5. Sistema marca estudiante como verificado (check-in)
6. Estudiante recibe confirmación de acceso

### 8.3 Flujo de Inscripción a Proyecto

1. Socioformador genera código desde su panel
2. Sistema crea código aleatorio, lo hashea y establece caducidad
3. Código se muestra en pantalla del socioformador
4. Estudiante (verificado previamente) ingresa código en su aplicación
5. Sistema valida:
   - Estudiante tiene check-in activo
   - Código es válido y no ha expirado
   - Código no ha sido usado
   - Estudiante no está inscrito en otro proyecto del período
   - Proyecto tiene capacidad disponible
6. Si todas las validaciones pasan:
   - Se crea registro de inscripción
   - Se marca código como usado
   - Se genera recibo firmado digitalmente
   - Se decrementa capacidad disponible
7. Estudiante recibe confirmación con recibo firmado

## 9. Modelo de Seguridad

### 9.1 Principios de Seguridad

- **Defensa en profundidad**: Validación tanto en cliente como en servidor
- **Privilegio mínimo**: Cada rol solo accede a recursos necesarios
- **Fail-secure**: Fallos resultan en denegación de acceso, no en permisos
- **Separación de responsabilidades**: Lógica crítica aislada en capa de negocio

### 9.2 Control de Acceso

**Implementación RBAC:**
- Roles definidos en base de datos (ADMIN, SOCIO, STUDENT)
- Decoradores en endpoints verifican rol requerido
- Tokens JWT incluyen rol en payload
- Validación de pertenencia (socioformador solo ve sus proyectos)

### 9.3 Protección de Endpoints

- Autenticación requerida en todos los endpoints excepto /auth/login
- Validación de rol específico por endpoint
- Rate limiting en endpoints críticos (redención de códigos, check-in)
- Validación de entrada con Pydantic schemas

### 9.4 Protección contra Ataques Comunes

- **Fuerza bruta**: Límite de intentos de login, códigos de inscripción
- **Inyección SQL**: Uso de ORM parametrizado (SQLAlchemy)
- **XSS**: Sanitización en frontend, Content-Security-Policy headers
- **CSRF**: Tokens JWT en headers (no cookies), SameSite si se usan cookies
- **Timing attacks**: Comparación constante de hashes
- **Condiciones de carrera**: Transacciones con SELECT FOR UPDATE

## 10. Criterios de Éxito

### 10.1 Funcionales

- El sistema previene exitosamente inscripciones remotas (sin check-in)
- Los estudiantes no pueden inscribirse en más de un proyecto por período
- Los límites de capacidad se respetan en todos los escenarios
- Los códigos expiran correctamente y son de un solo uso
- Los recibos firmados son verificables y detectan manipulación
- Las exportaciones contienen datos completos y correctos

### 10.2 No Funcionales

- **Performance**: Carga de página < 2s, redención de código < 500ms
- **Disponibilidad**: Uptime > 99% durante período de feria activa
- **Usabilidad**: Socioformadores pueden generar códigos sin capacitación
- **Seguridad**: Cero vulnerabilidades críticas en pruebas de seguridad
- **Escalabilidad**: Soporte para 500+ estudiantes simultáneos

### 10.3 Académicos

- Demostración clara del componente criptográfico
- Documentación técnica completa de arquitectura
- Código fuente bien estructurado y comentado
- Pruebas automatizadas con cobertura > 70%
- Presentación efectiva con demo en vivo funcional

---

**Fecha**: Febrero 2026  
**Versión**: 1.0
