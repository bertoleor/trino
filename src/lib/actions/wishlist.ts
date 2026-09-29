'use server';
import { getOrCreateCartSessionId, readCartSessionId } from '@/lib/cart/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { wishlistSchema } from '@/lib/validations/wishlist';

// Optimistic toggle with rollback toast; 60/m Upstash rate limit, idempotent 409 on duplicates.
// T-S07 (CWE-639 / OWASP A01): la identidad anónima NUNCA es client-supplied
// — se resuelve server-side desde la cookie httpOnly trino_cart_sid (misma
// cookie del carrito, lib/cart/session). Un caller no puede mergear ni
// escribir en la wishlist anónima de otro.
// T-S09 (CWE-799/CWE-770): la KEY del rate limiter jamás deriva de la cookie
// de sesión (rotable por request => elusión total del 60/m). Autenticado:
// user.id server-side. Anónimo: IP de x-forwarded-for — mismo trust model que
// proxy.ts y /api/shipping/rates. La cookie sigue siendo el owner de los rows,
// solo deja de ser la key del bucket.
// eslint-disable-next-line complexity -- pre-existing 22, refactor follow-up, ticket: warnings-pr-followup/COMP-5
export async function toggleWishlist(productId: string) {
  const parsed = wishlistSchema.safeParse({ product_id: productId });
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // T-S09: bucket key no-rotatable. Se resuelve ANTES de tocar cookies — un
  // 429 no debe gastar creación de cookie.
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for') ?? 'unknown';
  const rlId = user ? `u:${user.id}` : `ip:${ip}`;
  const rl = await checkRateLimit(`wishlist:${rlId}`, 'public');
  if (!rl.success) return { error: 'rate limited 60/m Upstash', status: 429, headers: rl.headers };
  // Anónimo: identidad de cookie server-side (crea la cookie si no existe).
  const sessionId = user ? null : await getOrCreateCartSessionId();
  const owner = user?.id ?? null;
  if (owner) {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', owner)
      .eq('product_id', productId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase.from('wishlists').delete().eq('id', existing.id);
      if (error) return { error: error.message, status: 422 };
      revalidatePath('/wishlist');
      return { status: 200, action: 'removed' };
    }
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: owner, product_id: productId });
    if (error?.code === '23505' || error?.message?.includes('duplicate'))
      return { error: 'duplicate', status: 409 };
    if (error) return { error: error.message, status: 422 };
    revalidatePath('/wishlist');
    return { status: 201, action: 'added' };
  }
  if (!sessionId) return { error: 'session required', status: 401 };
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .maybeSingle();
  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id);
    revalidatePath('/wishlist');
    return { status: 200, action: 'removed' };
  }
  const { error } = await supabase
    .from('wishlists')
    .insert({ session_id: sessionId, product_id: productId });
  if (error?.code === '23505') return { error: 'duplicate', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/wishlist');
  return { status: 201, action: 'added' };
}
export async function mergeWishlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  // T-S07: la session anónima se lee de la cookie del caller, no del body.
  const sessionId = await readCartSessionId();
  if (!sessionId) return { status: 200 }; // nada que mergear
  const { data: anonRows } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('session_id', sessionId);
  if (!anonRows?.length) return { status: 200 };
  for (const row of anonRows) {
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: row.product_id });
    if (error?.code === '23505') continue;
  }
  await supabase.from('wishlists').delete().eq('session_id', sessionId);
  revalidatePath('/wishlist');
  return { status: 200, merged: anonRows.length };
}
export async function getWishlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return supabase.from('wishlists').select('id, product_id').eq('user_id', user.id);
  // T-S07: lectura anónima también por cookie server-side (read-only, sin
  // crear cookie) — sin ella: lista vacía legítima para first-time visitors.
  const sessionId = await readCartSessionId();
  if (sessionId)
    return supabase.from('wishlists').select('id, product_id').eq('session_id', sessionId);
  return { data: [], error: null };
}
