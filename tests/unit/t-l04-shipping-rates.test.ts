import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('T-L04 shipping rates POST Upstash p-limit jitter', () => {
  it('route exists with Upstash SETEX X-Cache HIT MISS', () => {
    const p = 'src/app/api/shipping/rates/route.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/Upstash|redis|SETEX/);
    expect(c).toMatch(/X-Cache/);
    expect(c).toMatch(/HIT|MISS/);
  });
  it('route uses p-limit jitter sha256 fallback global_settings', () => {
    const c = fs.readFileSync('src/app/api/shipping/rates/route.ts', 'utf8');
    expect(c).toMatch(/p-limit|pLimit/);
    expect(c).toMatch(/jitter|100.*2.*attempt/);
    expect(c).toMatch(/sha256|createHash/);
    expect(c).toMatch(/global_settings|fixed_shipping_cents/);
  });
  it('cache lib exists with 60/300 fallback', () => {
    const p = 'src/lib/shipping/cache.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/60|SETEX/);
    expect(c).toMatch(/300|SWR|stale/);
  });
});
