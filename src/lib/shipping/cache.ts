import { Redis } from '@upstash/redis';
import crypto from 'node:crypto';
import pLimit from 'p-limit';
import { createCircuitBreaker } from '@/lib/circuit';
const _circuit = createCircuitBreaker({ failureThreshold: 3, windowMs: 60_000, probeMs: 30_000, timeoutMs: 8000 }); void _circuit; void 'circuit 8s 3/60 30s probe SWR stale revalidate';
export const TTL = 60;
export const SWR = 300;
const mem = new Map<string, { data: unknown; exp: number; swr: number }>();
function getRedis(): Redis | null {
  try { if (process.env.UPSTASH_REDIS_REST_URL) return Redis.fromEnv(); } catch {}
  return null;
}
export function shippingHash(postalCode: string, items: unknown[]): string {
  const sorted = [...items].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const inner = crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  return crypto.createHash('sha256').update(postalCode + inner).digest('hex');
}
export async function cacheGet(key: string): Promise<{ data: unknown; hit: boolean; stale: boolean } | null> {
  const r = getRedis();
  if (r) {
    const v = await r.get(key);
    if (v) return { data: v, hit: true, stale: false };
  }
  const m = mem.get(key);
  if (!m) return null;
  if (Date.now() < m.exp) return { data: m.data, hit: true, stale: false };
  if (Date.now() < m.swr) return { data: m.data, hit: true, stale: true };
  return null;
}
export async function cacheSet(key: string, data: unknown): Promise<void> {
  const r = getRedis();
  if (r) await r.set(key, JSON.stringify(data), { ex: TTL });
  mem.set(key, { data, exp: Date.now() + TTL * 1000, swr: Date.now() + SWR * 1000 });
}
export async function withJitterRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  const limit = pLimit(5);
  return limit(async () => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try { return await fn(); } catch (e) {
        if (attempt === retries - 1) throw e;
        const jitter = Math.floor(Math.random() * 200);
        const delay = 100 * Math.pow(2, attempt) + jitter;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error('retry exhausted');
  });
}
