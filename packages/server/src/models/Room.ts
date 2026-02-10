import { query } from '../config/database.js';
import type { Room, RoomWithDetails, RoomMember } from '@chat-app/shared';

interface RoomRow {
  id: string;
  name: string;
  description: string | null;
  country_id: number | null;
  state_id: number | null;
  created_by: string;
  is_private: boolean;
  max_users: number;
  created_at: Date;
  country_name?: string;
  country_flag?: string;
  state_name?: string;
  online_count?: string;
  member_count?: string;
}

interface RoomMemberRow {
  room_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
}

function rowToRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    countryId: row.country_id,
    stateId: row.state_id,
    createdBy: row.created_by,
    isPrivate: row.is_private,
    maxUsers: row.max_users,
    createdAt: row.created_at.toISOString(),
  };
}

function rowToRoomWithDetails(row: RoomRow): RoomWithDetails {
  return {
    ...rowToRoom(row),
    countryName: row.country_name,
    countryFlag: row.country_flag,
    stateName: row.state_name,
    onlineCount: parseInt(row.online_count || '0', 10),
    memberCount: parseInt(row.member_count || '0', 10),
  };
}

export async function createRoom(data: {
  name: string;
  description?: string;
  countryId?: number;
  stateId?: number;
  createdBy: string;
  isPrivate?: boolean;
  maxUsers?: number;
}): Promise<Room> {
  const result = await query<RoomRow>(
    `INSERT INTO rooms (name, description, country_id, state_id, created_by, is_private, max_users)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.description ?? null,
      data.countryId ?? null,
      data.stateId ?? null,
      data.createdBy,
      data.isPrivate ?? false,
      data.maxUsers ?? 100,
    ]
  );

  const room = rowToRoom(result.rows[0]);

  // Add creator as owner
  await addRoomMember(room.id, data.createdBy, 'owner');

  return room;
}

export async function findRoomById(id: string): Promise<Room | null> {
  const result = await query<RoomRow>(
    'SELECT * FROM rooms WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? rowToRoom(result.rows[0]) : null;
}

export async function getRoomsWithDetails(options: {
  countryId?: number;
  stateId?: number;
  limit?: number;
  offset?: number;
}): Promise<RoomWithDetails[]> {
  const conditions: string[] = ['r.is_private = false'];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options.countryId) {
    conditions.push(`r.country_id = $${paramIndex++}`);
    params.push(options.countryId);
  }

  if (options.stateId) {
    conditions.push(`r.state_id = $${paramIndex++}`);
    params.push(options.stateId);
  }

  params.push(options.limit ?? 50);
  params.push(options.offset ?? 0);

  const result = await query<RoomRow>(
    `SELECT r.*,
            c.name as country_name,
            c.flag_emoji as country_flag,
            s.name as state_name,
            (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count,
            0 as online_count
     FROM rooms r
     LEFT JOIN countries c ON r.country_id = c.id
     LEFT JOIN states s ON r.state_id = s.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY r.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  return result.rows.map(rowToRoomWithDetails);
}

export async function getRoomWithDetails(id: string): Promise<RoomWithDetails | null> {
  const result = await query<RoomRow>(
    `SELECT r.*,
            c.name as country_name,
            c.flag_emoji as country_flag,
            s.name as state_name,
            (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count,
            0 as online_count
     FROM rooms r
     LEFT JOIN countries c ON r.country_id = c.id
     LEFT JOIN states s ON r.state_id = s.id
     WHERE r.id = $1`,
    [id]
  );

  return result.rows.length > 0 ? rowToRoomWithDetails(result.rows[0]) : null;
}

export async function addRoomMember(
  roomId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<RoomMember> {
  const result = await query<RoomMemberRow>(
    `INSERT INTO room_members (room_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, user_id) DO UPDATE SET role = EXCLUDED.role
     RETURNING *`,
    [roomId, userId, role]
  );

  const row = result.rows[0];
  return {
    roomId: row.room_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at.toISOString(),
  };
}

export async function removeRoomMember(roomId: string, userId: string): Promise<void> {
  await query(
    'DELETE FROM room_members WHERE room_id = $1 AND user_id = $2',
    [roomId, userId]
  );
}

export async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2)',
    [roomId, userId]
  );
  return result.rows[0].exists;
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const result = await query<RoomMemberRow>(
    'SELECT * FROM room_members WHERE room_id = $1 ORDER BY joined_at',
    [roomId]
  );

  return result.rows.map((row) => ({
    roomId: row.room_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at.toISOString(),
  }));
}
