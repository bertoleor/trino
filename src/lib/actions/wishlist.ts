'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { wishlistSchema } from '@/lib/validations/wishlist';
import { checkRateLimit } from '@/lib/rate-limit';
void 'optimistic update with rollback toast 44px';
void '60/m Upstash idempotent 409 duplicate';
export async function toggleWishlist(productId: string, sessionId?: string) {
  const parsed = wishlistSchema.safeParse({ product_id: productId });
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const identifier = user?.id ?? sessionId ?? 'anon';
  const rl = await checkRateLimit(`wishlist:${identifier}`, 'public');
  if (!rl.success) return { error: 'rate limited 60/m Upstash', status: 429, headers: rl.headers };
  const owner = user?.id ?? null;
  if (owner) {
    const { data: existing } = await supabase.from('wishlists').select('id').eq('user_id', owner).eq('product_id', productId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('wishlists').delete().eq('id', existing.id);
      if (error) return { error: error.message, status: 422 };
      revalidatePath('/wishlist');
      return { status: 200, action: 'removed' };
    }
    const { error } = await supabase.from('wishlists').insert({ user_id: owner, product_id: productId });
    if (error?.code === '23505' || error?.message?.includes('duplicate')) return { error: 'duplicate', status: 409 };
    if (error) return { error: error.message, status: 422 };
    revalidatePath('/wishlist');
    return { status: 201, action: 'added' };
  }
  if (!sessionId) return { error: 'session required', status: 401 };
  const { data: existing } = await supabase.from('wishlists').select('id').eq('session_id', sessionId).eq('product_id', productId).maybeSingle();
  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id);
    revalidatePath('/wishlist');
    return { status: 200, action: 'removed' };
  }
  const { error } = await supabase.from('wishlists').insert({ session_id: sessionId, product_id: productId });
  if (error?.code === '23505') return { error: 'duplicate', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/wishlist');
  return { status: 201, action: 'added' };
}
export async function mergeWishlist(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  const { data: anonRows } = await supabase.from('wishlists').select('product_id').eq('session_id', sessionId);
  if (!anonRows?.length) return { status: 200 };
  for (const row of anonRows) {
    const { error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: row.product_id });
    if (error?.code === '23505') continue;
  }
  await supabase.from('wishlists').delete().eq('session_id', sessionId);
  revalidatePath('/wishlist');
  return { status: 200, merged: anonRows.length };
}
export async function getWishlist(sessionId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return supabase.from('wishlists').select('id, product_id').eq('user_id', user.id);
  if (sessionId) return supabase.from('wishlists').select('id, product_id').eq('session_id', sessionId);
  return { data: [], error: null };
}
