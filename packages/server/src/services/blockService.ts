import type { UserPublic } from '@chat-app/shared';
import * as BlockModel from '../models/Block.js';
import * as UserModel from '../models/User.js';

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) {
    throw new Error('Cannot block yourself');
  }

  const user = await UserModel.findUserById(blockedId);
  if (!user) {
    throw new Error('User not found');
  }

  await BlockModel.blockUser(blockerId, blockedId);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await BlockModel.unblockUser(blockerId, blockedId);
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  return BlockModel.isBlocked(blockerId, blockedId);
}

export async function isBlockedEither(userId1: string, userId2: string): Promise<boolean> {
  return BlockModel.isBlockedEither(userId1, userId2);
}

export async function getBlockedUsers(userId: string): Promise<UserPublic[]> {
  const blockedIds = await BlockModel.getBlockedUsers(userId);
  if (blockedIds.length === 0) return [];
  return UserModel.getPublicUsersByIds(blockedIds);
}
