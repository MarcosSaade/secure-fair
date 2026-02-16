# Deployment Guide - Secure Fair

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 15+ (or use managed database)
- Node.js 18+ and npm
- Python 3.11+
- Git

## Environment Variables

### Backend (.env)

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/securefair

# Security
JWT_SECRET_KEY=<generate-random-256-bit-key>
CODE_SECRET_KEY=<generate-random-256-bit-key>
ED25519_PRIVATE_KEY=<generate-ed25519-private-key>
ED25519_PUBLIC_KEY=<generate-ed25519-public-key>

# Server
ENVIRONMENT=development
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# QR Code
QR_TOKEN_EXPIRE_HOURS=24
ENROLLMENT_CODE_EXPIRE_SECONDS=120
```

### Frontend (.env)

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Secure Fair
```

## Generate Cryptographic Keys

### JWT Secret Key
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### HMAC Code Secret
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Ed25519 Keys
```python
import nacl.signing
import nacl.encoding

# Generate signing key pair
signing_key = nacl.signing.SigningKey.generate()
verify_key = signing_key.verify_key

# Encode to Base64 for storage
private_key = signing_key.encode(encoder=nacl.encoding.Base64Encoder).decode()
public_key = verify_key.encode(encoder=nacl.encoding.Base64Encoder).decode()

print(f"ED25519_PRIVATE_KEY={private_key}")
print(f"ED25519_PUBLIC_KEY={public_key}")
```

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd secure-fair
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# (Optional) Load seed data
python scripts/seed_data.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Database Setup (Docker)

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name securefair-db \
  -e POSTGRES_USER=securefair \
  -e POSTGRES_PASSWORD=changeme \
  -e POSTGRES_DB=securefair \
  -p 5432:5432 \
  postgres:15
```

## Docker Compose Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: securefair
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: securefair
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U securefair"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://securefair:changeme@db:5432/securefair
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Production Deployment

### Option 1: Render

#### Backend Deployment

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
   - **Environment**: Python 3.11
4. Add environment variables from `.env`
5. Create managed PostgreSQL database on Render
6. Update `DATABASE_URL` to Render PostgreSQL connection string

#### Frontend Deployment

1. Create new Static Site on Render
2. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Add environment variable `VITE_API_URL` pointing to backend URL

### Option 2: Fly.io

#### Backend Deployment

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Initialize app
cd backend
flyctl launch

# Set secrets
flyctl secrets set JWT_SECRET_KEY=<your-key>
flyctl secrets set DATABASE_URL=<postgres-url>

# Deploy
flyctl deploy
```

#### Frontend Deployment

Similar process, deploy as static site

### Option 3: Railway

1. Connect GitHub repository to Railway
2. Railway auto-detects Python/Node.js projects
3. Add environment variables
4. Deploy automatically on push

### Database Backups

#### Automated Backups (PostgreSQL)

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/securefair_$TIMESTAMP.sql"

pg_dump -U securefair securefair > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "securefair_*.sql" -mtime +7 -delete
```

Add to cron:
```bash
0 2 * * * /path/to/backup.sh
```

#### Restore from Backup

```bash
psql -U securefair securefair < backup_file.sql
```

## Monitoring

### Health Check Endpoint

Backend includes `/health` endpoint:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
    "status": "healthy",
    "database": "connected",
    "timestamp": "2026-02-16T10:00:00Z"
}
```

### Logging

#### Backend Logging

Configured in `app/core/logging.py`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
```

#### View Logs

```bash
# Docker Compose
docker-compose logs -f backend

# Direct
tail -f backend/app.log
```

## Security Hardening

### HTTPS/TLS

#### With Nginx

```nginx
server {
    listen 80;
    server_name api.securefair.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.securefair.com;

    ssl_certificate /etc/letsencrypt/live/api.securefair.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.securefair.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Headers

Add to backend `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://securefair.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Database Security

```sql
-- Create read-only user for backups
CREATE USER securefair_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE securefair TO securefair_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO securefair_readonly;
```

## Performance Optimization

### Database Indexing

Ensure all indexes from schema are created:

```bash
alembic upgrade head
```

### Connection Pooling

Configure in `app/core/database.py`:

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

### Caching (Optional)

For production, consider Redis for caching:

```bash
pip install redis
```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -U securefair -h localhost -d securefair

# Check if PostgreSQL is running
systemctl status postgresql

# Check logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Migration Issues

```bash
# Check current migration version
alembic current

# Rollback one migration
alembic downgrade -1

# Re-apply
alembic upgrade head
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

---

**Version**: 1.0  
**Last Update**: February 2026
