import { query } from '../config/database.js';
import type { Message, MessageWithUser } from '@chat-app/shared';
import { getPublicUsersByIds } from './User.js';

interface MessageRow {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: Date;
  edited_at: Date | null;
  deleted_at: Date | null;
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    content: row.content,
    messageType: row.message_type,
    createdAt: row.created_at.toISOString(),
    editedAt: row.edited_at?.toISOString() ?? null,
    deletedAt: row.deleted_at?.toISOString() ?? null,
  };
}

export async function createMessage(data: {
  roomId: string;
  userId: string;
  content: string;
  messageType?: 'text' | 'image' | 'system';
}): Promise<Message> {
  const result = await query<MessageRow>(
    `INSERT INTO messages (room_id, user_id, content, message_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.roomId, data.userId, data.content, data.messageType ?? 'text']
  );

  return rowToMessage(result.rows[0]);
}

export async function getMessagesByRoom(
  roomId: string,
  options: { limit?: number; offset?: number; before?: string }
): Promise<Message[]> {
  const params: unknown[] = [roomId];
  let whereClause = 'room_id = $1';
  let paramIndex = 2;

  if (options.before) {
    whereClause += ` AND created_at < $${paramIndex++}`;
    params.push(options.before);
  }

  params.push(options.limit ?? 50);
  params.push(options.offset ?? 0);

  const result = await query<MessageRow>(
    `SELECT * FROM messages
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  // Return in chronological order
  return result.rows.map(rowToMessage).reverse();
}

export async function getMessagesWithUsers(
  roomId: string,
  options: { limit?: number; offset?: number; before?: string }
): Promise<MessageWithUser[]> {
  const messages = await getMessagesByRoom(roomId, options);

  if (messages.length === 0) {
    return [];
  }

  const userIds = [...new Set(messages.map((m) => m.userId))];
  const users = await getPublicUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return messages.map((message) => ({
    ...message,
    user: userMap.get(message.userId)!,
  }));
}

export async function getMessageById(id: string): Promise<Message | null> {
  const result = await query<MessageRow>(
    'SELECT * FROM messages WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? rowToMessage(result.rows[0]) : null;
}

export async function deleteMessage(id: string): Promise<void> {
  await query('DELETE FROM messages WHERE id = $1', [id]);
}

export async function updateMessage(id: string, content: string): Promise<Message | null> {
  const result = await query<MessageRow>(
    `UPDATE messages
     SET content = $1, edited_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [content, id]
  );

  if (result.rows.length === 0) return null;
  return rowToMessage(result.rows[0]);
}

export async function softDeleteMessage(id: string): Promise<void> {
  await query(
    `UPDATE messages
     SET deleted_at = NOW(), content = '[Message deleted]'
     WHERE id = $1`,
    [id]
  );
}
