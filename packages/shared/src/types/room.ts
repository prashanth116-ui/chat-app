import type { UserPublic } from './user.js';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  countryId: number | null;
  stateId: number | null;
  createdBy: string;
  isPrivate: boolean;
  maxUsers: number;
  createdAt: string;
}

export interface GenderCounts {
  male: number;
  female: number;
  other: number;
}

export interface RoomWithDetails extends Room {
  countryName?: string;
  countryFlag?: string;
  stateName?: string;
  onlineCount: number;
  memberCount: number;
  genderCounts?: GenderCounts;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  countryId?: number;
  stateId?: number;
  isPrivate?: boolean;
  maxUsers?: number;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  attachmentId?: string | null;
  attachment?: Attachment | null;
}

export interface Attachment {
  id: string;
  uploaderId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  url: string;
  createdAt: string;
}

export interface MessageWithUser extends Message {
  user: UserPublic;
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  messageType?: 'text' | 'image';
}

// Socket events
export interface JoinRoomPayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
}

export interface TypingPayload {
  roomId: string;
}

export interface NewMessageEvent {
  message: MessageWithUser;
}

export interface UserJoinedEvent {
  user: UserPublic;
  roomId: string;
}

export interface UserLeftEvent {
  userId: string;
  roomId: string;
}

export interface UserTypingEvent {
  userId: string;
  username: string;
  roomId: string;
}

export interface OnlineUsersEvent {
  roomId: string;
  users: UserPublic[];
}

// Message edit/delete
export interface EditMessagePayload {
  roomId: string;
  messageId: string;
  content: string;
}

export interface DeleteMessagePayload {
  roomId: string;
  messageId: string;
}

export interface MessageEditedEvent {
  roomId: string;
  messageId: string;
  content: string;
  editedAt: string;
}

export interface MessageDeletedEvent {
  roomId: string;
  messageId: string;
}

// Reactions
export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  messageType: 'room' | 'dm';
  createdAt: string;
}

export interface AddReactionPayload {
  messageId: string;
  emoji: string;
  roomId?: string;
  conversationId?: string;
}

export interface RemoveReactionPayload {
  messageId: string;
  emoji: string;
  roomId?: string;
  conversationId?: string;
}

export interface ReactionAddedEvent {
  messageId: string;
  userId: string;
  emoji: string;
  roomId?: string;
  conversationId?: string;
}

export interface ReactionRemovedEvent {
  messageId: string;
  userId: string;
  emoji: string;
  roomId?: string;
  conversationId?: string;
}

// Socket event names
export const SocketEvents = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',
  ADD_REACTION: 'add_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // Server -> Client
  NEW_MESSAGE: 'new_message',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_TYPING: 'user_typing',
  ONLINE_USERS: 'online_users',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  REACTION_ADDED: 'reaction_added',
  REACTION_REMOVED: 'reaction_removed',
  ERROR: 'error',

  // DM events
  SEND_DM: 'send_dm',
  NEW_DM: 'new_dm',
  DM_TYPING: 'dm_typing',
  DM_USER_TYPING: 'dm_user_typing',
  EDIT_DM: 'edit_dm',
  DELETE_DM: 'delete_dm',
  DM_EDITED: 'dm_edited',
  DM_DELETED: 'dm_deleted',
  MARK_READ: 'mark_read',
  DM_READ: 'dm_read',
} as const;
