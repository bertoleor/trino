import { checkPriceIntegrity, recomputeTotal } from '@/lib/checkout/price-integrity';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sendOrderConfirmation } from '@/lib/email/resend';
import { toJson } from '@/lib/supabase/typed';

// eslint-disable-next-line complexity -- pre-existing 15, refactor follow-up, ticket: warnings-pr-followup/COMP-2
export async function POST(req: NextRequest) {
  const idempotencyKey =
    req.headers.get('Idempotency-Key') ?? req.headers.get('idempotency-key') ?? '';
  const body = await req.json().catch(() => null);
  if (!body?.line_items || typeof body.total_cents !== 'number')
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  const dbTotal = await recomputeTotal(body.line_items as { product_id: string; qty: number }[]);
  const check = checkPriceIntegrity(dbTotal, body.total_cents as number);
  if (!check.ok) return NextResponse.json({ error: 'price_mismatch', code: 422 }, { status: 422 });
  const supabase = await createClient();
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('idempotency_keys')
      .select('key')
      .eq('key', idempotencyKey)
      .maybeSingle();
    if (existing) return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    await supabase.from('idempotency_keys').insert({ key: idempotencyKey }).select();
  }
  const isBank = body.payment_provider === 'bank';
  const status = isBank ? 'pending_verification' : 'pending';
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        status,
        total_cents: dbTotal,
        storage_path: body.storage_path ?? null,
        idempotency_key: idempotencyKey || null,
      })
      .select()
      .single();
    if (error) throw error;
    // Order confirmation email (test mode: sandbox recipient, never throws).
    const customerEmail = typeof body.email === 'string' ? body.email : '';
    const emailResult = await sendOrderConfirmation({
      orderId: String(data.id ?? idempotencyKey ?? 'unknown'),
      to: customerEmail,
      totalCents: dbTotal,
      itemCount: Array.isArray(body.line_items) ? body.line_items.length : undefined,
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
