#!/bin/bash
set -e

echo "=== Chat App Deployment Script ==="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Copy .env.production to .env and fill in your values:"
    echo "  cp .env.production .env"
    echo "  nano .env"
    exit 1
fi

# Check required env vars
source .env
if [ "$POSTGRES_PASSWORD" = "CHANGE_THIS_TO_A_STRONG_PASSWORD" ]; then
    echo "Error: Please change POSTGRES_PASSWORD in .env"
    exit 1
fi
if [ "$JWT_SECRET" = "CHANGE_THIS_TO_A_RANDOM_STRING" ]; then
    echo "Error: Please change JWT_SECRET in .env"
    exit 1
fi

echo "1. Pulling latest code..."
git pull origin main || echo "Git pull skipped (not a git repo or no remote)"

echo "2. Building and starting containers..."
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo "3. Waiting for services to be healthy..."
sleep 10

echo "4. Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T server node packages/server/dist/db/migrate.js || echo "Migrations skipped"

echo "5. Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployment Complete ==="
echo "Your app should be running at http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker compose -f docker-compose.prod.yml down"
echo "  Restart:       docker compose -f docker-compose.prod.yml restart"
