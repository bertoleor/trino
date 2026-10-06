import { Redis } from '@upstash/redis';
import { SocialProvider } from '@/lib/social/graph';
import crypto from 'node:crypto';

type SyncItem = {
  id: string;
  platform: 'tiktok' | 'instagram';
  url: string;
  caption: string;
  hash: string;
};

// S-05 (CWE-400/CWE-770): the old dedup was a module-level Set keyed by a
// hand-rolled 31-bit hash — colliding keys silently dropped legitimate items
// ('az' and 'c<' both hash to 3129), the Set grew without bound, and it only
// deduped within one serverless instance. Replacement:
//   - sha256 content hash (collision risk is negligible)
//   - Redis SET NX EX as the primary dedup (atomic across instances)
//   - bounded in-memory Map as fallback (FIFO eviction, no unbounded growth)

export const DEDUP_TTL_SECONDS = 7 * 24 * 3600; // one week
export const MAX_MEM_DEDUP = 1000;

const KEY_PREFIX = 'cultura:dedup:';

const memSeen = new Map<string, number>();

// Minimal structural type: the real Redis client satisfies it and tests can
// mock @upstash/redis with a compatible class.
type RedisLike = {
  set: (
    key: string,
    value: string,
    opts: { ex: number; nx: true }
  ) => Promise<'OK' | string | null>;
};

let redisClient: RedisLike | null = null;

function getRedis(): RedisLike | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch {
      return null;
    }
  }
  return redisClient;
}

function contentHash(item: { platform: string; id: string; url: string; caption: string }): string {
  return crypto
    .createHash('sha256')
    .update(`${item.platform}|${item.id}|${item.url}|${item.caption}`)
    .digest('hex');
}

function claimMemory(hash: string): boolean {
  if (memSeen.has(hash)) return false;
  if (memSeen.size >= MAX_MEM_DEDUP) {
    // Map preserves insertion order: first key = oldest entry.
    const oldest = memSeen.keys().next().value;
    if (oldest !== undefined) memSeen.delete(oldest);
  }
  memSeen.set(hash, Date.now() + DEDUP_TTL_SECONDS * 1000);
  return true;
}

export async function syncCulturaFromSocial(): Promise<{
  imported: number;
  items: SyncItem[];
  followers: { tiktok: number; instagram: number };
  dedup: { backend: 'redis' | 'memory' };
}> {
  const t = await SocialProvider.fetchTikTokDisplay('mock').catch(() => ({ followers: 0 }));
  const ig = await SocialProvider.fetchInstagramBasic('mock').catch(() => ({ followers: 0 }));
  const raw: SyncItem[] = [
    {
      id: 't1',
      platform: 'tiktok',
      url: 'https://tiktok.com/@santisima/video/1',
      caption: 'Ritual TikTok',
      hash: '',
    },
    {
      id: 'ig1',
      platform: 'instagram',
      url: 'https://instagram.com/p/1',
      caption: 'Ritual IG',
      hash: '',
    },
  ];
  for (const item of raw) item.hash = contentHash(item);

  const redis = getRedis();
  let backend: 'redis' | 'memory' = redis ? 'redis' : 'memory';
  const filtered: SyncItem[] = [];
  for (const item of raw) {
    if (redis) {
      try {
        // SET NX EX is atomic: concurrent instances cannot double-claim a key.
        const claimed = await redis.set(`${KEY_PREFIX}${item.hash}`, '1', {
          ex: DEDUP_TTL_SECONDS,
          nx: true,
        });
        if (claimed === 'OK') filtered.push(item);
      } catch {
        // Redis failure must not break the sync: fall back per-item to memory.
        backend = 'memory';
        if (claimMemory(item.hash)) filtered.push(item);
      }
    } else if (claimMemory(item.hash)) {
      filtered.push(item);
    }
  }

  return {
    imported: filtered.length,
    items: filtered,
    followers: { tiktok: t.followers, instagram: ig.followers },
    dedup: { backend },
  };
}

export function clearSyncDedup() {
  memSeen.clear();
}
