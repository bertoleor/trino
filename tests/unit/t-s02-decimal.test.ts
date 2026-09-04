import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('T-S02 Decimal.js p-limit @dnd-kit deps + Decimal HALF_UP/HALF_DOWN', () => {
  it('package.json has decimal.js p-limit @dnd-kit deps', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies['decimal.js']).toBeDefined();
    expect(pkg.dependencies['p-limit']).toBeDefined();
    expect(pkg.dependencies['@dnd-kit/core']).toBeDefined();
    expect(pkg.dependencies['@dnd-kit/sortable']).toBeDefined();
  });
  it('money.ts uses Decimal.js for calcCartTotal', () => {
    const c = fs.readFileSync('src/lib/validations/money.ts', 'utf8');
    expect(c).toMatch(/Decimal/);
    expect(c).toMatch(/ROUND_HALF_UP/);
    expect(c).toMatch(/ROUND_HALF_DOWN|HALF_DOWN/);
  });
  it('Decimal handles 0.21*100 without drift fuzz', async () => {
    const { calcCartTotal } = await import('@/lib/validations/money');
    for (let i = 0; i < 100; i++) {
      const price = 199990 + (i % 7);
      const r = calcCartTotal({ items: [{ priceCents: price, quantity: 1 }], shippingCents: 0, discountPercent: 21, taxPercent: 0 });
      const expectedDiscount = Math.round((price * 21) / 100);
      expect(r.discountCents).toBe(expectedDiscount);
    }
    const snap = calcCartTotal({ items: [{ priceCents: 199990, quantity: 2 }], shippingCents: 150000, discountPercent: 10, taxPercent: 21 });
    expect(snap.totalCents).toBe(617078);
    expect(snap.taxCents).toBe(107096);
  });
  it('calcCartTotal tax on discounted subtotal order', async () => {
    const { calcCartTotal } = await import('@/lib/validations/money');
    const r = calcCartTotal({ items: [{ priceCents: 10000, quantity: 1 }], shippingCents: 5000, discountPercent: 10, taxPercent: 21 });
    expect(r.discountedSubtotalCents).toBe(9000);
    expect(r.taxCents).toBe(2940);
    expect(r.totalCents).toBe(16940);
  });
  it('cultura-calendar uses @dnd-kit', () => {
    const c = fs.readFileSync('src/components/admin/cultura-calendar.tsx', 'utf8');
    expect(c).toMatch(/@dnd-kit/);
  });
});
