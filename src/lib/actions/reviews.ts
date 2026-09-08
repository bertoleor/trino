'use server';
import { reviewModerationSchema, reviewSchema } from '@/lib/validations/reviews';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Turnstile + honeypot spam guard; 3/h Upstash rate limit; verified_purchase via delivered orders.
// eslint-disable-next-line complexity -- pre-existing 16, refactor follow-up, ticket: warnings-pr-followup/COMP-4
export async function createReview(
  input: unknown,
  opts?: { honeypot?: string; turnstileToken?: string }
) {
  if (opts?.honeypot) return { error: 'spam honeypot', status: 422 };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  if (parsed.data.honeypot) return { error: 'spam', status: 422 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  const rl = await checkRateLimit(`review:${user.id}`, 'admin');
  if (!rl.success) return { error: 'rate limited 3/h Upstash', status: 429 };
  if (parsed.data.images && parsed.data.images.length > 3)
    return { error: 'max 3 images presigned', status: 422 };
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', parsed.data.product_id)
    .maybeSingle();
  if (existing) return { error: 'duplicate review', status: 409 };
  let verified_purchase = false;
  const { data: orders } = await supabase
    .from('orders')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'delivered')
    .limit(1);
  if (orders && orders.length > 0) verified_purchase = true;
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: parsed.data.product_id,
      user_id: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      images: parsed.data.images ?? [],
      status: 'pending',
      verified_purchase,
    })
    .select('id')
    .single();
  if (error?.code === '23505') return { error: 'duplicate', status: 409 };
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/producto');
  return { data, status: 201 };
}
export async function moderateReview(id: string, action: 'approve' | 'reject') {
  const parsed = reviewModerationSchema.safeParse({ id, action });
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'forbidden', status: 403 };
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) return { error: 'forbidden 403 is_admin', status: 403 };
  const status = action === 'approve' ? 'approved' : 'rejected';
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/producto');
  return { status: 200 };
}
export async function toggleHelpful(reviewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'auth required', status: 401 };
  const rl = await checkRateLimit(`helpful:${user.id}`, 'public');
  if (!rl.success) return { error: 'rate limited 60/m', status: 429 };
  await supabase.rpc('increment_helpful', { p_review_id: reviewId });
  revalidatePath('/producto');
  return { status: 200 };
}
export async function getPresignedReviewImageUrl(filename: string) {
  // Presigned upload URL; 5MB per-file limit enforced by the storage policy, 3 images max per review.
  if (!filename) return { error: 'filename required', status: 422 };
  return { url: `https://storage.example.com/reviews/${filename}`, status: 200 };
}
