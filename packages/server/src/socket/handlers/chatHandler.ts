import type { Server, Socket } from 'socket.io';
import {
  SocketEvents,
  type SendMessagePayload,
  type TypingPayload,
  type EditMessagePayload,
  type DeleteMessagePayload,
  type AddReactionPayload,
  type RemoveReactionPayload,
} from '@chat-app/shared';
import * as messageService from '../../services/messageService.js';
import { getPublicUser } from '../../models/User.js';
import * as MessageModel from '../../models/Message.js';
import * as ReactionModel from '../../models/Reaction.js';

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

  // Handle message editing
  socket.on(SocketEvents.EDIT_MESSAGE, async (data: EditMessagePayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { roomId, messageId, content } = data;

      if (!content || content.trim().length === 0) {
        socket.emit(SocketEvents.ERROR, { message: 'Message cannot be empty' });
        return;
      }

      const message = await MessageModel.getMessageById(messageId);
      if (!message) {
        socket.emit(SocketEvents.ERROR, { message: 'Message not found' });
        return;
      }

      if (message.userId !== socket.user.userId) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authorized to edit this message' });
        return;
      }

      const updated = await MessageModel.updateMessage(messageId, content.trim());
      if (!updated) {
        socket.emit(SocketEvents.ERROR, { message: 'Failed to update message' });
        return;
      }

      io.to(roomId).emit(SocketEvents.MESSAGE_EDITED, {
        roomId,
        messageId,
        content: updated.content,
        editedAt: updated.editedAt,
      });
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to edit message' });
    }
  });

  // Handle message deletion
  socket.on(SocketEvents.DELETE_MESSAGE, async (data: DeleteMessagePayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { roomId, messageId } = data;

      const message = await MessageModel.getMessageById(messageId);
      if (!message) {
        socket.emit(SocketEvents.ERROR, { message: 'Message not found' });
        return;
      }

      if (message.userId !== socket.user.userId) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authorized to delete this message' });
        return;
      }

      await MessageModel.softDeleteMessage(messageId);

      io.to(roomId).emit(SocketEvents.MESSAGE_DELETED, {
        roomId,
        messageId,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to delete message' });
    }
  });

  // Handle adding reactions
  socket.on(SocketEvents.ADD_REACTION, async (data: AddReactionPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { messageId, emoji, roomId, conversationId } = data;
      const messageType = roomId ? 'room' : 'dm';

      await ReactionModel.addReaction(messageId, socket.user.userId, emoji, messageType);

      const payload = {
        messageId,
        userId: socket.user.userId,
        emoji,
        roomId,
        conversationId,
      };

      if (roomId) {
        io.to(roomId).emit(SocketEvents.REACTION_ADDED, payload);
      } else if (conversationId) {
        io.to(`dm:${conversationId}`).emit(SocketEvents.REACTION_ADDED, payload);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to add reaction' });
    }
  });

  // Handle removing reactions
  socket.on(SocketEvents.REMOVE_REACTION, async (data: RemoveReactionPayload) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
        return;
      }

      const { messageId, emoji, roomId, conversationId } = data;

      await ReactionModel.removeReaction(messageId, socket.user.userId, emoji);

      const payload = {
        messageId,
        userId: socket.user.userId,
        emoji,
        roomId,
        conversationId,
      };

      if (roomId) {
        io.to(roomId).emit(SocketEvents.REACTION_REMOVED, payload);
      } else if (conversationId) {
        io.to(`dm:${conversationId}`).emit(SocketEvents.REACTION_REMOVED, payload);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to remove reaction' });
    }
  });
}
