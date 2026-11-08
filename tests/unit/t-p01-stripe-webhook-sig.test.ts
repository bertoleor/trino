import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SECRET = 'whsec_test_secret_123';
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

describe('T-P01 webhooks/stripe signature verification behavioral', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    seen.clear();
    vi.clearAllMocks();
  });

  it('GET returns 405 POST only', async () => {
    const { GET } = await import('@/app/api/webhooks/stripe/route');
    const res = await GET();
    expect(res.status).toBe(405);
  });

  it('POST 401 when signature header missing', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt-no-sig' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST 401 when v1 HMAC invalid', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const payload = JSON.stringify({ id: 'evt-bad-sig', type: 'payment_intent.succeeded' });
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature':
          't=1710000000,v1=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad',
      },
      body: payload,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST 401 when timestamp older than tolerance window (replay)', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const payload = JSON.stringify({ id: 'evt-stale-t', type: 'payment_intent.succeeded' });
    // Signed 10 minutes in the past: outside the 5-minute tolerance window.
    const tenMinAgo = String(Math.floor(Date.now() / 1000) - 600);
    const header = sign(payload, SECRET, tenMinAgo);
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': header },
      body: payload,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST 200 when signature valid (t + v1 parsed)', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const payload = JSON.stringify({ id: 'evt-ok-p01', type: 'payment_intent.succeeded' });
    const header = sign(payload, SECRET, String(Math.floor(Date.now() / 1000)));
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': header },
      body: payload,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('POST 200 dedup on duplicate event id', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const payload = JSON.stringify({ id: 'evt-dup-p01', type: 'payment_intent.succeeded' });
    const header = sign(payload, SECRET, String(Math.floor(Date.now() / 1000)));
    const mk = () =>
      new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': header },
        body: payload,
      });
    const r1 = await POST(mk());
    const r2 = await POST(mk());
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2.status).toMatch(/already_processed/);
  });

  it('POST 413 when payload exceeds 1MB', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const big = 'a'.repeat(1 * 1024 * 1024 + 10);
    const header = sign(big, SECRET, String(Math.floor(Date.now() / 1000)));
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': header },
      body: big,
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it('verifyStripeSig behavioral vectors incl. multi-v1 envelope', async () => {
    const { verifyStripeSig } = await import('@/app/api/webhooks/stripe/route');
    const payload = '{"id":"vec"}';
    const t = String(Math.floor(Date.now() / 1000));
    const good = sign(payload, SECRET, t);
    // valid envelope parses and verifies
    expect(verifyStripeSig(payload, good, SECRET)).toBe(true);
    // wrong secret fails
    expect(verifyStripeSig(payload, good, 'whsec_wrong')).toBe(false);
    // garbage header fails
    expect(verifyStripeSig(payload, 'nonsense', SECRET)).toBe(false);
    // multi-element envelope (v0 + v1): must try each v1, matching last one
    const h0 = crypto
      .createHmac('sha256', SECRET)
      .update(`${Number(t) - 100}.${payload}`)
      .digest('hex');
    const multi = `t=${t},v0=${h0},${sign(payload, SECRET, t)}`;
    expect(verifyStripeSig(payload, multi, SECRET)).toBe(true);
    // v1 with no timestamp key fails
    expect(
      verifyStripeSig(
        payload,
        `v1=${sign(payload, SECRET, t).split(',')[1]?.split('=')[1]}`,
        SECRET
      )
    ).toBe(false);
  });
});
