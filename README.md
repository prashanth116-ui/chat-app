# Chat App

A cross-platform chat application with geographic room organization, user verification, and real-time messaging.

## Features

- Real-time messaging with Socket.io
- Geographic room organization (by country/state)
- User verification (16+ age requirement)
- Gender display with icons
- PWA support for mobile
- PostgreSQL for data persistence
- Redis for caching and presence

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for PostgreSQL and Redis)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd chat-app
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure:**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Run migrations and seed:**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Build shared package:**
   ```bash
   pnpm --filter @chat-app/shared build
   ```

6. **Start development:**
   ```bash
   pnpm dev
   ```

   This starts both:
   - Client at http://localhost:5173
   - Server at http://localhost:3001

## Project Structure

```
chat-app/
├── packages/
│   ├── shared/      # Shared types and constants
│   ├── client/      # React PWA frontend
│   └── server/      # Node.js backend
├── infrastructure/  # Docker and nginx configs
├── scripts/         # Setup scripts
└── docker-compose.yml
```

## Development

### Commands

```bash
# Install all dependencies
pnpm install

# Start development (client + server)
pnpm dev

# Build all packages
pnpm build

# Run database migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Run linting
pnpm lint
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/chatapp` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - List rooms
- `GET /api/rooms/:id` - Get room
- `POST /api/rooms` - Create room
- `GET /api/rooms/country/:code` - Rooms by country

### Messages
- `GET /api/rooms/:id/messages` - Get messages

## Socket Events

### Client to Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send message
- `typing` - Typing indicator

### Server to Client
- `new_message` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User typing
- `online_users` - Online users list

## Production Deployment (DigitalOcean Droplet)

### 1. Create a Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Create a new Droplet:
   - **Image**: Ubuntu 24.04 LTS
   - **Size**: Basic $12/mo (2GB RAM) or higher recommended
   - **Region**: Choose closest to your users
   - **Authentication**: SSH keys (recommended)

### 2. Set Up the Server

SSH into your droplet and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Git
apt install git -y

# Clone your repo
git clone <your-repo-url> /opt/chat-app
cd /opt/chat-app

# Set up environment
cp .env.production .env
nano .env  # Edit with your values
```

### 3. Configure Environment

Edit `.env` with secure values:

```bash
POSTGRES_PASSWORD=<generate-strong-password>
JWT_SECRET=<generate-with: openssl rand -base64 32>
```

### 4. Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 5. Access Your App

Open `http://<your-droplet-ip>` in a browser.

### Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Update and redeploy
git pull && ./scripts/deploy.sh
```

### Adding a Domain (Optional)

1. Point your domain's A record to your droplet IP
2. Install Certbot for SSL:
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d yourdomain.com
   ```

## License

MIT
