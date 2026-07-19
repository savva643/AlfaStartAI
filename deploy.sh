#!/bin/bash
# Alfa Start AI - Production Deployment
# Server: 64.188.124.65
# Domain: alfa.necsoura.ru
set -e

echo "=== Alfa Start AI ==="

# Install certbot
echo "[1/4] Installing certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1
fi

# Build and start
echo "[2/4] Building..."
docker compose down 2>/dev/null || true
docker compose up -d --build
echo "Waiting..."
sleep 15

# DB
echo "[3/4] Database..."
docker exec alfastart-api sh -c "DATABASE_URL='postgresql://postgres:postgres@postgres:5432/alfa_start_ai' node /app/node_modules/.pnpm/prisma@6.19.3_typescript@5.9.3/node_modules/prisma/build/index.js db push --schema /app/apps/api/prisma/schema.prisma --skip-generate" 2>/dev/null || true

# SSL
echo "[4/4] SSL..."
certbot --nginx -d alfa.necsoura.ru --non-interactive --agree-tos --email admin@necsoura.ru --redirect 2>/dev/null || echo "Run later: certbot --nginx -d alfa.necsoura.ru --redirect"

echo ""
docker ps --format "table {{.Names}}\t{{.Status}}" | grep alfastart
echo ""
echo "=== https://alfa.necsoura.ru ==="
