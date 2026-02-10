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

## License

MIT
