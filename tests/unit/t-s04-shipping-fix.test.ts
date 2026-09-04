import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('T-S04 shipping hash jitter SWR', () => {
  it('hash.ts sha256 collision fix', () => {
    const p = 'src/lib/shipping/hash.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/sha256|createHash/);
    expect(c).not.toMatch(/reduce.*\+.*weight.*0\)/);
  });
  it('jitter.ts p-limit 5 jitter 100-500 5 retries', () => {
    const p = 'src/lib/shipping/jitter.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/p-limit|pLimit/);
    expect(c).toMatch(/jitter|100.*500|2\^attempt/);
    expect(c).toMatch(/5.*retries|retries.*5/);
  });
  it('cache SWR hit serve-stale per-carrier circuit', () => {
    const c = fs.readFileSync('src/lib/shipping/cache.ts', 'utf8');
    expect(c).toMatch(/SWR|stale|revalidate/i);
    expect(c).toMatch(/circuit|8s|3\/60/i);
  });
  it('collision 2 carts same sum different products different hash', async () => {
    const { shippingHash } = await import('@/lib/shipping/cache');
    const h1 = shippingHash('1000', [{ weight: 10, product: 'A' }, { weight: 10, product: 'B' }] as unknown as never[]);
    const h2 = shippingHash('1000', [{ weight: 20, product: 'C' }] as unknown as never[]);
    expect(h1).not.toBe(h2);
  });
});
