import { query } from '../config/database.js';

interface ReactionRow {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  message_type: string;
  created_at: Date;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  messageType: 'room' | 'dm';
  createdAt: string;
}

function rowToReaction(row: ReactionRow): Reaction {
  return {
    id: row.id,
    messageId: row.message_id,
    userId: row.user_id,
    emoji: row.emoji,
    messageType: row.message_type as 'room' | 'dm',
    createdAt: row.created_at.toISOString(),
  };
}

export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string,
  messageType: 'room' | 'dm'
): Promise<Reaction> {
  const result = await query<ReactionRow>(
    `INSERT INTO message_reactions (message_id, user_id, emoji, message_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (message_id, user_id, emoji) DO NOTHING
     RETURNING *`,
    [messageId, userId, emoji, messageType]
  );

  if (result.rows.length === 0) {
    const existing = await query<ReactionRow>(
      `SELECT * FROM message_reactions
       WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
      [messageId, userId, emoji]
    );
    return rowToReaction(existing.rows[0]);
  }

  return rowToReaction(result.rows[0]);
}

export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  await query(
    `DELETE FROM message_reactions
     WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
    [messageId, userId, emoji]
  );
}

export async function getReactionsByMessage(messageId: string): Promise<Reaction[]> {
  const result = await query<ReactionRow>(
    'SELECT * FROM message_reactions WHERE message_id = $1',
    [messageId]
  );
  return result.rows.map(rowToReaction);
}

export async function getReactionCounts(messageId: string): Promise<{ emoji: string; count: number }[]> {
  const result = await query<{ emoji: string; count: string }>(
    `SELECT emoji, COUNT(*) as count
     FROM message_reactions
     WHERE message_id = $1
     GROUP BY emoji`,
    [messageId]
  );
  return result.rows.map((r) => ({ emoji: r.emoji, count: parseInt(r.count) }));
}

export async function getUserReaction(
  messageId: string,
  userId: string
): Promise<string[]> {
  const result = await query<{ emoji: string }>(
    `SELECT emoji FROM message_reactions
     WHERE message_id = $1 AND user_id = $2`,
    [messageId, userId]
  );
  return result.rows.map((r) => r.emoji);
}
