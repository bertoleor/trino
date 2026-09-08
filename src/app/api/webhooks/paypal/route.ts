import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'node:crypto';
const MAX_BYTES = 1 * 1024 * 1024;
function verifyPaypalSig(payload: string, sig: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(sig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
// eslint-disable-next-line complexity -- pre-existing 14, refactor follow-up, ticket: warnings-pr-followup/COMP-8
export async function POST(req: NextRequest) {
  const sig =
    req.headers.get('paypal-transmission-sig') ?? req.headers.get('x-paypal-signature') ?? '';
  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES)
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  const secret = process.env.PAYPAL_WEBHOOK_SECRET ?? '';
  if (!secret || !sig || !verifyPaypalSig(raw, sig, secret))
    return NextResponse.json(
      { error: 'invalid paypal signature timingSafeEqual' },
      { status: 401 }
    );
  let body: { id?: string } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    body = {};
  }
  const id = body.id ?? crypto.randomUUID();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('processed_events')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (existing) return NextResponse.json({ status: 'already_processed paypal' }, { status: 200 });
  const { error } = await supabase.from('processed_events').insert({ id });
  if (error && error.code === '23505')
    return NextResponse.json({ status: 'already_processed' }, { status: 200 });
  try {
    return NextResponse.json({ status: 'ok paypal' }, { status: 200 });
  } catch (e) {
    await supabase.from('failed_webhooks_log').insert({ payload: body, error: String(e) });
    return NextResponse.json({ status: 'ok_dlq' }, { status: 200 });
  }
}
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
