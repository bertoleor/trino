import { createClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
const MAX_BYTES = 1 * 1024 * 1024;
// T-P01 (CWE-347/295): Stripe signs `t=<unix_ts>,v1=<hmac>` envelopes. The old
// code HMAC'd the raw body and timingSafeEqual'd it against the WHOLE header
// string, so a legit Stripe signature could never match — every webhook 401'd.
// Now: parse the envelope, sign `${t}.${payload}`, compare each v1, and reject
// envelopes older than the tolerance window (replay).
export const STRIPE_SIG_TOLERANCE_SECONDS = 300;

type StripeSigEnvelope = { timestamp: number; v1s: string[] };

export function parseStripeSignature(sig: string): StripeSigEnvelope | null {
  const parts = sig
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  let timestamp: number | null = null;
  const v1s: string[] = [];
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq <= 0) return null;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key === 't') {
      const n = Number(value);
      if (!Number.isFinite(n) || !/^\d+$/.test(value)) return null;
      timestamp = n;
    } else if (key === 'v1') {
      if (!/^[a-f0-9]+$/i.test(value)) return null;
      v1s.push(value.toLowerCase());
    }
    // other keys (v0, future schemes) are ignored per Stripe's format
  }
  if (timestamp === null || v1s.length === 0) return null;
  return { timestamp, v1s };
}

export function verifyStripeSig(payload: string, sig: string, secret: string): boolean {
  const envelope = parseStripeSignature(sig);
  if (!envelope) return false;
  // Replay guard: reject envelopes signed outside the tolerance window.
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - envelope.timestamp) > STRIPE_SIG_TOLERANCE_SECONDS) return false;
  const signed = `${envelope.timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  for (const v1 of envelope.v1s) {
    const b = Buffer.from(v1, 'utf8');
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}
// eslint-disable-next-line complexity -- pre-existing 13, refactor follow-up, ticket: warnings-pr-followup/COMP-7
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') ?? '';
  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES)
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  if (!secret || !sig || !verifyStripeSig(raw, sig, secret))
    return NextResponse.json(
      { error: 'invalid signature stripe-signature timingSafeEqual' },
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
  if (existing) return NextResponse.json({ status: 'already_processed' }, { status: 200 });
  const { error } = await supabase.from('processed_events').insert({ id });
  if (error && error.code === '23505')
    return NextResponse.json({ status: 'already_processed' }, { status: 200 });
  try {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (e) {
    await supabase.from('failed_webhooks_log').insert({ payload: body, error: String(e) });
    return NextResponse.json({ status: 'ok_dlq' }, { status: 200 });
  }
}
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
