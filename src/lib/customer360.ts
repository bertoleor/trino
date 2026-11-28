import { createClient } from '@/lib/supabase/server';
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

export async function getCustomer360(
  supabaseParam: Awaited<ReturnType<typeof createClient>> | null,
  userId: string
): Promise<Customer360> {
  const start =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  let data: Customer360 | null = null;
  let error: unknown = null;

  const supabase = supabaseParam ?? (await createClient());

  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch active cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) throw cartError;

    // Compute LTV from orders (single query)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_cents')
      .eq('user_id', userId)
      .in('status', LTV_STATUSES);

    if (ordersError) throw ordersError;

    const ltv_cents = (orders ?? []).reduce((sum: number, o: { total_cents?: number }) => sum + (o.total_cents ?? 0), 0);

    data = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name ?? null,
      ltv_cents,
      last_login: null, // Not tracked in new schema yet
      cart_id: cart?.id ?? null,
    };
  } catch (e) {
    error = e;
  }

  const end =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  const durationMs = Math.round(end - start);

  if (error || !data) {
    logger.info('customer360 fetch', {
      route: 'customer360',
      durationMs,
      userId,
      error: String(error),
    });
    throw new Error(`Customer360 not found: ${userId}`);
  }

  logger.info('customer360 fetch', { route: 'customer360', durationMs, userId });
  if (durationMs > 1000) {
    logger.warn('customer360 slow', { route: 'customer360', durationMs, userId });
  }

  return data;
}
