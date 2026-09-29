// Separate normalizer: strips symbol, unifies decimal separator to '.', handles sign.
function toDecimalString(input: string): string {
  let s = input.trim().replace(/\s+/g, '');
  s = s.replace(/^(AR\$|\$)/i, '');
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) s = s.replace(/\./g, '').replace(',', '.');
  else if (hasComma) s = s.replace(',', '.');
  return s;
}

function parsePesos(input: number | string): number {
  if (typeof input === 'number') return input;
  if (typeof input !== 'string') {
    throw new TypeError(`formatPriceARS expects number|string, got ${typeof input}`);
  }
  if (input.trim() === '') throw new TypeError('formatPriceARS received empty string');
  const s = toDecimalString(input);
  if (s === '' || s === '-' || s === ',') {
    throw new TypeError(`formatPriceARS received non-numeric string: ${input}`);
  }
  const neg = s.startsWith('-');
  const digits = neg ? s.slice(1) : s;
  if (!/^\d*\.?\d*$/.test(digits)) {
    throw new TypeError(`formatPriceARS received non-numeric string: ${input}`);
  }
  return Number((neg ? '-' : '') + digits);
}

export function formatPriceARS(value: number | string, locale = 'es-AR'): string {
  const amount = parsePesos(value);
  if (!Number.isFinite(amount)) {
    throw new RangeError(`formatPriceARS received non-finite value: ${String(value)}`);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(amount);
}
