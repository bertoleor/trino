'use server';
import { getOrCreateCartSessionId, readCartSessionId } from '@/lib/cart/session';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Optimistic update with rollback toast; 44px touch target on the client.
// T-S06 (CWE-639 / OWASP A01): la identidad anónima NUNCA es client-supplied
// — se resuelve server-side desde la cookie httpOnly trino_cart_sid. Un
// caller no puede sumar items al carrito anónimo de otro.
export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const owner = user?.id ?? null;
  // Anónimo: identidad de cookie server-side (crea la cookie si no existe).
  // Autenticado: su propia session anónima (siempre la misma cookie) y el
  // RPC recibe p_user_id SIEMPRE, así el owner real es el user autenticado.
  const cartSessionId = owner ? await readCartSessionId() : await getOrCreateCartSessionId();
  if (!owner && !cartSessionId) return { error: 'session required', status: 401 };
  const { data, error } = await supabase.rpc('add_to_cart_serializable', {
    p_variant_id: variantId,
    p_qty: quantity,
    p_user_id: owner,
    p_session_id: cartSessionId,
  });
  if (error?.message?.includes('conflict') || error?.code === '23505')
    return { error: 'conflict', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/tienda');
  return { data, status: 200 };
}

export async function mergeCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  // T-S06: la session anónima se lee de la cookie del caller, no del body.
  const cartSessionId = await readCartSessionId();
  if (!cartSessionId) return { status: 200 }; // nada que mergear
  const { error } = await supabase.rpc('merge_cart_serializable', {
    p_session_id: cartSessionId,
    p_user_id: user.id,
  });
  if (error?.message?.includes('SERIALIZABLE') || error?.message?.includes('409'))
    return { error: 'conflict', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/tienda');
  return { status: 200 };
}

export async function getCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const q = supabase.from('cart_items').select('id, variant_id, quantity');
  if (user) return q.eq('user_id', user.id);
  // T-S06: lectura anónima también por cookie server-side (read-only, sin
  // crear cookie) — sin ella no hay carrito visible, no 401: es un vacío
  // legítimo para first-time visitors.
  const cartSessionId = await readCartSessionId();
  if (cartSessionId)
    return supabase.from('carts').select('id').eq('session_id', cartSessionId).single();
  return { data: [], error: null };
}
