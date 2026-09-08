import Decimal from 'decimal.js';
export function assertArsCurrency(currency: string): void {
  if (currency !== 'ARS') throw new Error(`Currency must be ARS, got ${currency}`);
}

export function calcSplitCents(totalCents: number, parts: number): number[] {
  const per = new Decimal(totalCents)
    .div(parts)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_DOWN)
    .toNumber();
  const arr = Array(parts).fill(per) as number[];
  const remainder = totalCents - per * parts;
  for (let i = 0; i < remainder; i++) arr[i] = (arr[i] as number) + 1;
  return arr;
}

// eslint-disable-next-line complexity -- pre-existing 18, refactor follow-up, ticket: warnings-pr-followup/COMP-6
export function toCents(input: string | number): number {
  if (typeof input === 'number') {
    const s = String(input);
    return toCents(s);
  }
  let s = input
    .trim()
    .replace(/AR\$\s*/i, '')
    .replace(/\$/g, '')
    .trim();
  s = s.replace(/\s+/g, '');
  if (s === '' || s === '-' || s === ',') return 0;
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    s = s.replace(',', '.');
  }
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  if (!/^\d*\.?\d*$/.test(s)) throw new Error(`Invalid money input: ${input}`);
  const parts = s.split('.');
  const p0 = parts[0] as string | undefined;
  const intPart = (p0 ?? '') === '' ? '0' : (p0 ?? '0');
  const fracRaw = (parts[1] as string | undefined) ?? '';
  const fracPadded = (fracRaw + '000').slice(0, 3);
  const frac2 = fracPadded.slice(0, 2);
  const roundDigit = Number(fracPadded[2] ?? '0');
  let cents = Number(intPart) * 100 + Number(frac2);
  if (roundDigit >= 5) cents += 1;
  return neg ? -cents : cents;
}

export function fromCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${frac}`;
}

export function formatCents(cents: number, locale = 'es-AR'): string {
  const value = cents / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(value);
}

export function addCents(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export type CartItem = { priceCents: number; quantity: number };
export type CartTotalInput = {
  items: CartItem[];
  shippingCents: number;
  discountPercent: number;
  taxPercent: number;
};
export type CartTotal = {
  subtotalCents: number;
  discountCents: number;
  discountedSubtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export function calcCartTotal(input: CartTotalInput): CartTotal {
  const subtotalCents = input.items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const discountCents = new Decimal(subtotalCents)
    .times(input.discountPercent)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
  const discountedSubtotalCents = subtotalCents - discountCents;
  const preTax = discountedSubtotalCents + input.shippingCents;
  const taxCents = new Decimal(preTax)
    .times(input.taxPercent)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
  const totalCents = preTax + taxCents;
  return {
    subtotalCents,
    discountCents,
    discountedSubtotalCents,
    shippingCents: input.shippingCents,
    taxCents,
    totalCents,
  };
}

export function getEffectivePriceCents(
  p: {
    priceCents: number;
    salePriceCents?: number | null;
    saleStart?: string | null;
    saleEnd?: string | null;
  },
  now = new Date()
): number {
  if (p.salePriceCents == null || p.salePriceCents <= 0) return p.priceCents;
  const start = p.saleStart ? new Date(p.saleStart) : null;
  const end = p.saleEnd ? new Date(p.saleEnd) : null;
  if (start && now < start) return p.priceCents;
  if (end && now > end) return p.priceCents;
  return p.salePriceCents;
}
