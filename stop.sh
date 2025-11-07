#!/bin/bash

# Stop script for AI-Powered News Blog

echo "Stopping AI-Powered News Blog services..."
docker-compose down

echo ""
echo "Services stopped."
echo ""
echo "To remove all data (including database):"
echo "  docker-compose down -v"
echo ""
