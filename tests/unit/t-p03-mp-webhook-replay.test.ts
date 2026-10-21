import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Audit finding P-03 (MEDIUM, CWE-294/384 / OWASP A02, 34-auditor, 2026-09-17):
// the 't' timestamp of the x-signature envelope is parsed but never checked
// against clock skew, so a captured request with a valid signature replays
// forever (processed_events dedup only blocks exact duplicate event ids).
// T-P03 pins the ±tolerance window (300s, same contract as T-P01 Stripe).

const SECRET = 'test_secret_p03';
const seen = new Set<string>();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table === 'processed_events') return { data: null };
            return { data: null };
          },
        }),
      }),
      insert: async (row: { id?: string }) => {
        if (table === 'processed_events' && row?.id) {
          if (seen.has(row.id)) return { error: { code: '23505' } };
          seen.add(row.id);
        }
        return { error: null };
      },
    }),
  })),
}));

function sign(payload: string, secret: string, t: string): string {
  const toSign = `${t}.${payload}`;
  const h = crypto.createHmac('sha256', secret).update(toSign).digest('hex');
  return `t=${t},v1=${h}`;
}

const nowSec = () => Math.floor(Date.now() / 1000);

function postReq(header: string, payload: string): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/mercadopago', {
    method: 'POST',
    headers: { 'x-signature': header },
    body: payload,
  });
}

describe('T-P03 webhooks/mercadopago signature timestamp replay window', () => {
  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
    seen.clear();
    vi.clearAllMocks();
  });

  it('POST 401 when timestamp is older than the tolerance window (replay)', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-stale', type: 'payment' });
    // valid HMAC, but signed 10 minutes ago: outside the 5-minute window
    const header = sign(payload, SECRET, String(nowSec() - 600));
    const res = await POST(postReq(header, payload));
    expect(res.status).toBe(401);
  });

  it('POST 401 when timestamp is far in the future (clock-skew / replay)', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-future', type: 'payment' });
    const header = sign(payload, SECRET, String(nowSec() + 600));
    const res = await POST(postReq(header, payload));
    expect(res.status).toBe(401);
  });

  it('POST 401 when signature carries no t at all (unbounded replay fallback)', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-no-t', type: 'payment' });
    // attacker strips the timestamp and signs the bare payload — the old
    // parseSignature fallback accepted this shape with no freshness bound
    const bare = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    const res = await POST(postReq(`v1=${bare}`, payload));
    expect(res.status).toBe(401);
  });

  it('POST 401 when t is non-numeric even with a matching v1', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-garbage-t', type: 'payment' });
    const header = sign(payload, SECRET, 'not-a-number');
    const res = await POST(postReq(header, payload));
    expect(res.status).toBe(401);
  });

  it('POST 200 when timestamp is fresh (now)', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-fresh', type: 'payment' });
    const header = sign(payload, SECRET, String(nowSec()));
    const res = await POST(postReq(header, payload));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('POST 200 dedup on duplicate event id still works with fresh signature', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-p03-dup', type: 'payment' });
    const header = sign(payload, SECRET, String(nowSec()));
    const r1 = await POST(postReq(header, payload));
    const r2 = await POST(postReq(header, payload));
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2.status).toMatch(/already_processed/);
  });

  it('verifyHmac window boundary vectors', async () => {
    const { verifyHmac, MERCADOPAGO_SIG_TOLERANCE_SECONDS } =
      await import('@/app/api/webhooks/mercadopago/route');
    const payload = '{"id":"vec-p03"}';
    // tolerance window is 300s, same contract as the Stripe route (T-P01)
    expect(MERCADOPAGO_SIG_TOLERANCE_SECONDS).toBe(300);
    // fresh and near-past timestamps verify
    expect(verifyHmac(payload, sign(payload, SECRET, String(nowSec())), SECRET)).toBe(true);
    expect(verifyHmac(payload, sign(payload, SECRET, String(nowSec() - 250)), SECRET)).toBe(true);
    // outside the window on both sides is rejected
    expect(verifyHmac(payload, sign(payload, SECRET, String(nowSec() - 350)), SECRET)).toBe(false);
    expect(verifyHmac(payload, sign(payload, SECRET, String(nowSec() + 350)), SECRET)).toBe(false);
    // no timestamp at all is rejected (old bare-payload fallback is gone)
    const bare = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    expect(verifyHmac(payload, `v1=${bare}`, SECRET)).toBe(false);
    expect(verifyHmac(payload, bare, SECRET)).toBe(false);
    // non-numeric t is rejected even when the HMAC over `${t}.${payload}` matches
    expect(verifyHmac(payload, sign(payload, SECRET, 'not-a-number'), SECRET)).toBe(false);
    // wrong secret still rejected
    expect(verifyHmac(payload, sign(payload, SECRET, String(nowSec())), 'wrong')).toBe(false);
  });
});
