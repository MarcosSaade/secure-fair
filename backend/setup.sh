#!/bin/bash

# Secure Fair Backend - Setup Script
# This script sets up the backend development environment

set -e  # Exit on error

echo "=================================================="
echo "Secure Fair Backend - Development Setup"
echo "=================================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
echo "✓ Dependencies installed"
echo ""

# Generate cryptographic keys if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "Generating cryptographic keys..."
    python generate_keys.py
    echo ""
    echo "⚠️  IMPORTANT: Update your .env file with the generated keys!"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Wait for database (if using Docker)
if [ -f "../docker-compose.yml" ]; then
    echo "Checking if database is running..."
    if docker-compose ps | grep -q "db.*Up"; then
        echo "✓ Database is running"
    else
        echo "⚠️  Database is not running. Start it with:"
        echo "   docker-compose up -d db"
        echo ""
    fi
fi

echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Update .env file with generated keys (if needed)"
echo ""
echo "2. Start the database (if using Docker):"
echo "   docker-compose up -d db"
echo ""
echo "3. Initialize database with sample data:"
echo "   python init_db.py"
echo ""
echo "4. Or create an admin user:"
echo "   python create_admin.py admin@example.com password123"
echo ""
echo "5. Start the development server:"
echo "   uvicorn app.main:app --reload"
echo ""
echo "6. Access API documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "=================================================="
