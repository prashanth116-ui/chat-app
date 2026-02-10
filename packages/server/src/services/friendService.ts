import type { UserPublic } from '@chat-app/shared';
import * as FriendshipModel from '../models/Friendship.js';
import * as BlockModel from '../models/Block.js';
import * as UserModel from '../models/User.js';
import type { Friendship, FriendWithUser } from '../models/Friendship.js';

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
  if (requesterId === addresseeId) {
    throw new Error('Cannot send friend request to yourself');
  }

  const user = await UserModel.findUserById(addresseeId);
  if (!user) {
    throw new Error('User not found');
  }

  const isBlocked = await BlockModel.isBlockedEither(requesterId, addresseeId);
  if (isBlocked) {
    throw new Error('Cannot send friend request');
  }

  const existing = await FriendshipModel.findFriendship(requesterId, addresseeId);
  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends');
    }
    if (existing.status === 'pending') {
      if (existing.requesterId === requesterId) {
        throw new Error('Friend request already sent');
      }
      return acceptFriendRequest(existing.id, requesterId);
    }
  }

  return FriendshipModel.createFriendRequest(requesterId, addresseeId);
}

export async function acceptFriendRequest(friendshipId: string, userId: string): Promise<Friendship> {
  const friendship = await FriendshipModel.findFriendshipById(friendshipId);
  if (!friendship) {
    throw new Error('Friend request not found');
  }

  if (friendship.addresseeId !== userId) {
    throw new Error('Not authorized to accept this request');
  }

  if (friendship.status !== 'pending') {
    throw new Error('Friend request is no longer pending');
  }

  const updated = await FriendshipModel.updateFriendshipStatus(friendshipId, 'accepted');
  if (!updated) {
    throw new Error('Failed to accept friend request');
  }

  return updated;
}

export async function declineFriendRequest(friendshipId: string, userId: string): Promise<void> {
  const friendship = await FriendshipModel.findFriendshipById(friendshipId);
  if (!friendship) {
    throw new Error('Friend request not found');
  }

  if (friendship.addresseeId !== userId) {
    throw new Error('Not authorized to decline this request');
  }

  await FriendshipModel.deleteFriendship(friendshipId);
}

export async function removeFriend(friendshipId: string, userId: string): Promise<void> {
  const friendship = await FriendshipModel.findFriendshipById(friendshipId);
  if (!friendship) {
    throw new Error('Friendship not found');
  }

  if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
    throw new Error('Not authorized to remove this friend');
  }

  await FriendshipModel.deleteFriendship(friendshipId);
}

export async function cancelFriendRequest(friendshipId: string, userId: string): Promise<void> {
  const friendship = await FriendshipModel.findFriendshipById(friendshipId);
  if (!friendship) {
    throw new Error('Friend request not found');
  }

  if (friendship.requesterId !== userId) {
    throw new Error('Not authorized to cancel this request');
  }

  await FriendshipModel.deleteFriendship(friendshipId);
}

export async function getFriends(userId: string): Promise<UserPublic[]> {
  const friendIds = await FriendshipModel.getFriends(userId);
  if (friendIds.length === 0) return [];
  return UserModel.getPublicUsersByIds(friendIds);
}

export async function getPendingRequests(userId: string): Promise<FriendWithUser[]> {
  const requests = await FriendshipModel.getPendingRequests(userId);
  if (requests.length === 0) return [];

  const userIds = requests.map((r) => r.requesterId);
  const users = await UserModel.getPublicUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return requests.map((r) => ({
    ...r,
    user: userMap.get(r.requesterId)!,
  }));
}

export async function getSentRequests(userId: string): Promise<FriendWithUser[]> {
  const requests = await FriendshipModel.getSentRequests(userId);
  if (requests.length === 0) return [];

  const userIds = requests.map((r) => r.addresseeId);
  const users = await UserModel.getPublicUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return requests.map((r) => ({
    ...r,
    user: userMap.get(r.addresseeId)!,
  }));
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  return FriendshipModel.areFriends(userId1, userId2);
}

export async function getFriendshipStatus(
  userId: string,
  otherUserId: string
): Promise<{ status: 'none' | 'friends' | 'pending_sent' | 'pending_received'; friendshipId?: string }> {
  const friendship = await FriendshipModel.findFriendship(userId, otherUserId);

  if (!friendship) {
    return { status: 'none' };
  }

  if (friendship.status === 'accepted') {
    return { status: 'friends', friendshipId: friendship.id };
  }

  if (friendship.status === 'pending') {
    if (friendship.requesterId === userId) {
      return { status: 'pending_sent', friendshipId: friendship.id };
    }
    return { status: 'pending_received', friendshipId: friendship.id };
  }

  return { status: 'none' };
}
