import { query } from '../config/database.js';
import type { Gender, User, UserPublic } from '@chat-app/shared';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  gender: Gender;
  date_of_birth: Date;
  age_verified: boolean;
  country_id: number | null;
  state_id: number | null;
  avatar_url: string | null;
  created_at: Date;
  last_seen: Date;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    gender: row.gender,
    dateOfBirth: row.date_of_birth.toISOString().split('T')[0],
    ageVerified: row.age_verified,
    countryId: row.country_id,
    stateId: row.state_id,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at.toISOString(),
    lastSeen: row.last_seen.toISOString(),
  };
}

function rowToPublicUser(row: UserRow): UserPublic {
  return {
    id: row.id,
    username: row.username,
    gender: row.gender,
    avatarUrl: row.avatar_url,
    countryId: row.country_id,
    stateId: row.state_id,
    lastSeen: row.last_seen.toISOString(),
  };
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  username: string;
  gender: Gender;
  dateOfBirth: string;
  countryId?: number;
  stateId?: number;
}): Promise<User> {
  const result = await query<UserRow>(
    `INSERT INTO users (email, password_hash, username, gender, date_of_birth, country_id, state_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.email, data.passwordHash, data.username, data.gender, data.dateOfBirth, data.countryId ?? null, data.stateId ?? null]
  );

  return rowToUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...rowToUser(row),
    passwordHash: row.password_hash,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

export async function getPublicUser(id: string): Promise<UserPublic | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToPublicUser(result.rows[0]);
}

export async function getPublicUsersByIds(ids: string[]): Promise<UserPublic[]> {
  if (ids.length === 0) return [];

  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = ANY($1)',
    [ids]
  );

  return result.rows.map(rowToPublicUser);
}

export async function updateUser(
  id: string,
  data: Partial<{ username: string; avatarUrl: string; countryId: number; stateId: number }>
): Promise<User | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.username !== undefined) {
    updates.push(`username = $${paramIndex++}`);
    values.push(data.username);
  }
  if (data.avatarUrl !== undefined) {
    updates.push(`avatar_url = $${paramIndex++}`);
    values.push(data.avatarUrl);
  }
  if (data.countryId !== undefined) {
    updates.push(`country_id = $${paramIndex++}`);
    values.push(data.countryId);
  }
  if (data.stateId !== undefined) {
    updates.push(`state_id = $${paramIndex++}`);
    values.push(data.stateId);
  }

  if (updates.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  const result = await query<UserRow>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

export async function updateLastSeen(id: string): Promise<void> {
  await query('UPDATE users SET last_seen = NOW() WHERE id = $1', [id]);
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
    [email]
  );
  return result.rows[0].exists;
}

export async function usernameExists(username: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
    [username]
  );
  return result.rows[0].exists;
}

export async function getUserWithPassword(id: string): Promise<(User & { passwordHash: string }) | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...rowToUser(row),
    passwordHash: row.password_hash,
  };
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

export async function searchUsers(searchQuery: string, limit: number = 20): Promise<UserPublic[]> {
  const result = await query<UserRow>(
    `SELECT * FROM users
     WHERE username ILIKE $1
     ORDER BY username
     LIMIT $2`,
    [`%${searchQuery}%`, limit]
  );

  return result.rows.map(rowToPublicUser);
}
