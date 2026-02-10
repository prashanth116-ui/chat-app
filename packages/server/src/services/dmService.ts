import type { UserPublic } from '@chat-app/shared';
import * as ConversationModel from '../models/Conversation.js';
import * as DirectMessageModel from '../models/DirectMessage.js';
import * as UserModel from '../models/User.js';
import * as BlockModel from '../models/Block.js';
import type { Conversation } from '../models/Conversation.js';
import type { DirectMessage } from '../models/DirectMessage.js';

export interface ConversationWithUser extends Conversation {
  otherUser: UserPublic;
  lastMessage: DirectMessage | null;
  unreadCount?: number;
}

export interface DirectMessageWithUser extends DirectMessage {
  sender: UserPublic | null;
}

export async function getOrCreateConversation(userId: string, otherUserId: string): Promise<Conversation> {
  const isBlocked = await BlockModel.isBlockedEither(userId, otherUserId);
  if (isBlocked) {
    throw new Error('Cannot start conversation');
  }

  const otherUser = await UserModel.findUserById(otherUserId);
  if (!otherUser) {
    throw new Error('User not found');
  }

  return ConversationModel.findOrCreateConversation(userId, otherUserId);
}

export async function getConversations(userId: string): Promise<ConversationWithUser[]> {
  const conversations = await ConversationModel.getUserConversations(userId);

  const results: ConversationWithUser[] = [];

  for (const conv of conversations) {
    const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    const otherUser = await UserModel.getPublicUser(otherUserId);

    if (!otherUser) continue;

    const lastMessage = await DirectMessageModel.getLatestMessage(conv.id);

    results.push({
      ...conv,
      otherUser,
      lastMessage,
    });
  }

  return results;
}

export async function getConversation(conversationId: string, userId: string): Promise<ConversationWithUser | null> {
  const isParticipant = await ConversationModel.isConversationParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new Error('Not authorized');
  }

  const conversation = await ConversationModel.findConversationById(conversationId);
  if (!conversation) return null;

  const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
  const otherUser = await UserModel.getPublicUser(otherUserId);
  if (!otherUser) return null;

  const lastMessage = await DirectMessageModel.getLatestMessage(conversationId);

  return {
    ...conversation,
    otherUser,
    lastMessage,
  };
}

export async function sendDirectMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<DirectMessageWithUser> {
  const isParticipant = await ConversationModel.isConversationParticipant(conversationId, senderId);
  if (!isParticipant) {
    throw new Error('Not authorized');
  }

  const conversation = await ConversationModel.findConversationById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
  const isBlocked = await BlockModel.isBlockedEither(senderId, otherUserId);
  if (isBlocked) {
    throw new Error('Cannot send message');
  }

  const message = await DirectMessageModel.createDirectMessage({
    conversationId,
    senderId,
    content,
  });

  await ConversationModel.updateConversationTimestamp(conversationId);

  const sender = await UserModel.getPublicUser(senderId);

  return {
    ...message,
    sender,
  };
}

export async function getMessages(
  conversationId: string,
  userId: string,
  limit?: number,
  before?: string
): Promise<DirectMessageWithUser[]> {
  const isParticipant = await ConversationModel.isConversationParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new Error('Not authorized');
  }

  const messages = await DirectMessageModel.getDirectMessages(conversationId, limit, before);
  const senderIds = [...new Set(messages.map((m) => m.senderId).filter(Boolean))] as string[];
  const senders = await UserModel.getPublicUsersByIds(senderIds);
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  return messages.map((msg) => ({
    ...msg,
    sender: msg.senderId ? senderMap.get(msg.senderId) || null : null,
  }));
}

export async function editMessage(
  messageId: string,
  userId: string,
  content: string
): Promise<DirectMessage> {
  const message = await DirectMessageModel.getDirectMessageById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.senderId !== userId) {
    throw new Error('Not authorized to edit this message');
  }

  const updated = await DirectMessageModel.updateDirectMessage(messageId, content);
  if (!updated) {
    throw new Error('Failed to update message');
  }

  return updated;
}

export async function deleteMessage(messageId: string, userId: string): Promise<void> {
  const message = await DirectMessageModel.getDirectMessageById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.senderId !== userId) {
    throw new Error('Not authorized to delete this message');
  }

  await DirectMessageModel.softDeleteDirectMessage(messageId);
}
