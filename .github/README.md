# CI/CD Setup Guide

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## Overview

### CI Pipeline (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Backend Tests:**
- Linting with Ruff
- Code formatting check with Black
- Type checking with MyPy
- Unit tests with pytest
- Code coverage reporting

**Frontend Tests:**
- Linting with ESLint
- Code formatting check with Prettier
- Type checking with TypeScript
- Unit tests with Vitest
- Code coverage reporting
- Build verification

**Security:**
- npm audit for frontend dependencies
- pip-audit for backend dependencies
- Docker build verification

### CD Pipeline (`.github/workflows/cd.yml`)
Runs on push to `main` branch.

**Actions:**
- Build and push Docker images to registry
- Tag images with branch name, commit SHA, and `latest`
- Send email notification on deployment status

## Required Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Docker Registry
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

### Email Notifications (Optional)
- `MAIL_USERNAME` - Gmail address for sending notifications
- `MAIL_PASSWORD` - Gmail app password ([create one here](https://myaccount.google.com/apppasswords))
- `NOTIFICATION_EMAIL` - Email address to receive deployment notifications

## Dependabot

Dependabot is configured to automatically check for dependency updates weekly and create pull requests.

It monitors:
- Python packages (backend)
- npm packages (frontend)
- GitHub Actions
- Docker base images

## Code Coverage

Coverage reports are uploaded to Codecov (optional). To enable:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Add `CODECOV_TOKEN` to GitHub secrets (if private repo)

## Local Testing

### Backend
```bash
cd backend
pip install -r requirements.txt
pytest tests/ --cov=app
ruff check app/
black --check app/
mypy app/
```

### Frontend
```bash
cd frontend
npm install
npm run test
npm run lint
npm run format
npx tsc --noEmit
npm run build
```

## Docker Build

Test Docker builds locally:

```bash
# Backend
docker build -t secure-fair-backend:local ./backend

# Frontend
docker build -t secure-fair-frontend:local ./frontend

# Full stack
docker-compose up --build
```

## Workflow Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/secure-fair/workflows/CI/badge.svg)
![CD](https://github.com/YOUR_USERNAME/secure-fair/workflows/CD%20-%20Deploy/badge.svg)
```

## Troubleshooting

### Tests failing locally but passing in CI
- Check Python/Node versions match
- Ensure all dependencies are installed
- Check for environment-specific issues

### Docker build fails
- Verify Dockerfile syntax
- Check if all required files are present
- Ensure .dockerignore doesn't exclude necessary files

### Deployment notifications not working
- Verify email secrets are set correctly
- Check Gmail app password is valid
- Ensure less secure app access is enabled (or use app passwords)

## Future Improvements

- [ ] Add integration tests
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Implement database migration checks
- [ ] Add staging environment deployment
- [ ] Implement manual approval for production deployments
- [ ] Add performance testing
- [ ] Implement automated rollback on failure
