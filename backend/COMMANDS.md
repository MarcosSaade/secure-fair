# Secure Fair Backend - Comandos Útiles

## 🚀 Inicio Rápido

```bash
# Setup completo automático
python3 quickstart.py

# O manual:
python3 generate_keys.py              # Generar claves
python3 -m venv venv                  # Crear entorno virtual
source venv/bin/activate              # Activar entorno (Linux/Mac)
pip install -r requirements.txt       # Instalar dependencias
python3 init_db.py                    # Inicializar base de datos
uvicorn app.main:app --reload         # Iniciar servidor
```

## 🗄️ Base de Datos

```bash
# Inicializar con datos de ejemplo
python3 init_db.py

# Crear solo usuario admin
python3 create_admin.py admin@example.com password123 "Admin Name"

# Con Docker
docker-compose up -d db               # Iniciar PostgreSQL
docker-compose down                   # Detener servicios
docker-compose logs db                # Ver logs
```

## 🔐 Seguridad

```bash
# Generar nuevas claves criptográficas
python3 generate_keys.py

# Verificar archivo .env
cat .env | grep SECRET

# Testing de seguridad
pytest tests/test_auth.py -v
```

## 🏃 Servidor de Desarrollo

```bash
# Modo desarrollo (auto-reload)
uvicorn app.main:app --reload

# Especificar host y puerto
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Con log detallado
uvicorn app.main:app --reload --log-level debug

# Sin auto-reload (más rápido)
uvicorn app.main:app
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
pytest

# Con verbose
pytest -v

# Con cobertura
pytest --cov=app

# Cobertura con reporte HTML
pytest --cov=app --cov-report=html
# Abrir htmlcov/index.html

# Test específico
pytest tests/test_auth.py::TestAuthentication::test_login_success

# Watch mode (re-ejecutar en cambios)
pytest-watch
```

## 🔍 Linting y Formateo

```bash
# Formatear código con Black
black app/

# Revisar con Black (sin modificar)
black --check app/

# Linting con Ruff
ruff check app/

# Auto-fix con Ruff
ruff check --fix app/

# Type checking con mypy
mypy app/
```

## 📊 Inspección de Base de Datos

```bash
# Conectar a PostgreSQL (Docker)
docker-compose exec db psql -U postgres -d secure_fair

# Comandos PostgreSQL útiles:
\dt                    # Listar tablas
\d users               # Describir tabla users
SELECT * FROM users;   # Consultar usuarios
\q                     # Salir
```

## 🐳 Docker

```bash
# Construir imagen backend
docker build -t secure-fair-backend .

# Ejecutar contenedor
docker run -p 8000:8000 secure-fair-backend

# Con docker-compose
docker-compose up                     # Iniciar todos los servicios
docker-compose up -d                  # Iniciar en background
docker-compose up --build             # Rebuild y start
docker-compose down                   # Detener servicios
docker-compose down -v                # Detener y eliminar volúmenes
docker-compose logs -f backend        # Ver logs en vivo
docker-compose exec backend bash      # Shell en contenedor
```

## 📝 Gestión de Dependencias

```bash
# Instalar nueva dependencia
pip install package-name
pip freeze > requirements.txt

# Actualizar dependencia
pip install --upgrade package-name
pip freeze > requirements.txt

# Instalar desde requirements.txt
pip install -r requirements.txt

# Verificar dependencias desactualizadas
pip list --outdated
```

## 🔧 Utilidades

```bash
# Verificar estructura del proyecto
tree -I 'venv|__pycache__|*.pyc|.git'

# Contar líneas de código
find app -name "*.py" | xargs wc -l

# Buscar TODOs
grep -r "TODO\|FIXME" app/

# Ver endpoints disponibles
curl http://localhost:8000/docs

# Health check
curl http://localhost:8000/health
```

## 🧹 Limpieza

```bash
# Eliminar archivos compilados Python
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Eliminar coverage reports
rm -rf htmlcov/
rm .coverage

# Eliminar entorno virtual
rm -rf venv/

# Limpieza completa
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete
rm -rf htmlcov/ .coverage venv/ .pytest_cache/
```

## 📡 Testing de API

```bash
# Login (obtener token)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securefair.com","password":"admin123"}'

# Guardar token en variable
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar token en requests
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Registro de usuario
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "password":"password123",
    "full_name":"Test Student",
    "role":"STUDENT",
    "student_id_number":"A01234567",
    "major":"Computer Science",
    "semester":5
  }'
```

## 🌐 Navegación

```bash
# Documentación interactiva
open http://localhost:8000/docs       # Swagger UI
open http://localhost:8000/redoc      # ReDoc

# API endpoints
http://localhost:8000                 # Root
http://localhost:8000/health          # Health check
http://localhost:8000/api/info        # API info
```

## 📚 Variables de Entorno

```bash
# Ver variables cargadas
python3 -c "from app.core.config import settings; print(settings.ENVIRONMENT)"

# Verificar DATABASE_URL
python3 -c "from app.core.config import settings; print(settings.DATABASE_URL)"

# Cambiar entorno temporalmente
ENVIRONMENT=production uvicorn app.main:app
```

## 🎯 Atajos Comunes

```bash
# Desarrollo típico:
source venv/bin/activate && uvicorn app.main:app --reload

# Testing completo:
pytest -v --cov=app --cov-report=html && open htmlcov/index.html

# Reiniciar base de datos:
docker-compose down -v && docker-compose up -d db && python3 init_db.py

# Deploy local completo:
docker-compose down && docker-compose up --build
```

## 🆘 Solución de Problemas

```bash
# Puerto 8000 ocupado
lsof -ti:8000 | xargs kill -9

# Reinstalar dependencias
pip install --force-reinstall -r requirements.txt

# Verificar conectividad a base de datos
python3 -c "from app.db.database import engine; engine.connect()"

# Verificar claves en .env
python3 -c "from app.core.config import settings; assert len(settings.JWT_SECRET_KEY) >= 32"

# Reset completo base de datos
docker-compose down -v
docker-compose up -d db
sleep 5
python3 init_db.py
```

## 📖 Documentación

```bash
# Generar documentación del código
pdoc --html app -o docs/

# Ver estructura de módulos
pydeps app --noshow --max-bacon 2

# Generar diagrama de base de datos
eralchemy -i 'postgresql://postgres:postgres@localhost:5432/secure_fair' -o docs/db_diagram.png
```

## Credenciales de Desarrollo

**Después de ejecutar `init_db.py`:**

```
ADMIN:
  Email: admin@securefair.com
  Password: admin123

SOCIO:
  Email: socio@bamx.org.mx
  Password: socio123

STUDENTS:
  Email: student1@tec.mx, student2@tec.mx, student3@tec.mx
  Password: student123
```
