#!/bin/bash

echo "🚀 Setting up JobPulse..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/env.example frontend/.env
fi

echo "✅ Environment files created"

# Create logs directory
mkdir -p backend/logs

echo "✅ Logs directory created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  docker-compose up --build"
echo ""
echo "To access the application:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:4000"
echo "  Database: localhost:5432"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
echo "For development:"
echo "  Backend: cd backend && npm install && npm run dev"
echo "  Frontend: cd frontend && npm install && npm run dev"
