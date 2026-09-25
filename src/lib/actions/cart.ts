'use server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateAnonSessionId } from '@/lib/session/anon';
import { revalidatePath } from 'next/cache';

// Optimistic update with rollback toast; 44px touch target on the client.
export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const owner = user?.id ?? null;
  // Anonymous cart owner is bound server-side from an httpOnly cookie; the
  // client can never choose which cart it writes to (S-06, CWE-639 / A01).
  const sessionId = owner ? null : await getOrCreateAnonSessionId();
  const { data, error } = await supabase.rpc('add_to_cart_serializable', {
    p_variant_id: variantId,
    p_qty: quantity,
    p_user_id: owner,
    p_session_id: sessionId,
  });
  if (error?.message?.includes('conflict') || error?.code === '23505')
    return { error: 'conflict', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/tienda');
  return { data, status: 200 };
}

export async function mergeCart(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  const { error } = await supabase.rpc('merge_cart_serializable', {
    p_session_id: sessionId,
    p_user_id: user.id,
  });
  if (error?.message?.includes('SERIALIZABLE') || error?.message?.includes('409'))
    return { error: 'conflict', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/tienda');
  return { status: 200 };
}

export async function getCart(sessionId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const q = supabase.from('cart_items').select('id, variant_id, quantity');
  if (user) return q.eq('user_id', user.id);
  if (sessionId) return supabase.from('carts').select('id').eq('session_id', sessionId).single();
  return { data: [], error: null };
}
