import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-S02 (auditoría 34-auditor, S-02 MEDIUM, CWE-20/CWE-770): the `items`
// array flowed into shipping libs unvalidated and unbounded — the hash path
// was covered by S-01, but the lib boundary (getShippingRates /
// getInternationalRates) still accepts any array shape/size and forwards it
// to carrier fetches. S-02 pins: (a) fail-fast bound at the lib boundary
// BEFORE any carrier fetch, (b) per-element validation reused from the same
// zod schema the route uses (single source of truth), (c) no duplicated
// bound constants between cache.ts and validations/shipping.ts.
describe('T-S02 shipping items bound at lib boundary', () => {
  const items = (n: number) => Array.from({ length: n }, (_, i) => ({ weight: i + 1 }));

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getShippingRates fail-fast on unbounded/invalid items', () => {
    it('throws on >25 items BEFORE any carrier fetch', async () => {
      const { getShippingRates } = await import('@/lib/shipping');
      await expect(
        getShippingRates({ sessionId: 's-s02', postalCode: '1425', items: items(26) })
      ).rejects.toThrow(/items/i);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws on invalid element (non-finite weight) BEFORE any carrier fetch', async () => {
      const { getShippingRates } = await import('@/lib/shipping');
      const bad = [{ weight: Number.POSITIVE_INFINITY }];
      await expect(
        getShippingRates({ sessionId: 's-s02', postalCode: '1425', items: bad as never })
      ).rejects.toThrow(/items/i);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('accepts exactly 25 valid items without throwing (bound is inclusive)', async () => {
      const { getShippingRates } = await import('@/lib/shipping');
      const res = await getShippingRates({
        sessionId: 's-s02-ok',
        postalCode: '1425',
        items: items(25),
      });
      expect(res.source).toBe('andreani');
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('getInternationalRates fail-fast on unbounded/invalid items', () => {
    it('throws on >25 items BEFORE DHL fetch or fallback', async () => {
      const m = await import('@/lib/shipping/carriers/international');
      await expect(
        m.getInternationalRates({ postalCode: '1000', country: 'US', items: items(26) })
      ).rejects.toThrow(/items/i);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('accepts exactly 25 valid items (fallback path when flag disabled)', async () => {
      const m = await import('@/lib/shipping/carriers/international');
      const r = await m.getInternationalRates({
        postalCode: '1000',
        country: 'US',
        items: items(25),
      });
      expect(r.source).toBe('fallback');
    });
  });

  describe('single source of truth for the items bound', () => {
    it('cache.ts imports MAX_SHIPPING_ITEMS instead of re-declaring a local bound', () => {
      const c = read('src/lib/shipping/cache.ts');
      expect(c).toMatch(
        /import\s*\{[^}]*MAX_SHIPPING_ITEMS[^}]*\}\s*from\s*'@\/lib\/validations\/shipping'/
      );
      expect(c).not.toMatch(/(?:const|let|var)\s+MAX_HASH_ITEMS/);
    });

    it('hash bound equals schema bound (MAX_SHIPPING_ITEMS rejects at hash too)', async () => {
      const { shippingHash } = await import('@/lib/shipping/cache');
      const { MAX_SHIPPING_ITEMS } = await import('@/lib/validations/shipping');
      expect(MAX_SHIPPING_ITEMS).toBeGreaterThan(0);
      const oversized = items(MAX_SHIPPING_ITEMS + 1);
      expect(() => shippingHash('1425', oversized as never[])).toThrow();
    });

    it('lib boundary reuses the route zod schema (no bespoke validation)', async () => {
      const idx = read('src/lib/shipping/index.ts');
      const intl = read('src/lib/shipping/carriers/international.ts');
      // index.ts owns the shared assert (schema from validations/shipping);
      // international.ts must enforce the SAME contract via that assert —
      // no bespoke bounds, no second schema.
      expect(idx).toMatch(/shippingItemsSchema/);
      expect(intl).toMatch(/assertShippingItems/);
      expect(intl).not.toMatch(/z\.object|MAX_HASH_ITEMS/);
    });
  });

  describe('route regression: same contract end-to-end (S-01 + S-02)', () => {
    it('route validates with the shared schema before hashing (422) — lib bound is the same 25', () => {
      const route = read('src/app/api/shipping/rates/route.ts');
      expect(route).toMatch(/shippingRatesRequestSchema/);
      expect(route).toMatch(/422/);
    });
  });
});
