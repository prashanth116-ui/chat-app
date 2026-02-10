#!/bin/bash

set -e

echo "Setting up Chat App..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Installing..." >&2; npm install -g pnpm; }

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update .env with your configuration."
fi

# Build shared package
echo "Building shared package..."
pnpm --filter @chat-app/shared build

# Start Docker services
echo "Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
sleep 5

# Run migrations
echo "Running database migrations..."
pnpm db:migrate

# Seed database
echo "Seeding database..."
pnpm db:seed

echo ""
echo "Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev"
echo ""
echo "Or with Docker:"
echo "  docker-compose --profile dev up"
echo ""
