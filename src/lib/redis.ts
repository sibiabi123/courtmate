import { Redis } from '@upstash/redis';

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('[Redis] UPSTASH env vars not set. Redis features will be disabled.');
}

export const redis: Redis = globalThis._redis ?? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._redis = redis;
}

// ─── Key helpers ──────────────────────────────────────────────────────────────
export const REDIS_KEYS = {
  leaderboard: (period: 'week' | 'month' | 'all') => `leaderboard:${period}`,
  hostelLeaderboard: (hostel: string) => `leaderboard:hostel:${hostel}`,
  groundOccupancy: (ground: string, hour: number) => `occupancy:${ground}:h${hour}`,
  userQuests: (userId: string) => `quests:${userId}`,
  onlineUsers: () => 'presence:online',
} as const;

// ─── Leaderboard helper ────────────────────────────────────────────────────────
export async function cacheEloLeaderboard(
  period: 'week' | 'month' | 'all',
  entries: Array<{ userId: string; name: string; rating: number; hostel: string; avatar: string }>
): Promise<void> {
  const key = REDIS_KEYS.leaderboard(period);
  const pipeline = redis.pipeline();
  pipeline.del(key);
  for (const entry of entries) {
    pipeline.zadd(key, { score: entry.rating, member: JSON.stringify(entry) });
  }
  pipeline.expire(key, 60 * 15); // 15 min TTL
  await pipeline.exec();
}

export async function getEloLeaderboard(
  period: 'week' | 'month' | 'all',
  limit = 50
): Promise<Array<{ userId: string; name: string; rating: number; hostel: string; avatar: string }> | null> {
  const key = REDIS_KEYS.leaderboard(period);
  const raw = await redis.zrange(key, 0, limit - 1, { rev: true });
  if (!raw || raw.length === 0) return null;
  return raw.map((r) => JSON.parse(r as string));
}

// ─── Ground occupancy helpers ─────────────────────────────────────────────────
export async function recordOccupancy(ground: string, hour: number, count: number): Promise<void> {
  const key = REDIS_KEYS.groundOccupancy(ground, hour);
  await redis.rpush(key, count);
  await redis.ltrim(key, -30, -1); // keep last 30 data points
  await redis.expire(key, 60 * 60 * 24 * 7); // 7 day TTL
}

export async function getAvgOccupancy(ground: string, hour: number): Promise<number> {
  const key = REDIS_KEYS.groundOccupancy(ground, hour);
  const values = await redis.lrange(key, 0, -1);
  if (!values || values.length === 0) return 0;
  const nums = values.map(Number).filter((n) => !isNaN(n));
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
