import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Tier = "auth" | "public" | "authed" | "webhook" | "admin";

export const rateLimitConfigs = {
  auth: { requests: 5, window: "15 m", label: "5/15m" },
  public: { requests: 60, window: "60 s", label: "60/m" },
  authed: { requests: 600, window: "60 s", label: "600/m" },
  webhook: { requests: 60, window: "60 s", label: "webhook 1MB" },
  admin: { requests: 10, window: "60 m", label: "10/h" },
};

const memoryStore = new Map<string, { count: number; reset: number }>();

function memoryCheck(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }
  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.reset, limit };
  }
  entry.count += 1;
  return { success: true, remaining: limit - entry.count, reset: entry.reset, limit };
}

function getWindowMs(window: string): number {
  if (window === "15 m") return 15 * 60 * 1000;
  if (window === "60 m") return 60 * 60 * 1000;
  return 60 * 1000;
}

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redisClient) redisClient = new Redis({ url, token });
  return redisClient;
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(tier: Tier): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (limiterCache.has(tier)) return limiterCache.get(tier)!;
  const cfg = rateLimitConfigs[tier];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window as never),
    prefix: `rl:${tier}`,
  });
  limiterCache.set(tier, limiter);
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
  tier: Tier = "public"
): Promise<{ success: boolean; remaining: number; reset: number; limit: number; headers: Record<string, string> }> {
  const cfg = rateLimitConfigs[tier];
  const windowMs = getWindowMs(cfg.window);
  let result: { success: boolean; remaining: number; reset: number; limit: number };
  const limiter = getLimiter(tier);
  if (limiter) {
    try {
      const r = await limiter.limit(identifier);
      result = { success: r.success, remaining: r.remaining, reset: r.reset, limit: r.limit };
    } catch {
      result = memoryCheck(`${tier}:${identifier}`, cfg.requests, windowMs);
    }
  } else {
    result = memoryCheck(`${tier}:${identifier}`, cfg.requests, windowMs);
  }
  const retryAfter = result.success ? "0" : String(Math.ceil((result.reset - Date.now()) / 1000));
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": retryAfter,
  };
  if (!result.success) headers["Retry-After"] = String(15 * 60);
  return { ...result, headers };
}

export function rateLimitHeaders(result: { limit: number; remaining: number; reset: number; success: boolean }) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": result.success ? "0" : "900",
  };
}
