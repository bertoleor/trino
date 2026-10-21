import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * T-P02 (CWE-347) — PayPal webhook transmission-signature verification.
 *
 * PayPal webhooks are signed with a cert-based transmission scheme
 * (PAYPAL-AUTH-ALGO / CERT-URL / TRANSMISSION-ID / TRANSMISSION-SIG /
 * TRANSMISSION-TIME headers), NOT a shared-secret HMAC of the body.
 * Verification must call PayPal's /v1/notifications/verify-webhook-signature
 * API. Ref: developer.paypal.com/api/rest/webhooks/#verify-webhook-signature
 */

const CLIENT_ID = 'pp-client-id-test';
const CLIENT_SECRET = 'pp-client-secret-test';
const WEBHOOK_ID = 'WH-TEST123';
const API_BASE = 'https://api-m.sandbox.paypal.com';
const ACCESS_TOKEN = 'tok_test_123';

const seen = new Set<string>();
const inserted: Array<Record<string, unknown>> = [];

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          // processed_events check is done via insert 23505 path, return null always
          maybeSingle: async () => ({ data: null }),
        }),
      }),
      insert: async (row: Record<string, unknown>) => {
        if (table === 'processed_events' && typeof row?.id === 'string') {
          if (row.id.startsWith('WH-23505')) return { error: { code: '23505' } };
          if (row.id.startsWith('WH-DBERR'))
            return { error: { code: 'XX000', message: 'simulated db failure' } };
          if (seen.has(row.id)) return { error: { code: '23505' } };
          seen.add(row.id);
          inserted.push(row);
        }
        return { error: null };
      },
    }),
  })),
}));

type TokenConfig = { status: number; body?: unknown };
type VerifyConfig = { status: number; body?: unknown; reject?: Error };

let tokenConfig: TokenConfig;
let verifyConfig: VerifyConfig;
const fetchCalls: Array<{ url: string; init: RequestInit }> = [];

const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
  const u = String(url);
  fetchCalls.push({ url: u, init: init ?? {} });
  if (u.includes('/v1/oauth2/token')) {
    return new Response(
      JSON.stringify(
        tokenConfig.body ?? { access_token: ACCESS_TOKEN, token_type: 'Bearer', expires_in: 3600 }
      ),
      { status: tokenConfig.status, headers: { 'content-type': 'application/json' } }
    );
  }
  if (u.includes('/v1/notifications/verify-webhook-signature')) {
    if (verifyConfig.reject) throw verifyConfig.reject;
    return new Response(JSON.stringify(verifyConfig.body ?? { verification_status: 'SUCCESS' }), {
      status: verifyConfig.status,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response('not found', { status: 404 });
});

function paypalRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/webhooks/paypal', {
    method: 'POST',
    headers: {
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-cert-url': 'https://cert.paypal.com/cca-cert.pem',
      'paypal-transmission-id': 'TID-TEST-1',
      'paypal-transmission-sig': 'Base64Sig==',
      'paypal-transmission-time': '2026-10-21T00:00:00Z',
      ...headers,
    },
    body,
  });
}

const EVENT = JSON.stringify({ id: 'WH-EVT-TEST-1', event_type: 'PAYMENT.CAPTURE.COMPLETED' });

