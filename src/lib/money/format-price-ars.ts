function parsePesos(input: number | string): number {
  if (typeof input === 'number') return input;
  if (typeof input !== 'string') {
    throw new TypeError(`formatPriceARS expects number|string, got ${typeof input}`);
  }
  let s = input.trim().replace(/\s+/g, '');
  if (s === '') throw new TypeError('formatPriceARS received empty string');
  s = s.replace(/^(AR\$|\$)/i, '');
  if (s === '' || s === '-' || s === ',') {
    throw new TypeError(`formatPriceARS received non-numeric string: ${input}`);
  }
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    s = s.replace(',', '.');
  }
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  if (!/^\d*\.?\d*$/.test(s)) {
    throw new TypeError(`formatPriceARS received non-numeric string: ${input}`);
  }
  const n = Number((neg ? '-' : '') + s);
  return n;
}

export function formatPriceARS(value: number | string, locale = 'es-AR'): string {
  const amount = parsePesos(value);
  if (!Number.isFinite(amount)) {
    throw new RangeError(`formatPriceARS received non-finite value: ${String(value)}`);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(amount);
}
