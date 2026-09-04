import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/shipping/carriers/international.ts');
describe('T-D03b international 4th carrier DHL flag', () => {
  it('file exists', () => {
    expect(fs.existsSync(p)).toBe(true);
  });
  it('flag SHIPPING_INTERNATIONAL_ENABLED=false fallback', async () => {
    const m = await import('@/lib/shipping/carriers/international');
    expect(m.SHIPPING_INTERNATIONAL_ENABLED).toBe(false);
    expect(typeof m.getInternationalRates).toBe('function');
  });
  it('fallback flat customs when disabled', async () => {
    const m = await import('@/lib/shipping/carriers/international');
    const r = await m.getInternationalRates({ postalCode: '1000', country: 'US', items: [{ weight: 1 }] });
    expect(r.source).toBe('fallback');
    expect(r.rates[0]!.carrier).toBe('fallback');
    expect(r.rates[0]!.priceCents).toBeGreaterThan(0);
  });
  it('references DHL eCommerce / Correo Intl customs', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/DHL|eCommerce|Correo|customs/i);
    expect(c).toMatch(/SHIPPING_INTERNATIONAL_ENABLED/);
    expect(c).toMatch(/fallback|FIXED/i);
  });
});
