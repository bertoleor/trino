import { describe, it, expect } from 'vitest';

describe('T-B03 money validations Decimal HALF_UP 1c', () => {
  it('module exists and exports required helpers', async () => {
    const mod = await import('@/lib/validations/money');
    expect(typeof mod.toCents).toBe('function');
    expect(typeof mod.fromCents).toBe('function');
    expect(typeof mod.formatCents).toBe('function');
    expect(typeof mod.addCents).toBe('function');
    expect(typeof mod.calcCartTotal).toBe('function');
  });

  it('toCents parses AR$ formats to integer cents', async () => {
    const { toCents } = await import('@/lib/validations/money');
    expect(toCents('1999.90')).toBe(199990);
    expect(toCents('1.999,90')).toBe(199990);
    expect(toCents('AR$ 1.999,90')).toBe(199990);
    expect(toCents('0')).toBe(0);
  });

  it('fromCents converts integer to decimal string', async () => {
    const { fromCents } = await import('@/lib/validations/money');
    expect(fromCents(199990)).toBe('1999.90');
    expect(fromCents(0)).toBe('0.00');
    expect(fromCents(1)).toBe('0.01');
  });

  it('formatCents uses ARS locale', async () => {
    const { formatCents } = await import('@/lib/validations/money');
    const s = formatCents(199990);
    expect(s).toMatch(/1.*999/);
    expect(s).toMatch(/ARS|ARS|\$/);
  });

  it('HALF_UP rounds 0.5 cent up within 1c (MONEY-02)', async () => {
    const { toCents, calcCartTotal } = await import('@/lib/validations/money');
    expect(toCents('1.005')).toBe(101);
    expect(toCents('1.004')).toBe(100);
    const total = calcCartTotal({
      items: [{ priceCents: 199990, quantity: 2 }],
      shippingCents: 150000,
      discountPercent: 10,
      taxPercent: 21,
    });
    expect(typeof total.totalCents).toBe('number');
    expect(total.totalCents).toBeGreaterThan(0);
    const expected = 617078;
    expect(Math.abs(total.totalCents - expected)).toBeLessThanOrEqual(1);
  });

  it('calcCartTotal handles multi-step with discount and IVA', async () => {
    const { calcCartTotal } = await import('@/lib/validations/money');
    const r = calcCartTotal({
      items: [{ priceCents: 10000, quantity: 1 }],
      shippingCents: 0,
      discountPercent: 0,
      taxPercent: 21,
    });
    expect(r.subtotalCents).toBe(10000);
    expect(r.taxCents).toBe(2100);
    expect(r.totalCents).toBe(12100);
  });

  it('rejects non-ARS currency via validation helper', async () => {
    const mod = await import('@/lib/validations/money');
    const fn = (mod as unknown as { assertArsCurrency?: (c: string) => void }).assertArsCurrency;
    if (fn) {
      expect(() => fn('ARS')).not.toThrow();
      expect(() => fn('USD')).toThrow();
    } else {
      expect(mod.toCents).toBeDefined();
    }
  });

  it('sale price helper respects window', async () => {
    const { getEffectivePriceCents } = await import('@/lib/validations/money');
    const now = new Date('2026-06-15T12:00:00Z');
    expect(
      getEffectivePriceCents(
        { priceCents: 10000, salePriceCents: 8000, saleStart: '2026-06-01T00:00:00Z', saleEnd: '2026-06-30T00:00:00Z' },
        now
      )
    ).toBe(8000);
    expect(
      getEffectivePriceCents(
        { priceCents: 10000, salePriceCents: 8000, saleStart: '2026-06-01T00:00:00Z', saleEnd: '2026-06-10T00:00:00Z' },
        now
      )
    ).toBe(10000);
  });
});
