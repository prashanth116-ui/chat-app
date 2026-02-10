import { query } from '../config/database.js';
import { randomBytes } from 'crypto';

interface RoomInviteRow {
  id: string;
  room_id: string;
  code: string;
  created_by: string | null;
  max_uses: number | null;
  use_count: number;
  expires_at: Date | null;
  created_at: Date;
}

export interface RoomInvite {
  id: string;
  roomId: string;
  code: string;
  createdBy: string | null;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  createdAt: string;
}

function rowToRoomInvite(row: RoomInviteRow): RoomInvite {
  return {
    id: row.id,
    roomId: row.room_id,
    code: row.code,
    createdBy: row.created_by,
    maxUses: row.max_uses,
    useCount: row.use_count,
    expiresAt: row.expires_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

function generateInviteCode(): string {
  return randomBytes(6).toString('base64url').slice(0, 8);
}

export async function createInvite(data: {
  roomId: string;
  createdBy: string;
  maxUses?: number;
  expiresAt?: Date;
}): Promise<RoomInvite> {
  const code = generateInviteCode();

  const result = await query<RoomInviteRow>(
    `INSERT INTO room_invites (room_id, code, created_by, max_uses, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.roomId, code, data.createdBy, data.maxUses ?? null, data.expiresAt ?? null]
  );

  return rowToRoomInvite(result.rows[0]);
}

export async function findInviteByCode(code: string): Promise<RoomInvite | null> {
  const result = await query<RoomInviteRow>(
    `SELECT * FROM room_invites
     WHERE code = $1
     AND (expires_at IS NULL OR expires_at > NOW())
     AND (max_uses IS NULL OR use_count < max_uses)`,
    [code]
  );

  if (result.rows.length === 0) return null;
  return rowToRoomInvite(result.rows[0]);
}

export async function findInviteById(id: string): Promise<RoomInvite | null> {
  const result = await query<RoomInviteRow>(
    'SELECT * FROM room_invites WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToRoomInvite(result.rows[0]);
}

export async function incrementUseCount(code: string): Promise<void> {
  await query(
    'UPDATE room_invites SET use_count = use_count + 1 WHERE code = $1',
    [code]
  );
}

export async function getRoomInvites(roomId: string): Promise<RoomInvite[]> {
  const result = await query<RoomInviteRow>(
    `SELECT * FROM room_invites
     WHERE room_id = $1
     ORDER BY created_at DESC`,
    [roomId]
  );
  return result.rows.map(rowToRoomInvite);
}

export async function deleteInvite(id: string): Promise<void> {
  await query('DELETE FROM room_invites WHERE id = $1', [id]);
}
