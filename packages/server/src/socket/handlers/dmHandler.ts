import type { Server, Socket } from 'socket.io';
import {
  SocketEvents,
  type SendDMPayload,
  type DMTypingPayload,
  type EditDMPayload,
  type DeleteDMPayload,
} from '@chat-app/shared';
import * as dmService from '../../services/dmService.js';
import * as ConversationModel from '../../models/Conversation.js';
import { getPublicUser } from '../../models/User.js';

export function registerDMHandlers(io: Server, socket: Socket) {
  // Send DM
  socket.on(SocketEvents.SEND_DM, async (data: SendDMPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { conversationId, content } = data;

      if (!content || content.trim().length === 0) {
        socket.emit(SocketEvents.ERROR, { message: 'Message cannot be empty' });
        return;
      }

      if (content.length > 2000) {
        socket.emit(SocketEvents.ERROR, { message: 'Message too long' });
        return;
      }

      const message = await dmService.sendDirectMessage(
        conversationId,
        socket.user.userId,
        content.trim()
      );

      // Get the conversation to find the other user
      const conversation = await ConversationModel.findConversationById(conversationId);
      if (!conversation) return;

      const otherUserId = conversation.user1Id === socket.user.userId
        ? conversation.user2Id
        : conversation.user1Id;

      // Emit to both users (conversation room)
      io.to(`dm:${conversationId}`).emit(SocketEvents.NEW_DM, {
        conversationId,
        message,
      });

      // Also emit to the other user's personal room if they're not in the conversation room
      io.to(`user:${otherUserId}`).emit(SocketEvents.NEW_DM, {
        conversationId,
        message,
      });
    } catch (error) {
      console.error('Error sending DM:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to send message' });
    }
  });

  // DM typing indicator
  socket.on(SocketEvents.DM_TYPING, async (data: DMTypingPayload) => {
    try {
      if (!socket.user) return;

      const { conversationId } = data;
      const user = await getPublicUser(socket.user.userId);
      if (!user) return;

      // Broadcast to conversation room
      socket.to(`dm:${conversationId}`).emit(SocketEvents.DM_USER_TYPING, {
        conversationId,
        userId: socket.user.userId,
        username: user.username,
      });
    } catch (error) {
      console.error('Error handling DM typing:', error);
    }
  });

  // Edit DM
  socket.on(SocketEvents.EDIT_DM, async (data: EditDMPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { conversationId, messageId, content } = data;

      if (!content || content.trim().length === 0) {
        socket.emit(SocketEvents.ERROR, { message: 'Message cannot be empty' });
        return;
      }

      const message = await dmService.editMessage(
        messageId,
        socket.user.userId,
        content.trim()
      );

      io.to(`dm:${conversationId}`).emit(SocketEvents.DM_EDITED, {
        conversationId,
        messageId,
        content: message.content,
        editedAt: message.editedAt,
      });
    } catch (error) {
      console.error('Error editing DM:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to edit message' });
    }
  });

  // Delete DM
  socket.on(SocketEvents.DELETE_DM, async (data: DeleteDMPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { conversationId, messageId } = data;

      await dmService.deleteMessage(messageId, socket.user.userId);

      io.to(`dm:${conversationId}`).emit(SocketEvents.DM_DELETED, {
        conversationId,
        messageId,
      });
    } catch (error) {
      console.error('Error deleting DM:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to delete message' });
    }
  });

  // Join conversation room when entering a DM view
  socket.on('join_conversation', async (data: { conversationId: string }) => {
    if (!socket.user) return;

    const isParticipant = await ConversationModel.isConversationParticipant(
      data.conversationId,
      socket.user.userId
    );

    if (isParticipant) {
      socket.join(`dm:${data.conversationId}`);
    }
  });

  // Leave conversation room
  socket.on('leave_conversation', (data: { conversationId: string }) => {
    socket.leave(`dm:${data.conversationId}`);
  });
}
