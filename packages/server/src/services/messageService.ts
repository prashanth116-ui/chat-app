import type { Message, MessageWithUser, SendMessageRequest } from '@chat-app/shared';
import * as MessageModel from '../models/Message.js';
import { getPublicUser } from '../models/User.js';

export async function createMessage(
  data: SendMessageRequest,
  userId: string
): Promise<MessageWithUser> {
  const message = await MessageModel.createMessage({
    roomId: data.roomId,
    userId,
    content: data.content,
    messageType: data.messageType,
  });

  const user = await getPublicUser(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return { ...message, user };
}

export async function getMessages(
  roomId: string,
  options: { limit?: number; offset?: number; before?: string }
): Promise<MessageWithUser[]> {
  return MessageModel.getMessagesWithUsers(roomId, options);
}

export async function getMessageById(id: string): Promise<Message | null> {
  return MessageModel.getMessageById(id);
}
