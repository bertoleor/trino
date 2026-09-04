export type FxTarget = 'USD' | 'EUR' | 'BRL';
export type FxRate = { target: FxTarget; rate: number; fetched_at: string; source: string };
export function convertCents(centsArs: number, rate: number): number {
  try {
    const D = (globalThis as unknown as { Decimal?: unknown }).Decimal as unknown as { new (v: number): { times(n: number): { toDecimalPlaces(p: number): { toNumber(): number } } } } | undefined;
    if (D) return new D(centsArs).times(rate).toDecimalPlaces(0).toNumber();
  } catch {}
  return Math.round(centsArs * rate);
}
export function formatFx(centsArs: number, target: FxTarget, rate: number, locale: string): string {
  const converted = convertCents(centsArs, rate) / 100;
  const fallback = (converted).toFixed(2);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: target }).format(converted);
  } catch {
    return `${target} ${fallback}`;
  }
}
export function formatArs(cents: number, locale = 'es-AR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(cents / 100);
}
export const FX_DISPLAY_ONLY = 'display only ARS cents convert via Intl.NumberFormat Decimal toFixed';
