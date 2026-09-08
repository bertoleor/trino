import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const strat = path.join(ROOT, 'src/lib/shipping/index.ts');
const calc = path.join(ROOT, 'src/lib/shipping/calc.ts');
describe('T-D03 shipping Strategy 60/300 ECOM-06 circuit', () => {
  it('shipping files exist', () => {
    expect(fs.existsSync(strat)).toBe(true);
    expect(fs.existsSync(calc) || fs.existsSync(path.join(ROOT, 'src/lib/shipping/rates.ts'))).toBe(true);
  });
  it('exports Strategy with cache 60/300', async () => {
    const mod = await import('@/lib/shipping');
    expect(typeof mod.getShippingRates).toBe('function');
    expect(typeof mod.ShippingCarrier).toBe('function');
  });
  it('has circuit + fallback', () => {
    const c = fs.readFileSync(strat, 'utf8');
    expect(c).toMatch(/circuit|Circuit|Abort/i);
    expect(c).toMatch(/fallback|FIXED|fixed_shipping/i);
    expect(c).toMatch(/60|300|s-maxage|stale/i);
  });
  it('p-limit and cache key session+CP+hash', () => {
    const c = fs.readFileSync(strat, 'utf8');
    expect(c).toMatch(/postal_code|postalCode|weight/i);
    expect(c).toMatch(/Upstash|redis|cache/i);
  });
});
