import type { UserPublic } from './user.js';

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string;
  messageType: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface DirectMessageWithUser extends DirectMessage {
  sender: UserPublic | null;
}

export interface ConversationWithUser extends Conversation {
  otherUser: UserPublic;
  lastMessage: DirectMessage | null;
  unreadCount?: number;
}

// Socket payloads
export interface SendDMPayload {
  conversationId: string;
  content: string;
}

export interface DMTypingPayload {
  conversationId: string;
}

export interface EditDMPayload {
  conversationId: string;
  messageId: string;
  content: string;
}

export interface DeleteDMPayload {
  conversationId: string;
  messageId: string;
}

export interface MarkReadPayload {
  conversationId: string;
  messageId: string;
}

// Socket events
export interface NewDMEvent {
  conversationId: string;
  message: DirectMessageWithUser;
}

export interface DMUserTypingEvent {
  conversationId: string;
  userId: string;
  username: string;
}

export interface DMEditedEvent {
  conversationId: string;
  messageId: string;
  content: string;
  editedAt: string;
}

export interface DMDeletedEvent {
  conversationId: string;
  messageId: string;
}

export interface DMReadEvent {
  conversationId: string;
  userId: string;
  messageId: string;
  readAt: string;
}
