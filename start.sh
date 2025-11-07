#!/bin/bash

# Startup script for AI-Powered News Blog
# This script checks prerequisites and starts the Docker containers

echo "================================"
echo "AI-Powered News Blog - Startup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f "node-news-api/.env" ]; then
    echo "Warning: node-news-api/.env file not found!"
    echo "Copying .env.example to node-news-api/.env..."
    cp .env.example node-news-api/.env
    echo ""
    echo "IMPORTANT: Please edit node-news-api/.env and add your API keys:"
    echo "  - OPENAI_API_KEY"
    echo "  - RAPIDAPI_KEY"
    echo "  - JWT_SECRET (generate a secure random string)"
    echo ""
    read -p "Press Enter once you've updated the .env file..."
fi

echo "Starting services..."
echo ""

# Build and start containers
docker-compose up --build -d

echo ""
echo "================================"
echo "Services Starting..."
echo "================================"
echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check service status
docker-compose ps

echo ""
echo "================================"
echo "Service URLs:"
echo "================================"
echo "Admin Panel: http://localhost:3000"
echo "Backend API: http://localhost:4000"
echo "MongoDB:     localhost:27017"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To seed admin user:"
echo "  docker-compose exec backend npm run seed:admin"
echo ""
