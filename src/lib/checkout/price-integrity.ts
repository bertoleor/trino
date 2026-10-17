import { createClient } from '@/lib/supabase/server';
export async function recomputeTotal(
  lineItems: { product_id: string; qty: number }[]
): Promise<number> {
  const supabase = await createClient();
  let total = 0;
  for (const it of lineItems) {
    const { data } = await supabase
      .from('products')
      .select('price_cents')
      .eq('id', it.product_id)
      .maybeSingle();
    const price_cents = (data as { price_cents?: number })?.price_cents ?? 0;
    total += price_cents * it.qty;
  }
  return total;
}
export function checkPriceIntegrity(
  dbTotal: number,
  clientTotal: number
): { ok: boolean; code?: number } {
  if (dbTotal !== clientTotal) return { ok: false, code: 422 };
  return { ok: true };
}
