import type { UserPublic } from './user.js';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FriendWithUser extends Friendship {
  user: UserPublic;
}

export interface FriendshipStatusResponse {
  status: 'none' | 'friends' | 'pending_sent' | 'pending_received';
  friendshipId?: string;
}

export interface Block {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}
