import { query } from '../config/database.js';

interface RoomBanRow {
  room_id: string;
  user_id: string;
  banned_by: string | null;
  reason: string | null;
  expires_at: Date | null;
  created_at: Date;
}

export interface RoomBan {
  roomId: string;
  userId: string;
  bannedBy: string | null;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
}

function rowToRoomBan(row: RoomBanRow): RoomBan {
  return {
    roomId: row.room_id,
    userId: row.user_id,
    bannedBy: row.banned_by,
    reason: row.reason,
    expiresAt: row.expires_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createBan(data: {
  roomId: string;
  userId: string;
  bannedBy: string;
  reason?: string;
  expiresAt?: Date;
}): Promise<RoomBan> {
  const result = await query<RoomBanRow>(
    `INSERT INTO room_bans (room_id, user_id, banned_by, reason, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (room_id, user_id) DO UPDATE
     SET banned_by = $3, reason = $4, expires_at = $5, created_at = NOW()
     RETURNING *`,
    [data.roomId, data.userId, data.bannedBy, data.reason ?? null, data.expiresAt ?? null]
  );

  return rowToRoomBan(result.rows[0]);
}

export async function removeBan(roomId: string, userId: string): Promise<void> {
  await query(
    'DELETE FROM room_bans WHERE room_id = $1 AND user_id = $2',
    [roomId, userId]
  );
}

export async function isBanned(roomId: string, userId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM room_bans
      WHERE room_id = $1 AND user_id = $2
      AND (expires_at IS NULL OR expires_at > NOW())
    )`,
    [roomId, userId]
  );
  return result.rows[0].exists;
}

export async function getRoomBans(roomId: string): Promise<RoomBan[]> {
  const result = await query<RoomBanRow>(
    `SELECT * FROM room_bans
     WHERE room_id = $1
     AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC`,
    [roomId]
  );
  return result.rows.map(rowToRoomBan);
}

export async function getUserBans(userId: string): Promise<RoomBan[]> {
  const result = await query<RoomBanRow>(
    `SELECT * FROM room_bans
     WHERE user_id = $1
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId]
  );
  return result.rows.map(rowToRoomBan);
}
