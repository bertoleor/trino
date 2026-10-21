import { checkPriceIntegrity, recomputeTotal } from '@/lib/checkout/price-integrity';
import { checkoutRequestSchema, orderStatusForProvider } from '@/lib/validations/checkout';
import { decideIdempotencyClaim, isUniqueViolation } from '@/lib/checkout/idempotency';
import type { IdempotencyClaimError } from '@/lib/checkout/idempotency';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sendOrderConfirmation } from '@/lib/email/resend';
import { toJson } from '@/lib/supabase/typed';

// T-P06 markers: auth.getUser 401 checkout:ip 5/m MAX_BODY_BYTES 413 safeParse 422
// status derivation via orderStatusForProvider user_id RLS pending_verification

// Hard cap: a legit checkout payload is a few KB; 32KB leaves huge headroom
// and bounds the parse cost of a hostile body (same bound as shipping rates).
const MAX_BODY_BYTES = 32 * 1024;

// T-P06 (auditoría 34-auditor, P-06 MEDIUM, CWE-284/CWE-20 / OWASP A01):
// the route was public, with no per-route rate limit, status derived from a
// client-supplied payment_provider, and storage_path/email stored unvalidated.
// Guards below fail fast, in order: rate limit -> auth -> body cap -> zod,
// all BEFORE any idempotency/price/order DB work.

// eslint-disable-next-line complexity -- pre-existing 15, P-06 guard stack adds rate-limit/auth/cap/zod branches, P-04 idempotency claim adds lost/failed/dup branches; refactor follow-up owned by this ticket; ticket: warnings-pr-followup/COMP-2
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await checkRateLimit(`checkout:${ip}`, 'checkout');
  if (!rl.success) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429, headers: rl.headers });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }
  const body = await req.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues.length },
      { status: 422 }
    );
  }
  const idempotencyKey =
    req.headers.get('Idempotency-Key') ?? req.headers.get('idempotency-key') ?? '';
  const dbTotal = await recomputeTotal(parsed.data.line_items);
  const check = checkPriceIntegrity(dbTotal, parsed.data.total_cents);
  if (!check.ok) return NextResponse.json({ error: 'price_mismatch', code: 422 }, { status: 422 });
  if (idempotencyKey) {
    // T-P04 (auditoría 34-auditor, P-04 HIGH, CWE-362/CWE-799): the INSERT is
    // the atomic claim — the idempotency_keys PK (migration 0020) is the race
    // barrier. The SELECT is only a replay fast-path; the INSERT result
    // decides, and a lost race (23505) responds idempotently instead of
    // double-processing like the old unchecked fire-and-forget claim.
    const { data: existingKey } = await supabase
      .from('idempotency_keys')
      .select('key')
      .eq('key', idempotencyKey)
      .maybeSingle();
    let claimError: IdempotencyClaimError | null = null;
    if (!existingKey) {
      const { error } = await supabase.from('idempotency_keys').insert({ key: idempotencyKey });
      claimError = error ?? null;
    }
    const claim = decideIdempotencyClaim(Boolean(existingKey), claimError);
    if (claim === 'failed') {
      // Fail-closed: without a won claim we cannot guarantee at-most-once.
      logger.error('checkout idempotency claim failed', {
        route: 'api/checkout',
        code: claimError?.code ?? null,
      });
      return NextResponse.json({ error: 'idempotency claim failed' }, { status: 500 });
    }
    if (claim === 'lost') {
      // Replay (or lost race): respond idempotently with the existing order
      // of THIS session user (own-orders RLS policy backs the select).
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id,status,total_cents,payment_provider,idempotency_key')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', user.id)
        .maybeSingle();
      return NextResponse.json(
        { status: 'already_processed', order: existingOrder ?? null },
        { status: 200 }
      );
    }
  }
  const status = orderStatusForProvider(parsed.data.payment_provider);
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status,
        total_cents: dbTotal,
        payment_provider: parsed.data.payment_provider,
        storage_path: parsed.data.storage_path ?? null,
        idempotency_key: idempotencyKey || null,
      })
      .select()
      .single();
    if (error) throw error;
    // Order confirmation email (test mode: sandbox recipient, never throws).
    const emailResult = await sendOrderConfirmation({
      orderId: String(data.id ?? idempotencyKey ?? 'unknown'),
      to: parsed.data.email ?? user.email ?? '',
      totalCents: dbTotal,
      itemCount: parsed.data.line_items.length,
    });
    if (!emailResult.ok) {
      logger.warn('order confirmation email not sent', {
        route: 'api/checkout',
        orderId: data.id,
        reason: 'skipped' in emailResult ? emailResult.skipped : emailResult.error,
      });
    }
    return NextResponse.json({ status: 'ok', order: data }, { status: 201 });
  } catch (e) {
    if (isUniqueViolation(e)) {
      // T-P04 defense-in-depth: orders.idempotency_key UNIQUE (migration 0020)
      // fired — an order for this key already exists (constraint drift; the
      // claim barrier should make this unreachable). Idempotent replay, never
      // 500/DLQ, and never free the key.
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id,status,total_cents,payment_provider,idempotency_key')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', user.id)
        .maybeSingle();
      return NextResponse.json(
        { status: 'already_processed', order: existingOrder ?? null },
        { status: 200 }
      );
    }
    // T-P04 compensation: the order insert failed for a non-duplicate reason —
    // release the claim so a client retry with the same key is not stuck as
    // already_processed with no order behind it.
    if (idempotencyKey) {
      try {
        await supabase.from('idempotency_keys').delete().eq('key', idempotencyKey);
      } catch (releaseError) {
        logger.error('checkout idempotency claim release failed', {
          route: 'api/checkout',
          error: String(releaseError),
        });
      }
    }
    try {
      await supabase
        .from('failed_webhooks_log')
        .insert({ payload: toJson(body), error: String(e) });
    } catch (dlqError) {
      logger.error('checkout DLQ write failed', { route: 'api/checkout', error: String(dlqError) });
    }
    return NextResponse.json({ error: 'checkout failed DLQ' }, { status: 500 });
  }
}
