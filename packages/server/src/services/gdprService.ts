import { query } from '../config/database.js';
import * as UserModel from '../models/User.js';
import { verifyPassword } from '../utils/password.js';

const DELETION_GRACE_PERIOD_DAYS = 30;

export interface UserExport {
  user: {
    id: string;
    email: string;
    username: string;
    gender: string;
    dateOfBirth: string;
    createdAt: string;
  };
  messages: {
    roomId: string;
    content: string;
    createdAt: string;
  }[];
  directMessages: {
    conversationId: string;
    content: string;
    createdAt: string;
  }[];
  roomMemberships: {
    roomId: string;
    roomName: string;
    role: string;
    joinedAt: string;
  }[];
}

export async function exportUserData(userId: string): Promise<UserExport> {
  const user = await UserModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get messages
  const messagesResult = await query<{ room_id: string; content: string; created_at: Date }>(
    `SELECT room_id, content, created_at FROM messages
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );

  // Get direct messages
  const dmsResult = await query<{ conversation_id: string; content: string; created_at: Date }>(
    `SELECT conversation_id, content, created_at FROM direct_messages
     WHERE sender_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );

  // Get room memberships
  const membershipsResult = await query<{
    room_id: string;
    room_name: string;
    role: string;
    joined_at: Date;
  }>(
    `SELECT rm.room_id, r.name as room_name, rm.role, rm.joined_at
     FROM room_members rm
     JOIN rooms r ON r.id = rm.room_id
     WHERE rm.user_id = $1`,
    [userId]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    },
    messages: messagesResult.rows.map((m) => ({
      roomId: m.room_id,
      content: m.content,
      createdAt: m.created_at.toISOString(),
    })),
    directMessages: dmsResult.rows.map((m) => ({
      conversationId: m.conversation_id,
      content: m.content,
      createdAt: m.created_at.toISOString(),
    })),
    roomMemberships: membershipsResult.rows.map((m) => ({
      roomId: m.room_id,
      roomName: m.room_name,
      role: m.role,
      joinedAt: m.joined_at.toISOString(),
    })),
  };
}

export async function requestAccountDeletion(
  userId: string,
  password: string,
  confirmation: string
): Promise<{ scheduledAt: string }> {
  if (confirmation !== 'DELETE MY ACCOUNT') {
    throw new Error('Invalid confirmation text');
  }

  const user = await UserModel.getUserWithPassword(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Password is incorrect');
  }

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + DELETION_GRACE_PERIOD_DAYS);

  await query(
    `UPDATE users
     SET deletion_requested_at = NOW(), deletion_scheduled_at = $1
     WHERE id = $2`,
    [scheduledAt, userId]
  );

  return { scheduledAt: scheduledAt.toISOString() };
}

export async function cancelAccountDeletion(userId: string): Promise<void> {
  await query(
    `UPDATE users
     SET deletion_requested_at = NULL, deletion_scheduled_at = NULL
     WHERE id = $1`,
    [userId]
  );
}

export async function getDeletionStatus(
  userId: string
): Promise<{ isScheduled: boolean; scheduledAt: string | null }> {
  const result = await query<{ deletion_scheduled_at: Date | null }>(
    'SELECT deletion_scheduled_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const scheduledAt = result.rows[0].deletion_scheduled_at;
  return {
    isScheduled: !!scheduledAt,
    scheduledAt: scheduledAt?.toISOString() ?? null,
  };
}

export async function processScheduledDeletions(): Promise<number> {
  // Get users scheduled for deletion
  const usersToDelete = await query<{ id: string }>(
    `SELECT id FROM users
     WHERE deletion_scheduled_at IS NOT NULL
     AND deletion_scheduled_at <= NOW()`,
    []
  );

  for (const user of usersToDelete.rows) {
    await deleteUserData(user.id);
  }

  return usersToDelete.rows.length;
}

async function deleteUserData(userId: string): Promise<void> {
  // Anonymize messages (keep for room context but remove user reference)
  await query(
    `UPDATE messages
     SET content = '[Deleted]', user_id = NULL
     WHERE user_id = $1`,
    [userId]
  );

  // Delete direct messages
  await query('DELETE FROM direct_messages WHERE sender_id = $1', [userId]);

  // Delete conversations where user is a participant
  await query(
    'DELETE FROM conversations WHERE user1_id = $1 OR user2_id = $1',
    [userId]
  );

  // Delete room memberships
  await query('DELETE FROM room_members WHERE user_id = $1', [userId]);

  // Delete friendships
  await query(
    'DELETE FROM friendships WHERE requester_id = $1 OR addressee_id = $1',
    [userId]
  );

  // Delete blocks
  await query(
    'DELETE FROM user_blocks WHERE blocker_id = $1 OR blocked_id = $1',
    [userId]
  );

  // Delete reactions
  await query('DELETE FROM message_reactions WHERE user_id = $1', [userId]);

  // Finally delete the user
  await query('DELETE FROM users WHERE id = $1', [userId]);
}
