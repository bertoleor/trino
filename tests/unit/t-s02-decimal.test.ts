import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';
import fs from 'node:fs';

describe('T-S02 Decimal.js p-limit @dnd-kit behavioral', () => {
  it('package.json has decimal.js p-limit @dnd-kit deps', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies['decimal.js']).toBeDefined();
    expect(pkg.dependencies['p-limit']).toBeDefined();
    expect(pkg.dependencies['@dnd-kit/core']).toBeDefined();
    expect(pkg.dependencies['@dnd-kit/sortable']).toBeDefined();
  });

  it('money.ts uses Decimal.js HALF_UP and HALF_DOWN', () => {
    const c = fs.readFileSync('src/lib/validations/money.ts', 'utf8');
    expect(c).toMatch(/Decimal/);
    expect(c).toMatch(/ROUND_HALF_UP/);
    expect(c).toMatch(/ROUND_HALF_DOWN|HALF_DOWN/);
  });

  it('Decimal HALF_UP vs HALF_DOWN edge 1.005', async () => {
    const up = new Decimal('1.005').toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const down = new Decimal('1.005').toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN).toNumber();
    expect(up).toBe(1.01);
    expect(down).toBe(1.0);
    const { toDecimalCents } = await import('@/lib/money/decimal');
    // 100.5 via string preserves precision; floating 1.005*100 loses to 100.4999 and rounds to 100
    expect(toDecimalCents(100.5, Decimal.ROUND_HALF_UP)).toBe(101);
    expect(toDecimalCents(100.5, Decimal.ROUND_HALF_DOWN)).toBe(100);
    expect(new Decimal('100.5').toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()).toBe(101);
  });

  it('calcSplitCents distributes remainder with HALF_DOWN', async () => {
    const { calcSplitCents } = await import('@/lib/validations/money');
    expect(calcSplitCents(100, 3)).toEqual([34, 33, 33]);
    expect(calcSplitCents(10, 3)).toEqual([4, 3, 3]);
    expect(calcSplitCents(101, 2)).toEqual([51, 50]);
    const sum = calcSplitCents(100, 7).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(calcSplitCents(99, 3).reduce((a, b) => a + b, 0)).toBe(99);
  });

  it('toCents handles AR$ formats without drift', async () => {
    const { toCents } = await import('@/lib/validations/money');
    expect(toCents('AR$ 1.999,90')).toBe(199990);
    expect(toCents('1.999,90')).toBe(199990);
    expect(toCents('1999,90')).toBe(199990);
    expect(toCents('AR$0,50')).toBe(50);
    expect(toCents('0.50')).toBe(50);
    expect(toCents('-AR$ 1,50')).toBe(-150);
    expect(toCents('1.005')).toBe(101);
  });

  it('Decimal fuzz calcCartTotal 0.21*100 no IEEE drift', async () => {
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
    expect(snap.discountedSubtotalCents).toBe(359982);
  });

  it('calcCartTotal tax on discounted subtotal order', async () => {
    const { calcCartTotal } = await import('@/lib/validations/money');
    const r = calcCartTotal({ items: [{ priceCents: 10000, quantity: 1 }], shippingCents: 5000, discountPercent: 10, taxPercent: 21 });
    expect(r.discountedSubtotalCents).toBe(9000);
    expect(r.taxCents).toBe(2940);
    expect(r.totalCents).toBe(16940);
    expect(r.subtotalCents).toBe(10000);
  });

  it('cultura-calendar uses @dnd-kit', () => {
    const c = fs.readFileSync('src/components/admin/cultura-calendar.tsx', 'utf8');
    expect(c).toMatch(/@dnd-kit/);
  });
});
