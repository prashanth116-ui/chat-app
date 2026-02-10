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

export interface RoomWithDetails extends Room {
  countryName?: string;
  countryFlag?: string;
  stateName?: string;
  onlineCount: number;
  memberCount: number;
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

// Socket event names
export const SocketEvents = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',

  // Server -> Client
  NEW_MESSAGE: 'new_message',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_TYPING: 'user_typing',
  ONLINE_USERS: 'online_users',
  ERROR: 'error',
} as const;
