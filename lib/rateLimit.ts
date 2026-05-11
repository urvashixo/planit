import { getRedis } from "./redis";

function getNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function enforceRateLimit(identifier: string): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const max = getNumberEnv("RATE_LIMIT_MAX_REQUESTS", 30);
  const windowSeconds = getNumberEnv("RATE_LIMIT_WINDOW_SECONDS", 60);
  const redis = getRedis();
  const key = `ratelimit:${identifier}`;

  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);

  const remaining = Math.max(0, max - count);
  return {
    ok: count <= max,
    remaining,
    retryAfter: windowSeconds
  };
}
