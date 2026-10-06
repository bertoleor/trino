import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-S01: POST /api/shipping/rates — anti-DoS hardening
// (auditoría 34-auditor, STATIC S-01 HIGH): unauthenticated fan-out a carriers,
// hashing CPU-bound pre-validación y fallback DB por request en cache MISS.
describe('T-S01 shipping rates anti-DoS hardening', () => {
  describe('route: rate limit + body cap + zod validation before hash', () => {
    const ROUTE = 'src/app/api/shipping/rates/route.ts';

    it('applies checkRateLimit with a dedicated shipping tier before any work', async () => {
      const c = read(ROUTE);
      expect(c).toMatch(/checkRateLimit/);
      // shipping tier, no 'public' default: the finding says fan-out needs a
      // stricter budget than the generic 60/m global proxy tier
      expect(c).toMatch(/checkRateLimit\([^)]*'shipping'\)/);
    });

    it('caps request body size at 32KB before parsing (413)', async () => {
      const c = read(ROUTE);
      expect(c).toMatch(/content-length|413|MAX_BODY_BYTES|32\s*\*\s*1024/);
    });

    it('validates items with zod BEFORE hashing (422 on bad shape)', async () => {
      const c = read(ROUTE);
      expect(c).toMatch(/zod|z\.object|shippingRatesRequestSchema/);
      expect(c).toMatch(/422|413|unprocess/i);
    });

    it('caps session id length (client-controlled header, unbounded cache key)', async () => {
      const c = read(ROUTE);
      expect(c).toMatch(/sessionId\.slice|slice\(0,\s*128\)|MAX_SESSION_ID|session.{0,20}128/);
    });
  });

  describe('rate-limit lib: dedicated shipping tier', () => {
    it('rateLimitConfigs.shipping exists with stricter budget than public', async () => {
      const { rateLimitConfigs } = await import('@/lib/rate-limit');
      expect(rateLimitConfigs.shipping).toBeDefined();
      expect(rateLimitConfigs.shipping.requests).toBeLessThanOrEqual(30);
      expect(rateLimitConfigs.shipping.requests).toBeGreaterThan(0);
      expect(['60 s', '60 m'].includes(rateLimitConfigs.shipping.window)).toBe(true);
    });
  });

  describe('shippingRatesRequestSchema (behavioral)', () => {
    it('accepts a valid payload and strips unknown item keys', async () => {
      const { shippingRatesRequestSchema } = await import('@/lib/validations/shipping');
      const parsed = shippingRatesRequestSchema.parse({
        postalCode: '1425',
        items: [{ weight: 5, dims: { w: 1, h: 2, d: 3 }, evil: 'x' }],
      });
      expect(parsed.postalCode).toBe('1425');
      expect(parsed.items).toHaveLength(1);
      const first = parsed.items[0];
      expect(first).toBeDefined();
      if (!first) throw new Error('unreachable');
      expect(first).not.toHaveProperty('evil');
      expect(first.dims).toEqual({ w: 1, h: 2, d: 3 });
    });

    it('rejects more than 25 items (fan-out amplification cap)', async () => {
      const { shippingRatesRequestSchema } = await import('@/lib/validations/shipping');
      const items = Array.from({ length: 26 }, (_, i) => ({ weight: i + 1 }));
      expect(() => shippingRatesRequestSchema.parse({ postalCode: '1425', items })).toThrow();
    });

    it('rejects non-finite weight and bogus dims', async () => {
      const { shippingRatesRequestSchema } = await import('@/lib/validations/shipping');
      expect(() =>
        shippingRatesRequestSchema.parse({ postalCode: '1425', items: [{ weight: NaN }] })
      ).toThrow();
      expect(() =>
        shippingRatesRequestSchema.parse({
          postalCode: '1425',
          items: [{ weight: 1, dims: { w: 'a', h: 2, d: 3 } }],
        })
      ).toThrow();
      expect(() =>
        shippingRatesRequestSchema.parse({ postalCode: '1425', items: 'not-array' })
      ).toThrow();
    });

    it('rejects empty postalCode and oversized postalCode', async () => {
      const { shippingRatesRequestSchema } = await import('@/lib/validations/shipping');
      expect(() => shippingRatesRequestSchema.parse({ postalCode: '', items: [] })).toThrow();
      expect(() =>
        shippingRatesRequestSchema.parse({ postalCode: 'x'.repeat(33), items: [] })
      ).toThrow();
    });
  });

  describe('cache: mem map eviction + hash input bound (CWE-770)', () => {
    // Force the memory path: with Upstash env vars present, cacheSet would
    // do real network SETs and the eviction assertions would race.
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it('caps items length before hashing (hash cost bound)', async () => {
      const c = read('src/lib/shipping/cache.ts');
      expect(c).toMatch(/MAX_ITEMS|maxItems|items\.length\s*>|\.slice\(0,\s*25\)/i);
    });

    it('shippingHash refuses oversized items arrays', async () => {
      const { shippingHash } = await import('@/lib/shipping/cache');
      const oversized = Array.from({ length: 26 }, (_, i) => ({ weight: i })) as never[];
      expect(() => shippingHash('1425', oversized)).toThrow();
    });

    it('bounds the in-memory cache map (oldest entries evicted)', async () => {
      const { cacheSet, cacheGet } = await import('@/lib/shipping/cache');
      const first = `t-s01-evict-first-${Date.now()}`;
      await cacheSet(first, { price: 1 });
      // exceed the map cap: every set beyond the cap must evict the oldest
      for (let i = 0; i < 1200; i++) {
        await cacheSet(`t-s01-evict-${Date.now()}-${i}`, { price: i });
      }
      const survived = await cacheGet(first);
      expect(survived).toBeNull();
    });
  });
});
