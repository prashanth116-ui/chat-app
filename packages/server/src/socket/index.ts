import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { socketAuthMiddleware } from './middleware/socketAuth.js';
import { registerChatHandlers } from './handlers/chatHandler.js';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { registerPresenceHandlers } from './handlers/presenceHandler.js';
import { registerDMHandlers } from './handlers/dmHandler.js';

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up Redis adapter for multi-instance support
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO Redis adapter connected');
  }).catch((err) => {
    console.error('Failed to connect Redis adapter:', err);
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, user: ${socket.user?.userId}`);

    // Register handlers
    registerChatHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerDMHandlers(io, socket);

    // Join personal room for notifications
    if (socket.user) {
      socket.join(`user:${socket.user.userId}`);
    }

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
}
