import { describe, expect, it } from 'vitest';
import { formatPriceARS } from '@/lib/money/format-price-ars';

describe('formatPriceARS', () => {
  it('formats pesos with es-AR grouping', () => {
    const s = formatPriceARS(1999.99);
    expect(s).toContain('1.999,99');
    expect(s).toContain('$');
  });

  it('formats zero without throwing', () => {
    expect(() => formatPriceARS(0)).not.toThrow();
  });

  it('parses AR decimal string equal to number', () => {
    expect(formatPriceARS('1.500,50')).toBe(formatPriceARS(1500.5));
  });

  it('trims whitespace numeric strings', () => {
    expect(formatPriceARS(' 1500 ')).toBe(formatPriceARS(1500));
  });

  it('throws RangeError on non-finite', () => {
    expect(() => formatPriceARS(NaN)).toThrow(RangeError);
    expect(() => formatPriceARS(Infinity)).toThrow(RangeError);
  });

  it('throws TypeError on non-numeric', () => {
    expect(() => formatPriceARS('abc')).toThrow(TypeError);
    expect(() => formatPriceARS('')).toThrow(TypeError);
  });

  it('honors locale override', () => {
    const s = formatPriceARS(1500.5, 'en-US');
    expect(s).toContain('1,500.50');
  });

  it('is pure (same input, same output)', () => {
    expect(formatPriceARS(42.5)).toBe(formatPriceARS('42.5'));
  });
});
