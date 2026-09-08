import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

const SECRET = 'test_secret_123';
const seen = new Set<string>();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            // processed_events check is done via insert 23505 path, return null always
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

describe('T-C02 webhooks/mercadopago HMAC behavioral', () => {
  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
    seen.clear();
    vi.clearAllMocks();
  });

  it('GET returns 405 POST only', async () => {
    const { GET } = await import('@/app/api/webhooks/mercadopago/route');
    const res = await GET();
    expect(res.status).toBe(405);
  });

  it('POST 401 when missing signature', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt-1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST 401 when HMAC invalid', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-bad', type: 'payment' });
    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': 't=123,v1=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad' },
      body: payload,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST 413 when payload exceeds 1MB', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const big = 'a'.repeat(1 * 1024 * 1024 + 10);
    const h = crypto.createHmac('sha256', SECRET).update(`999.${big}`).digest('hex');
    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': `t=999,v1=${h}` },
      body: big,
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it('POST 200 when HMAC valid', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-ok-200', type: 'payment' });
    const header = sign(payload, SECRET, '1710000000');
    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': header },
      body: payload,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('POST 200 dedup on duplicate event id', async () => {
    const { POST } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = JSON.stringify({ id: 'evt-dup', type: 'payment' });
    const header = sign(payload, SECRET, '1710000001');
    const mk = () =>
      new NextRequest('http://localhost/api/webhooks/mercadopago', {
        method: 'POST',
        headers: { 'x-signature': header },
        body: payload,
      });
    const r1 = await POST(mk());
    const r2 = await POST(mk());
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2.status).toMatch(/already_processed/);
  });

  it('verifyHmac direct behavioral vectors', async () => {
    const { verifyHmac, parseSignature } = await import('@/app/api/webhooks/mercadopago/route');
    const payload = '{"id":"v1"}';
    const t = '1700000000';
    const good = sign(payload, SECRET, t);
    expect(parseSignature(good)?.v1).toHaveLength(64);
    expect(verifyHmac(payload, good, SECRET)).toBe(true);
    expect(verifyHmac(payload, 't=1,v1=0'.repeat(16), SECRET)).toBe(false);
    expect(verifyHmac(payload, good, 'wrong-secret')).toBe(false);
  });
});
