import { query } from '../config/database.js';

interface DirectMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  message_type: string;
  created_at: Date;
  edited_at: Date | null;
  deleted_at: Date | null;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string;
  messageType: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

function rowToDirectMessage(row: DirectMessageRow): DirectMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    messageType: row.message_type,
    createdAt: row.created_at.toISOString(),
    editedAt: row.edited_at?.toISOString() ?? null,
    deletedAt: row.deleted_at?.toISOString() ?? null,
  };
}

export async function createDirectMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  messageType?: string;
}): Promise<DirectMessage> {
  const result = await query<DirectMessageRow>(
    `INSERT INTO direct_messages (conversation_id, sender_id, content, message_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.conversationId, data.senderId, data.content, data.messageType || 'text']
  );

  return rowToDirectMessage(result.rows[0]);
}

export async function getDirectMessages(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<DirectMessage[]> {
  let sql = `
    SELECT * FROM direct_messages
    WHERE conversation_id = $1 AND deleted_at IS NULL
  `;
  const params: unknown[] = [conversationId];

  if (before) {
    sql += ' AND created_at < $2';
    params.push(before);
  }

  sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const result = await query<DirectMessageRow>(sql, params);
  return result.rows.map(rowToDirectMessage).reverse();
}

export async function getDirectMessageById(id: string): Promise<DirectMessage | null> {
  const result = await query<DirectMessageRow>(
    'SELECT * FROM direct_messages WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToDirectMessage(result.rows[0]);
}

export async function updateDirectMessage(id: string, content: string): Promise<DirectMessage | null> {
  const result = await query<DirectMessageRow>(
    `UPDATE direct_messages
     SET content = $1, edited_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [content, id]
  );

  if (result.rows.length === 0) return null;
  return rowToDirectMessage(result.rows[0]);
}

export async function softDeleteDirectMessage(id: string): Promise<void> {
  await query(
    `UPDATE direct_messages
     SET deleted_at = NOW(), content = '[Message deleted]'
     WHERE id = $1`,
    [id]
  );
}

export async function getLatestMessage(conversationId: string): Promise<DirectMessage | null> {
  const result = await query<DirectMessageRow>(
    `SELECT * FROM direct_messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [conversationId]
  );

  if (result.rows.length === 0) return null;
  return rowToDirectMessage(result.rows[0]);
}
