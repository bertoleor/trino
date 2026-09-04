import { logger } from '@/lib/logger';

export const LTV_STATUSES = ['authorized', 'processing', 'shipped', 'delivered'] as const;

export type Customer360 = {
  id: string;
  email: string;
  full_name?: string | null;
  ltv_cents: number;
  last_login: string | null;
  cart_id: string | null;
};

type SupabaseLike = {
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  from?: (table: string) => {
    select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: unknown; error: unknown }> } };
  };
};

export async function getCustomer360(supabase: SupabaseLike, userId: string): Promise<Customer360> {
  const start = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  let data: Customer360 | null = null;
  let error: unknown = null;

  try {
    const res = await supabase.rpc('get_customer_360', { target_user: userId });
    data = res.data as Customer360 | null;
    error = res.error;
  } catch (e) {
    error = e;
  }

  if ((error || !data) && supabase.from) {
    try {
      const res2 = await supabase.from('customer_360').select('*').eq('id', userId).single();
      data = res2.data as Customer360 | null;
      error = res2.error;
    } catch (e) {
      error = e;
    }
  }

  const end = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  const durationMs = Math.round(end - start);

  if (error || !data) {
    logger.info('customer360 fetch', { route: 'customer360', durationMs, userId, error: String(error) });
    throw new Error(`Customer360 not found: ${userId}`);
  }

  logger.info('customer360 fetch', { route: 'customer360', durationMs, userId });
  if (durationMs > 1000) {
    logger.warn('customer360 slow', { route: 'customer360', durationMs, userId });
  }

  return {
    id: data.id,
    email: data.email,
    full_name: (data as { full_name?: string | null }).full_name ?? null,
    ltv_cents: Number((data as { ltv_cents: number }).ltv_cents ?? 0),
    last_login: (data as { last_login: string | null }).last_login ?? null,
    cart_id: (data as { cart_id: string | null }).cart_id ?? null,
  };
}
