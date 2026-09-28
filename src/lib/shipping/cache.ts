import { Redis } from '@upstash/redis';
import { createCircuitBreaker } from '@/lib/circuit';
import crypto from 'node:crypto';
import { logger } from '@/lib/logger';
import pLimit from 'p-limit';
// Shipping Redis guard: circuit 8s timeout, 3 failures/60s window, 30s probe; SWR stale revalidate.
const circuit = createCircuitBreaker({
  failureThreshold: 3,
  windowMs: 60_000,
  probeMs: 30_000,
  timeoutMs: 8000,
});
export const TTL = 60;
export const SWR = 300;
// T-S01 (CWE-770): unbounded request variety (session-id x cp x hash) made
// the in-memory fallback a memory-exhaustion vector. Bounded LRU-ish
// eviction: once full, the oldest inserted entry is dropped first.
export const MAX_MEM_ENTRIES = 1000;
export const MAX_HASH_ITEMS = 25;
const mem = new Map<string, { data: unknown; exp: number; swr: number }>();

function evictIfNeeded() {
  if (mem.size >= MAX_MEM_ENTRIES) {
    // Map preserves insertion order: first key = oldest entry.
    const oldest = mem.keys().next().value;
    if (oldest !== undefined) mem.delete(oldest);
  }
}
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!circuit.canExecute()) return null;
  try {
    return Redis.fromEnv();
  } catch (e) {
    circuit.recordFailure();
    logger.warn('shipping redis unavailable, memory fallback', {
      route: 'shipping/cache',
      error: String(e),
    });
    return null;
  }
}
export function shippingHash(postalCode: string, items: unknown[]): string {
  // T-S01: bound hash cost — reject oversized arrays BEFORE stringify+sha256.
  if (items.length > MAX_HASH_ITEMS) throw new Error('too many items to hash');
  const sorted = [...items].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const inner = crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  return crypto
    .createHash('sha256')
    .update(postalCode + inner)
    .digest('hex');
}
export async function cacheGet(
  key: string
): Promise<{ data: unknown; hit: boolean; stale: boolean } | null> {
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
  evictIfNeeded();
  mem.set(key, { data, exp: Date.now() + TTL * 1000, swr: Date.now() + SWR * 1000 });
}
export async function withJitterRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  const limit = pLimit(5);
  return limit(async () => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (e) {
        if (attempt === retries - 1) throw e;
        const jitter = Math.floor(Math.random() * 200);
        const delay = 100 * Math.pow(2, attempt) + jitter;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error('retry exhausted');
  });
}
