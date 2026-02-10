import type { Server, Socket } from 'socket.io';
import { SocketEvents, type SendMessagePayload, type TypingPayload } from '@chat-app/shared';
import * as messageService from '../../services/messageService.js';
import { getPublicUser } from '../../models/User.js';

export function registerChatHandlers(io: Server, socket: Socket) {
  // Handle sending messages
  socket.on(SocketEvents.SEND_MESSAGE, async (data: SendMessagePayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { roomId, content } = data;

      if (!content || content.trim().length === 0) {
        socket.emit(SocketEvents.ERROR, { message: 'Message cannot be empty' });
        return;
      }

      if (content.length > 2000) {
        socket.emit(SocketEvents.ERROR, { message: 'Message too long' });
        return;
      }

      // Create message in database
      const message = await messageService.createMessage(
        { roomId, content: content.trim() },
        socket.user.userId
      );

      // Broadcast to room (including sender)
      io.to(roomId).emit(SocketEvents.NEW_MESSAGE, { message });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on(SocketEvents.TYPING, async (data: TypingPayload) => {
    try {
      if (!socket.user) return;

      const { roomId } = data;
      const user = await getPublicUser(socket.user.userId);

      if (!user) return;

      // Broadcast typing to others in room (excluding sender)
      socket.to(roomId).emit(SocketEvents.USER_TYPING, {
        userId: socket.user.userId,
        username: user.username,
        roomId,
      });
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });
}
