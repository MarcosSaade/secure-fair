#!/bin/bash
# Quick CI/CD Setup Script

echo "🚀 Setting up CI/CD for Secure Fair..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📦 Installing Frontend Dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   ✓ Dependencies already installed"
fi

echo ""
echo "🧪 Running Frontend Tests..."
npm run test -- --run
FRONTEND_TEST_EXIT=$?

echo ""
echo "🎨 Checking Frontend Code Style..."
npm run lint
npm run format -- --check

echo ""
echo "🔍 Type Checking Frontend..."
npx tsc --noEmit
FRONTEND_TYPE_EXIT=$?

cd ..

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "🧪 Running Backend Tests..."
pytest tests/ -v --cov=app
BACKEND_TEST_EXIT=$?

echo ""
echo "🎨 Checking Backend Code Style..."
ruff check app/ tests/
black --check app/ tests/

echo ""
echo "🔍 Type Checking Backend..."
mypy app/
BACKEND_TYPE_EXIT=$?

deactivate
cd ..

echo ""
echo "🐳 Testing Docker Builds..."
echo "   Building backend..."
docker build -t secure-fair-backend:test ./backend --quiet
BACKEND_DOCKER_EXIT=$?

echo "   Building frontend..."
docker build -t secure-fair-frontend:test ./frontend --quiet
FRONTEND_DOCKER_EXIT=$?

echo ""
echo "================================================"
echo "📊 CI/CD Setup Summary"
echo "================================================"

if [ $FRONTEND_TEST_EXIT -eq 0 ]; then
    echo "✅ Frontend Tests: PASSED"
else
    echo "❌ Frontend Tests: FAILED"
fi

if [ $FRONTEND_TYPE_EXIT -eq 0 ]; then
    echo "✅ Frontend Type Check: PASSED"
else
    echo "❌ Frontend Type Check: FAILED"
fi

if [ $BACKEND_TEST_EXIT -eq 0 ]; then
    echo "✅ Backend Tests: PASSED"
else
    echo "❌ Backend Tests: FAILED"
fi

if [ $BACKEND_TYPE_EXIT -eq 0 ]; then
    echo "✅ Backend Type Check: PASSED"
else
    echo "❌ Backend Type Check: FAILED"
fi

if [ $BACKEND_DOCKER_EXIT -eq 0 ]; then
    echo "✅ Backend Docker Build: PASSED"
else
    echo "❌ Backend Docker Build: FAILED"
fi

if [ $FRONTEND_DOCKER_EXIT -eq 0 ]; then
    echo "✅ Frontend Docker Build: PASSED"
else
    echo "❌ Frontend Docker Build: FAILED"
fi

echo ""
echo "================================================"
echo "📝 Next Steps:"
echo "================================================"
echo "1. Add GitHub Secrets (required for CD):"
echo "   - DOCKER_USERNAME"
echo "   - DOCKER_PASSWORD"
echo "   - MAIL_USERNAME (optional)"
echo "   - MAIL_PASSWORD (optional)"
echo "   - NOTIFICATION_EMAIL (optional)"
echo ""
echo "2. Push your changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add CI/CD workflows'"
echo "   git push origin main"
echo ""
echo "3. Check GitHub Actions tab to see workflows run"
echo ""
echo "📖 See .github/README.md for detailed documentation"
echo "================================================"
