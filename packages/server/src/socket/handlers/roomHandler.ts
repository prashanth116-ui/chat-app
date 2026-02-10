import type { Server, Socket } from 'socket.io';
import { SocketEvents, type JoinRoomPayload, type LeaveRoomPayload } from '@chat-app/shared';
import * as roomService from '../../services/roomService.js';
import { setUserOnline, setUserOffline, getOnlineUsers } from '../../config/redis.js';
import { getPublicUser, getPublicUsersByIds } from '../../models/User.js';

// Track which rooms each socket is in
const socketRooms = new Map<string, Set<string>>();

export function registerRoomHandlers(io: Server, socket: Socket) {
  // Handle joining a room
  socket.on(SocketEvents.JOIN_ROOM, async (data: JoinRoomPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { roomId } = data;

      // Verify room exists
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
        return;
      }

      // Join the socket room
      await socket.join(roomId);

      // Track room membership
      if (!socketRooms.has(socket.id)) {
        socketRooms.set(socket.id, new Set());
      }
      socketRooms.get(socket.id)!.add(roomId);

      // Join room in database if not already member
      await roomService.joinRoom(roomId, socket.user.userId);

      // Mark user online in Redis
      await setUserOnline(socket.user.userId, roomId);

      // Get user info
      const user = await getPublicUser(socket.user.userId);

      if (user) {
        // Notify others that user joined
        socket.to(roomId).emit(SocketEvents.USER_JOINED, { user, roomId });
      }

      // Send current online users to the joining user
      const onlineUserIds = await getOnlineUsers(roomId);
      const onlineUsers = await getPublicUsersByIds(onlineUserIds);
      socket.emit(SocketEvents.ONLINE_USERS, { roomId, users: onlineUsers });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to join room' });
    }
  });

  // Handle leaving a room
  socket.on(SocketEvents.LEAVE_ROOM, async (data: LeaveRoomPayload) => {
    try {
      if (!socket.user) return;

      const { roomId } = data;

      await handleLeaveRoom(io, socket, roomId);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      if (!socket.user) return;

      // Leave all rooms the socket was in
      const rooms = socketRooms.get(socket.id);
      if (rooms) {
        for (const roomId of rooms) {
          await handleLeaveRoom(io, socket, roomId);
        }
        socketRooms.delete(socket.id);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
}

async function handleLeaveRoom(io: Server, socket: Socket, roomId: string) {
  if (!socket.user) return;

  // Leave the socket room
  await socket.leave(roomId);

  // Update tracking
  const rooms = socketRooms.get(socket.id);
  if (rooms) {
    rooms.delete(roomId);
  }

  // Mark user offline in Redis
  await setUserOffline(socket.user.userId, roomId);

  // Notify others that user left
  io.to(roomId).emit(SocketEvents.USER_LEFT, {
    userId: socket.user.userId,
    roomId,
  });
}
