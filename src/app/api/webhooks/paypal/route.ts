import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'node:crypto';
import { logger } from '@/lib/logger';
import { toJson } from '@/lib/supabase/typed';

const MAX_BYTES = 1 * 1024 * 1024;
const OUTBOUND_TIMEOUT_MS = 10_000;
const DEFAULT_PAYPAL_API_BASE = 'https://api-m.paypal.com';

/**
 * T-P02 (CWE-347) — PayPal webhooks use a cert-based transmission signature
 * (base64 RSA over `transmissionId|time|webhookId|CRC32(body)`), NOT a
 * shared-secret HMAC of the body. The signature is validated by relaying the
 * transmission headers + parsed event to PayPal's verify-webhook-signature
 * API and requiring an explicit `SUCCESS`. Anything else fails closed.
 * Ref: https://developer.paypal.com/api/rest/webhooks/#verify-webhook-signature
 */
const PAYPAL_TRANSMISSION_HEADERS = [
  'paypal-auth-algo',
  'paypal-cert-url',
  'paypal-transmission-id',
  'paypal-transmission-sig',
  'paypal-transmission-time',
] as const;

type PaypalTransmissionHeaders = {
  [K in (typeof PAYPAL_TRANSMISSION_HEADERS)[number]]: string;
};

export type PaypalVerifyOutcome = 'SUCCESS' | 'FAILURE' | 'ERROR';

type PaypalVerifyConfig = {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  base: string;
};

export function extractPaypalHeaders(req: NextRequest): PaypalTransmissionHeaders | null {
  const out: Partial<PaypalTransmissionHeaders> = {};
  for (const name of PAYPAL_TRANSMISSION_HEADERS) {
    const value = req.headers.get(name);
    if (!value) return null;
    out[name] = value;
  }
  return out as PaypalTransmissionHeaders;
}

// Cert URL must be https on a PayPal/Symantec host (per PayPal docs); anything
// else is rejected before any outbound call.
export function validateCertUrl(certUrl: string): boolean {
  return isPaypalHostedHttpsUrl(certUrl);
}

function isPaypalHostedHttpsUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'paypal.com' ||
        url.hostname.endsWith('.paypal.com') ||
        url.hostname.endsWith('.symantec.com'))
    );
  } catch {
    return false;
  }
}

export function paypalApiBase(): string | null {
  const base = (process.env.PAYPAL_API_BASE || DEFAULT_PAYPAL_API_BASE).replace(/\/+$/, '');
  return isPaypalHostedHttpsUrl(base) ? base : null;
}

function paypalVerifyConfig(): PaypalVerifyConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  const webhookId = process.env.PAYPAL_WEBHOOK_ID ?? '';
  const base = paypalApiBase();
  if (!clientId || !clientSecret || !webhookId || !base) return null;
  return { clientId, clientSecret, webhookId, base };
}

export async function verifyPaypalWebhookSignature(
  headers: PaypalTransmissionHeaders,
  webhookEvent: unknown,
  config: PaypalVerifyConfig
): Promise<PaypalVerifyOutcome> {
  try {
    const tokenRes = await fetch(`${config.base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    });
    if (!tokenRes.ok) return 'ERROR';
    const tokenData = (await tokenRes.json()) as { access_token?: unknown };
    if (typeof tokenData.access_token !== 'string' || !tokenData.access_token) return 'ERROR';

    const verifyRes = await fetch(`${config.base}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: config.webhookId,
        webhook_event: webhookEvent,
      }),
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    });
    if (!verifyRes.ok) return 'ERROR';
    const data = (await verifyRes.json()) as { verification_status?: unknown };
    return data.verification_status === 'SUCCESS' ? 'SUCCESS' : 'FAILURE';
  } catch (e) {
    logger.error('paypal webhook signature verification call failed', {
      route: 'webhooks/paypal',
      error: String(e),
    });
    return 'ERROR';
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed, POST only' }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES)
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });

  const headers = extractPaypalHeaders(req);
  if (!headers)
    return NextResponse.json({ error: 'missing paypal transmission headers' }, { status: 400 });
  if (!validateCertUrl(headers['paypal-cert-url']))
    return NextResponse.json({ error: 'invalid paypal cert url' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }

  const config = paypalVerifyConfig();
  if (!config) {
    logger.error(
      'paypal webhook not configured: PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID / PAYPAL_API_BASE'
    );
    return NextResponse.json({ error: 'paypal webhook not configured' }, { status: 503 });
  }

  const outcome = await verifyPaypalWebhookSignature(headers, body, config);
  if (outcome === 'ERROR')
    return NextResponse.json({ error: 'webhook verification unavailable' }, { status: 503 });
  if (outcome === 'FAILURE')
    return NextResponse.json({ error: 'invalid paypal signature' }, { status: 401 });

  const id = typeof body.id === 'string' && body.id ? body.id : crypto.randomUUID();
  return acknowledgeEvent(id, body);
}

// Idempotent ack: dedup via processed_events, DLQ (failed_webhooks_log) on any
// persist failure so verified events are never silently dropped.
async function acknowledgeEvent(id: string, body: Record<string, unknown>): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('processed_events')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (existing) return NextResponse.json({ status: 'already_processed paypal' }, { status: 200 });
    const { error: insertError } = await supabase.from('processed_events').insert({ id });
    if (insertError && insertError.code === '23505')
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    if (insertError) {
      await supabase.from('failed_webhooks_log').insert({
        payload: toJson(body),
        error: `processed_events insert failed: ${insertError.message}`,
      });
      return NextResponse.json({ status: 'ok_dlq' }, { status: 200 });
    }
    return NextResponse.json({ status: 'ok paypal' }, { status: 200 });
  } catch (e) {
    try {
      const supabase = await createClient();
      await supabase
        .from('failed_webhooks_log')
        .insert({ payload: toJson(body), error: String(e) });
    } catch (dlqError) {
      logger.error('paypal webhook DLQ write failed', {
        route: 'webhooks/paypal',
        error: String(dlqError),
      });
    }
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}
