#!/bin/bash

# Alfa Start AI - Deployment Script
# Server: 64.188.124.65
# Domain: alfa.necsoura.ru

set -e

echo "=== Alfa Start AI Deployment ==="
echo "Server: 64.188.124.65"
echo "Domain: alfa.necsoura.ru"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

echo "=== Building and starting services ==="

# Stop any existing containers
docker compose down 2>/dev/null || true

# Build and start all services
docker compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker exec alfastart-api node apps/api/node_modules/.bin/prisma db push --schema apps/api/prisma/schema.prisma --skip-generate 2>/dev/null || true

# Verify services
echo ""
echo "=== Service Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://alfa.necsoura.ru"
echo "API Docs: http://alfa.necsoura.ru/docs"
echo "Health:   http://alfa.necsoura.ru/health"
echo ""
echo "Don't forget to add A record for alfa.necsoura.ru pointing to 64.188.124.65"