describe('T-P02 webhooks/paypal transmission-signature verification', () => {
  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = CLIENT_ID;
    process.env.PAYPAL_CLIENT_SECRET = CLIENT_SECRET;
    process.env.PAYPAL_WEBHOOK_ID = WEBHOOK_ID;
    process.env.PAYPAL_API_BASE = API_BASE;
    delete process.env.PAYPAL_WEBHOOK_SECRET;
    tokenConfig = { status: 200 };
    verifyConfig = { status: 200 };
    fetchCalls.length = 0;
    seen.clear();
    inserted.length = 0;
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;
    delete process.env.PAYPAL_WEBHOOK_ID;
    delete process.env.PAYPAL_API_BASE;
  });

  it('GET returns 405 POST only', async () => {
    const { GET } = await import('@/app/api/webhooks/paypal/route');
    const res = await GET();
    expect(res.status).toBe(405);
  });

  it('POST 400 when paypal transmission headers are missing (no outbound call)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: EVENT,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(fetchCalls.length).toBe(0);
  });

  it('POST 400 when only one transmission header is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const req = paypalRequest(EVENT, { 'paypal-transmission-sig': '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST 400 when x-paypal-signature fallback alone is present (legacy scheme rejected)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      headers: { 'x-paypal-signature': 'legacy-scheme-should-not-verify' },
      body: EVENT,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST 400 when cert url is not https', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const res = await POST(
      paypalRequest(EVENT, { 'paypal-cert-url': 'http://cert.paypal.com/cca-cert.pem' })
    );
    expect(res.status).toBe(400);
  });

  it('POST 400 when cert url host is not paypal/symantec', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const res = await POST(
      paypalRequest(EVENT, { 'paypal-cert-url': 'https://evil.com/cca-cert.pem' })
    );
    expect(res.status).toBe(400);
    expect(fetchCalls.length).toBe(0);
  });

  it('POST 413 when payload exceeds 1MB', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const big = 'a'.repeat(1 * 1024 * 1024 + 10);
    const res = await POST(paypalRequest(big));
    expect(res.status).toBe(413);
  });

  it('POST 400 when body is not a JSON object', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const res = await POST(paypalRequest('not json at all'));
    expect(res.status).toBe(400);
    const res2 = await POST(paypalRequest('["array","body"]'));
    expect(res2.status).toBe(400);
  });

  it('POST 503 fail-closed when PAYPAL_CLIENT_ID is not configured', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    delete process.env.PAYPAL_CLIENT_ID;
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(503);
    expect(fetchCalls.length).toBe(0);
  });

  it('POST 503 fail-closed when PAYPAL_WEBHOOK_ID is not configured', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    delete process.env.PAYPAL_WEBHOOK_ID;
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(503);
    expect(fetchCalls.length).toBe(0);
  });

  it('POST 503 fail-closed when oauth token endpoint rejects', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    tokenConfig = { status: 401, body: { error: 'invalid_client' } };
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(503);
  });

  it('POST 503 fail-closed when verify endpoint is a server error', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    verifyConfig = { status: 500, body: {} };
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(503);
  });

  it('POST 503 fail-closed when verify call throws (network)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    verifyConfig = { status: 200, reject: new Error('ECONNRESET') };
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(503);
  });

  it('POST 401 when PayPal reports verification FAILURE (no event recorded)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    verifyConfig = { status: 200, body: { verification_status: 'FAILURE' } };
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(401);
    expect(seen.size).toBe(0);
  });

  it('POST 200 on SUCCESS and sends exact payload to verify-webhook-signature API', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const res = await POST(paypalRequest(EVENT));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string };
    expect(json.status).toBe('ok paypal');

    const tokenCall = fetchCalls.find((c) => c.url.includes('/v1/oauth2/token'));
    expect(tokenCall).toBeDefined();
    expect(tokenCall?.init.method).toBe('POST');
    expect(tokenCall?.init.headers).toMatchObject({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    expect(String(tokenCall?.init.body)).toBe('grant_type=client_credentials');

    const verifyCall = fetchCalls.find((c) =>
      c.url.includes('/v1/notifications/verify-webhook-signature')
    );
    expect(verifyCall).toBeDefined();
    expect(verifyCall?.url.startsWith(API_BASE)).toBe(true);
    const headers = verifyCall?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
    const sent = JSON.parse(String(verifyCall?.init.body));
    expect(sent).toEqual({
      auth_algo: 'SHA256withRSA',
      cert_url: 'https://cert.paypal.com/cca-cert.pem',
      transmission_id: 'TID-TEST-1',
      transmission_sig: 'Base64Sig==',
      transmission_time: '2026-10-21T00:00:00Z',
      webhook_id: WEBHOOK_ID,
      webhook_event: { id: 'WH-EVT-TEST-1', event_type: 'PAYMENT.CAPTURE.COMPLETED' },
    });

    expect(seen.has('WH-EVT-TEST-1')).toBe(true);
  });

  it('POST 200 with mixed-case transmission headers (header lookup is case-insensitive)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      headers: {
        'PayPal-Auth-Algo': 'SHA256withRSA',
        'PayPal-Cert-Url': 'https://cert.paypal.com/cca-cert.pem',
        'PayPal-Transmission-Id': 'TID-TEST-1',
        'PayPal-Transmission-Sig': 'Base64Sig==',
        'PayPal-Transmission-Time': '2026-10-21T00:00:00Z',
      },
      body: EVENT,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('POST 200 dedup on duplicate event id (already_processed)', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const r1 = await POST(paypalRequest(EVENT));
    const r2 = await POST(paypalRequest(EVENT));
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const j2 = (await r2.json()) as { status: string };
    expect(j2.status).toMatch(/already_processed/);
  });

  it('POST 200 already_processed on 23505 unique-violation from insert', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const payload = JSON.stringify({
      id: 'WH-23505-CASE',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
    });
    const res = await POST(paypalRequest(payload));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string };
    expect(json.status).toMatch(/already_processed/);
  });

  it('POST 200 ok_dlq when processed_events insert fails with non-23505 db error', async () => {
    const { POST } = await import('@/app/api/webhooks/paypal/route');
    const payload = JSON.stringify({
      id: 'WH-DBERR-CASE',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
    });
    const res = await POST(paypalRequest(payload));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string };
    expect(json.status).toMatch(/ok_dlq/);
  });

  it('validateCertUrl direct behavioral vectors', async () => {
    const { validateCertUrl } = await import('@/app/api/webhooks/paypal/route');
    expect(validateCertUrl('https://cert.paypal.com/cca-cert.pem')).toBe(true);
    expect(validateCertUrl('https://paypal.com/cca-cert.pem')).toBe(true);
    expect(validateCertUrl('https://www.symantec.com/cca-cert.pem')).toBe(true);
    expect(validateCertUrl('http://cert.paypal.com/cca-cert.pem')).toBe(false);
    expect(validateCertUrl('https://evil.com/cca-cert.pem')).toBe(false);
    expect(validateCertUrl('https://cert.paypal.com.evil.com/cca-cert.pem')).toBe(false);
    expect(validateCertUrl('not-a-url')).toBe(false);
    expect(validateCertUrl('')).toBe(false);
  });
});
