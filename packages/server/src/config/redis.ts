import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Presence tracking helpers
const PRESENCE_TTL = 120; // 2 minutes

export async function setUserOnline(userId: string, roomId: string): Promise<void> {
  const key = `room:${roomId}:online`;
  await redis.zadd(key, Date.now(), userId);
  await redis.expire(key, PRESENCE_TTL);
}

export async function setUserOffline(userId: string, roomId: string): Promise<void> {
  const key = `room:${roomId}:online`;
  await redis.zrem(key, userId);
}

export async function getOnlineUsers(roomId: string): Promise<string[]> {
  const key = `room:${roomId}:online`;
  const cutoff = Date.now() - PRESENCE_TTL * 1000;
  // Remove stale entries
  await redis.zremrangebyscore(key, 0, cutoff);
  // Get remaining users
  return redis.zrange(key, 0, -1);
}

export async function heartbeat(userId: string, roomId: string): Promise<void> {
  const key = `room:${roomId}:online`;
  await redis.zadd(key, Date.now(), userId);
}

// Session storage
export async function storeSession(userId: string, sessionData: object): Promise<void> {
  await redis.set(`session:${userId}`, JSON.stringify(sessionData), 'EX', 86400 * 7);
}

export async function getSession(userId: string): Promise<object | null> {
  const data = await redis.get(`session:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(userId: string): Promise<void> {
  await redis.del(`session:${userId}`);
}
