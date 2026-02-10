import { query } from '../config/database.js';
import type { UserPublic } from '@chat-app/shared';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
}

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

function rowToFriendship(row: FriendshipRow): Friendship {
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function createFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
  const result = await query<FriendshipRow>(
    `INSERT INTO friendships (requester_id, addressee_id)
     VALUES ($1, $2)
     RETURNING *`,
    [requesterId, addresseeId]
  );
  return rowToFriendship(result.rows[0]);
}

export async function findFriendship(userId1: string, userId2: string): Promise<Friendship | null> {
  const result = await query<FriendshipRow>(
    `SELECT * FROM friendships
     WHERE (requester_id = $1 AND addressee_id = $2)
        OR (requester_id = $2 AND addressee_id = $1)`,
    [userId1, userId2]
  );

  if (result.rows.length === 0) return null;
  return rowToFriendship(result.rows[0]);
}

export async function findFriendshipById(id: string): Promise<Friendship | null> {
  const result = await query<FriendshipRow>(
    'SELECT * FROM friendships WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToFriendship(result.rows[0]);
}

export async function updateFriendshipStatus(id: string, status: FriendshipStatus): Promise<Friendship | null> {
  const result = await query<FriendshipRow>(
    `UPDATE friendships SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  if (result.rows.length === 0) return null;
  return rowToFriendship(result.rows[0]);
}

export async function deleteFriendship(id: string): Promise<void> {
  await query('DELETE FROM friendships WHERE id = $1', [id]);
}

export async function getFriends(userId: string): Promise<string[]> {
  const result = await query<{ friend_id: string }>(
    `SELECT CASE
       WHEN requester_id = $1 THEN addressee_id
       ELSE requester_id
     END as friend_id
     FROM friendships
     WHERE (requester_id = $1 OR addressee_id = $1)
       AND status = 'accepted'`,
    [userId]
  );
  return result.rows.map((row) => row.friend_id);
}

export async function getPendingRequests(userId: string): Promise<Friendship[]> {
  const result = await query<FriendshipRow>(
    `SELECT * FROM friendships
     WHERE addressee_id = $1 AND status = 'pending'
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(rowToFriendship);
}

export async function getSentRequests(userId: string): Promise<Friendship[]> {
  const result = await query<FriendshipRow>(
    `SELECT * FROM friendships
     WHERE requester_id = $1 AND status = 'pending'
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(rowToFriendship);
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM friendships
      WHERE ((requester_id = $1 AND addressee_id = $2)
         OR (requester_id = $2 AND addressee_id = $1))
        AND status = 'accepted'
    )`,
    [userId1, userId2]
  );
  return result.rows[0].exists;
}
