import type { User, UserPublic, UpdateProfileRequest } from '@chat-app/shared';
import * as UserModel from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export async function getUserById(id: string): Promise<User | null> {
  return UserModel.findUserById(id);
}

export async function getPublicUser(id: string): Promise<UserPublic | null> {
  return UserModel.getPublicUser(id);
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest
): Promise<User | null> {
  // Check if username is taken by another user
  if (data.username) {
    const existing = await UserModel.findUserByUsername(data.username);
    if (existing && existing.id !== userId) {
      throw new Error('Username already taken');
    }
  }

  return UserModel.updateUser(userId, data);
}

export async function updateLastSeen(userId: string): Promise<void> {
  return UserModel.updateLastSeen(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await UserModel.getUserWithPassword(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  const newHash = await hashPassword(newPassword);
  await UserModel.updatePassword(userId, newHash);
}

export async function searchUsers(query: string): Promise<UserPublic[]> {
  return UserModel.searchUsers(query);
}
