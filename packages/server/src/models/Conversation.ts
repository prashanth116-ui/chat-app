import { query } from '../config/database.js';

interface ConversationRow {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
}

function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    user1Id: row.user1_id,
    user2Id: row.user2_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
  // Order users consistently for lookup
  const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  // Try to find existing
  const existing = await query<ConversationRow>(
    `SELECT * FROM conversations
     WHERE user1_id = $1 AND user2_id = $2`,
    [user1, user2]
  );

  if (existing.rows.length > 0) {
    return rowToConversation(existing.rows[0]);
  }

  // Create new
  const result = await query<ConversationRow>(
    `INSERT INTO conversations (user1_id, user2_id)
     VALUES ($1, $2)
     RETURNING *`,
    [user1, user2]
  );

  return rowToConversation(result.rows[0]);
}

export async function findConversationById(id: string): Promise<Conversation | null> {
  const result = await query<ConversationRow>(
    'SELECT * FROM conversations WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToConversation(result.rows[0]);
}

export async function getConversationByUsers(userId1: string, userId2: string): Promise<Conversation | null> {
  const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const result = await query<ConversationRow>(
    `SELECT * FROM conversations
     WHERE user1_id = $1 AND user2_id = $2`,
    [user1, user2]
  );

  if (result.rows.length === 0) return null;
  return rowToConversation(result.rows[0]);
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const result = await query<ConversationRow>(
    `SELECT * FROM conversations
     WHERE user1_id = $1 OR user2_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );

  return result.rows.map(rowToConversation);
}

export async function updateConversationTimestamp(id: string): Promise<void> {
  await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);
}

export async function isConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM conversations
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    )`,
    [conversationId, userId]
  );
  return result.rows[0].exists;
}

export function getOtherUserId(conversation: Conversation, userId: string): string {
  return conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
}
