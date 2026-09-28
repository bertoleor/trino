import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';

describe('T-S04 shipping hash jitter SWR behavioral', () => {
  it('hash.ts uses sha256 not sum collision', async () => {
    expect(fs.existsSync('src/lib/shipping/hash.ts')).toBe(true);
    const c = fs.readFileSync('src/lib/shipping/hash.ts', 'utf8');
    expect(c).toMatch(/sha256|createHash/);
    expect(c).not.toMatch(/reduce.*\+.*weight/);
    const { computeShippingHash } = await import('@/lib/shipping/hash');
    const h1 = computeShippingHash('1000', [
      { weight: 10, product: 'A' },
      { weight: 10, product: 'B' },
    ]);
    const h2 = computeShippingHash('1000', [{ weight: 20, product: 'C' }]);
    expect(h1).not.toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('shippingHash is order independent and postal sensitive', async () => {
    const { shippingHash } = await import('@/lib/shipping/cache');
    const itemsA = [
      { weight: 5, product: 'X' },
      { weight: 10, product: 'Y' },
    ] as unknown as never[];
    const itemsB = [
      { weight: 10, product: 'Y' },
      { weight: 5, product: 'X' },
    ] as unknown as never[];
    const hA = shippingHash('1425', itemsA);
    const hB = shippingHash('1425', itemsB);
    expect(hA).toBe(hB);
    const hDiffCP = shippingHash('1426', itemsA);
    expect(hA).not.toBe(hDiffCP);
  });

  it('computeShippingHash vs shippingHash produce same for same inputs', async () => {
    const { computeShippingHash } = await import('@/lib/shipping/hash');
    const { shippingHash } = await import('@/lib/shipping/cache');
    const items = [{ weight: 1, product: 'P' }];
    expect(computeShippingHash('2000', items)).toBe(shippingHash('2000', items as never));
  });

  it('jitterRetry succeeds after transient failures', async () => {
    const { jitterRetry } = await import('@/lib/shipping/jitter');
    let attempts = 0;
    const fn = vi.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('transient');
      return 'ok';
    });
    const r = await jitterRetry(fn, 5);
    expect(r).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('jitterRetry throws after exhausting retries', async () => {
    const { jitterRetry } = await import('@/lib/shipping/jitter');
    const fn = vi.fn(async () => {
      throw new Error('always fail');
    });
    await expect(jitterRetry(fn, 3)).rejects.toThrow('always fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('cache SWR and circuit strings present', () => {
    const c = fs.readFileSync('src/lib/shipping/cache.ts', 'utf8');
    expect(c).toMatch(/SWR|stale|revalidate/i);
    expect(c).toMatch(/circuit|8s|3\/60/i);
    expect(c).toMatch(/p-limit|pLimit/);
  });

  it('cacheSet then cacheGet returns hit', async () => {
    const { cacheSet, cacheGet } = await import('@/lib/shipping/cache');
    const key = `test-${Date.now()}`;
    await cacheSet(key, { price: 1999 });
    const hit = await cacheGet(key);
    expect(hit).not.toBeNull();
    expect(hit?.hit).toBe(true);
    expect(hit?.data).toEqual({ price: 1999 });
  });
});
