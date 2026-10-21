import { createClient } from '@/lib/supabase/server';

// P-07 (auditoría 34-auditor, CWE-840/CWE-20 / OWASP A04): the server
// recomputes AND persists this total into orders.total_cents, so it must
// never trust client-supplied line_items. Bounds mirror the checkout zod
// schema (P-06): ≤ 25 items, qty 1..99 — defense in depth, same contract.
export type LineItem = { product_id: string; qty: number };
export type RecomputeResult =
  | { ok: true; total: number }
  | { ok: false; code: 400; error: string };

export const MAX_CHECKOUT_LINE_ITEMS = 25;
export const MAX_QTY_PER_LINE = 99;

export type PriceRow = { price_cents?: number } | null;
export type PriceFetcher = (product_id: string) => Promise<PriceRow>;

// Validates the SHAPE of client line_items without touching the DB.
// Fail-closed: anything that is not a well-formed, bounded cart is rejected.
export function validateLineItems(
  raw: unknown
): { ok: true; items: LineItem[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'invalid_line_items' };
  if (raw.length > MAX_CHECKOUT_LINE_ITEMS) return { ok: false, error: 'too_many_line_items' };
  const items: LineItem[] = [];
  for (const it of raw) {
    if (typeof it !== 'object' || it === null) return { ok: false, error: 'invalid_line_item' };
    const { product_id, qty } = it as Record<string, unknown>;
    if (typeof product_id !== 'string' || product_id.length === 0)
      return { ok: false, error: 'invalid_product_id' };
    if (
      typeof qty !== 'number' ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > MAX_QTY_PER_LINE
    )
      return { ok: false, error: 'invalid_qty' };
    items.push({ product_id, qty });
  }
  return { ok: true, items };
}

// P-07: fail-closed — an unknown product_id must NEVER contribute 0 to the
// total (the old null-coalesce-to-zero default made bogus ids price an
// order for free).
async function fetchPriceFromDb(product_id: string): Promise<PriceRow> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('price_cents')
    .eq('id', product_id)
    .maybeSingle();
  return (data as PriceRow) ?? null;
}

export async function recomputeTotal(
  raw: unknown,
  fetchPrice: PriceFetcher = fetchPriceFromDb
): Promise<RecomputeResult> {
  const parsed = validateLineItems(raw);
  if (!parsed.ok) return { ok: false, code: 400, error: parsed.error };
  let total = 0;
  for (const it of parsed.items) {
    const row = await fetchPrice(it.product_id);
    const price = row?.price_cents;
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
      return { ok: false, code: 400, error: 'unknown_product' };
    total += price * it.qty;
  }
  return { ok: true, total };
}
export function checkPriceIntegrity(
  dbTotal: number,
  clientTotal: number
): { ok: boolean; code?: number } {
  if (dbTotal !== clientTotal) return { ok: false, code: 422 };
  return { ok: true };
}
