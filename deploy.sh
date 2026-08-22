#!/bin/bash
set -e

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found."
    echo "Create it from .env.prod.example first:"
    echo "  cp .env.prod.example .env"
    echo "Then edit .env and fill in the real secrets and domain."
    exit 1
fi

echo "==> Pulling latest code (if running from a git repo)..."
git pull --ff-only 2>/dev/null || true

echo "==> Building and starting production stack..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Waiting for core infrastructure to become healthy..."
sleep 20

echo "==> Production deployment started."
echo ""
echo "Check status with: docker compose -f docker-compose.prod.yml ps"
echo "View logs with:    docker compose -f docker-compose.prod.yml logs -f"
