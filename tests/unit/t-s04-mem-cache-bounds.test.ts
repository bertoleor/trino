import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

// T-S04 (auditoría 34-auditor, S-04 MEDIUM, CWE-400/CWE-770): the module-level
// rate Maps in shipping/index.ts and carriers/international.ts were unbounded —
// distinct session/country keys grew the Map without limit until OOM on a
// long-running instance. cache.ts was already bounded by S-01; the rate-limit
// memoryStore by A-04 (memory-store.ts); the cultura-sync dedup by S-05.
// This suite pins the two remaining shipping Maps: cap declared, EVERY
// MEM.set site preceded by FIFO eviction, and bounded size under key churn.
describe('T-S04 bounded in-memory rate caches', () => {
  const wiring = (file: string) => {
    const c = read(file);
    // every insert site must be preceded by an eviction call
    const evictions = (c.match(/evictOldestIfNeeded\(/g) ?? []).length;
    const sets = (c.match(/MEM\.set\(/g) ?? []).length;
    expect(evictions).toBe(sets);
    expect(sets).toBeGreaterThan(0);
    // cap is declared once in bounded-map.ts and re-exported (S-02 doctrine:
    // no duplicated bound constants between modules)
    expect(c).toMatch(/export \{ MAX_RATE_MEM_ENTRIES \}/);
  };

  describe('static: cap + FIFO eviction wired at every set site', () => {
    it('bounded-map helper declares the cap and FIFO eviction via insertion order', () => {
      const c = read('src/lib/bounded-map.ts');
      expect(c).toMatch(/export const MAX_RATE_MEM_ENTRIES = 1000/);
      expect(c).toMatch(/export function evictOldestIfNeeded/);
      expect(c).toMatch(/map\.keys\(\)\.next\(\)\.value/);
    });

    it('shipping/index.ts: cap declared, every MEM.set preceded by eviction', () => {
      wiring('src/lib/shipping/index.ts');
    });

    it('carriers/international.ts: cap declared, every MEM.set preceded by eviction', () => {
      wiring('src/lib/shipping/carriers/international.ts');
    });
  });

  describe('behavioral: domestic MEM bounded under key churn', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: true }))
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('carrier-success path: oldest evicted at cap, newest kept, size capped', async () => {
      const m = await import('@/lib/shipping');
      m.clearShippingMem();
      const cap = m.MAX_RATE_MEM_ENTRIES;
      const items = [{ weight: 1 }];
      await m.getShippingRates({ sessionId: 't-s04-first', postalCode: '1425', items });
      for (let i = 0; i < cap + 1; i++) {
        await m.getShippingRates({ sessionId: `t-s04-churn-${i}`, postalCode: '1425', items });
      }
      expect(m.shippingMemSize()).toBe(cap);
      const evicted = await m.getShippingRates({
        sessionId: 't-s04-first',
        postalCode: '1425',
        items,
      });
      expect(evicted.cache).toBe('MISS');
      const kept = await m.getShippingRates({
        sessionId: `t-s04-churn-${cap}`,
        postalCode: '1425',
        items,
      });
      expect(kept.cache).toBe('HIT');
    });

    it('all-carriers-fail fallback path: size stays capped under churn', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('boom');
        })
      );
      const m = await import('@/lib/shipping');
      m.clearShippingMem();
      const cap = m.MAX_RATE_MEM_ENTRIES;
      const items = [{ weight: 1 }];
      for (let i = 0; i < cap + 1; i++) {
        const r = await m.getShippingRates({
          sessionId: `t-s04-fallback-${i}`,
          postalCode: '1425',
          items,
        });
        expect(r.source).toBe('fallback');
      }
      expect(m.shippingMemSize()).toBe(cap);
    });
  });

  describe('behavioral: international MEM bounded under key churn', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: true }))
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('fallback path: oldest evicted at cap, newest kept, size capped', async () => {
      const m = await import('@/lib/shipping/carriers/international');
      m.clearIntlMem();
      const cap = m.MAX_RATE_MEM_ENTRIES;
      const items = [{ weight: 1 }];
      await m.getInternationalRates({ country: 'ZZ', postalCode: '1000', items });
      for (let i = 0; i < cap + 1; i++) {
        await m.getInternationalRates({
          country: `t-s04-intl-${i}`,
          postalCode: '1000',
          items,
        });
      }
      expect(m.intlMemSize()).toBe(cap);
      const evicted = await m.getInternationalRates({ country: 'ZZ', postalCode: '1000', items });
      expect(evicted.cache).toBe('MISS');
      const kept = await m.getInternationalRates({
        country: `t-s04-intl-${cap}`,
        postalCode: '1000',
        items,
      });
      expect(kept.cache).toBe('HIT');
    });
  });
});
