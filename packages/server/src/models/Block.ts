import { query } from '../config/database.js';

interface BlockRow {
  blocker_id: string;
  blocked_id: string;
  created_at: Date;
}

export interface Block {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

function rowToBlock(row: BlockRow): Block {
  return {
    blockerId: row.blocker_id,
    blockedId: row.blocked_id,
    createdAt: row.created_at.toISOString(),
  };
}

export async function blockUser(blockerId: string, blockedId: string): Promise<Block> {
  const result = await query<BlockRow>(
    `INSERT INTO user_blocks (blocker_id, blocked_id)
     VALUES ($1, $2)
     ON CONFLICT (blocker_id, blocked_id) DO NOTHING
     RETURNING *`,
    [blockerId, blockedId]
  );

  if (result.rows.length === 0) {
    const existing = await query<BlockRow>(
      'SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );
    return rowToBlock(existing.rows[0]);
  }

  return rowToBlock(result.rows[0]);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await query(
    'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
    [blockerId, blockedId]
  );
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2)',
    [blockerId, blockedId]
  );
  return result.rows[0].exists;
}

export async function isBlockedEither(userId1: string, userId2: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM user_blocks
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1)
    )`,
    [userId1, userId2]
  );
  return result.rows[0].exists;
}

export async function getBlockedUsers(blockerId: string): Promise<string[]> {
  const result = await query<{ blocked_id: string }>(
    'SELECT blocked_id FROM user_blocks WHERE blocker_id = $1',
    [blockerId]
  );
  return result.rows.map((row) => row.blocked_id);
}

export async function getBlockedByUsers(userId: string): Promise<string[]> {
  const result = await query<{ blocker_id: string }>(
    'SELECT blocker_id FROM user_blocks WHERE blocked_id = $1',
    [userId]
  );
  return result.rows.map((row) => row.blocker_id);
}
