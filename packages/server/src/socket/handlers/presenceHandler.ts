import type { Server, Socket } from 'socket.io';
import { heartbeat } from '../../config/redis.js';
import { updateLastSeen } from '../../models/User.js';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function registerPresenceHandlers(_io: Server, socket: Socket) {
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // Start heartbeat when socket connects
  if (socket.user) {
    heartbeatTimer = setInterval(async () => {
      try {
        // Update last seen in database
        await updateLastSeen(socket.user!.userId);

        // Get rooms the socket is in
        const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);

        // Send heartbeat to each room
        for (const roomId of rooms) {
          await heartbeat(socket.user!.userId, roomId);
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, HEARTBEAT_INTERVAL);
  }

  // Handle manual heartbeat from client
  socket.on('heartbeat', async () => {
    if (!socket.user) return;

    try {
      await updateLastSeen(socket.user.userId);

      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        await heartbeat(socket.user.userId, roomId);
      }
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
  });
}
