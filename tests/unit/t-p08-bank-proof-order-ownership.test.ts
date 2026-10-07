import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-P08 (auditoría 34-auditor, P-08 MEDIUM, CWE-639/284 / OWASP A01):
// /api/bank-proof/url solo chequeaba autenticación y jamás verificaba que el
// caller sea dueño del orderId — cualquier user autenticado obtenía un signed
// upload URL para bank_proofs/<orderId-ajeno>/<uuid> (IDOR). Contrato nuevo:
// el endpoint resuelve ownership server-side contra orders.user_id ANTES de
// firmar; un order ajeno/inexistente responde 404 (fail-close, no revela
// existencia) y jamás llega a Storage.

const ORDER_ID = '11111111-1111-4111-8111-111111111111';

const authedReq = () =>
  new Request('http://localhost/api/bank-proof/url', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      orderId: ORDER_ID,
      contentType: 'application/pdf',
      fileName: 'comprobante.pdf',
    }),
  }) as unknown as never;

const mockSupabase = (ordersData: unknown[] | null) =>
  vi.doMock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: 'u-owner' } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          const maybeSingle = vi.fn(async () => ({ data: ordersData, error: null }));
          const eq2 = vi.fn().mockReturnValue({ maybeSingle });
          const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
          return { select: vi.fn().mockReturnValue({ eq: eq1 }) };
        }
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        };
      }),
      storage: {
        from: vi.fn(() => ({
          createSignedUploadUrl: vi
            .fn()
            .mockResolvedValue({
              data: { signedUrl: 'https://signed.example', token: 'tok' },
              error: null,
            }),
        })),
      },
    })),
  }));

describe('T-P08 bank-proof signed URL requires orderId ownership (CWE-639)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('route checks ownership against orders.user_id before signing', () => {
    const c = read('src/app/api/bank-proof/url/route.ts');
    // La query de ownership es explícita server-side: id + user_id del caller.
    expect(c).toMatch(/from\('orders'\)/);
    expect(c).toMatch(/\.eq\('user_id',\s*user\.id\)/);
    // Fail-close: order ajeno/inexistente nunca llega a createSignedUploadUrl.
    expect(c).toMatch(/404/);
  });

  it('authenticated user requesting a foreign order gets 404, never a signed URL', async () => {
    // maybeSingle() con user_id del caller no matchea -> data: null -> 404
    mockSupabase(null);
    const { POST } = await import('@/app/api/bank-proof/url/route');
    const res = await POST(authedReq());
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/order|not found/i);
    // el body no contiene URL firmada alguna
    expect(JSON.stringify(body)).not.toMatch(/signedUrl|token|expiresIn/);

    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('authenticated owner gets 200 with signed URL for their own order', async () => {
    mockSupabase([{ id: ORDER_ID, user_id: 'u-owner' }]);
    const { POST } = await import('@/app/api/bank-proof/url/route');
    const res = await POST(authedReq());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url?: string; path?: string };
    expect(body.url).toMatch(/signed\.example/);
    expect(body.path).toContain(`bank_proofs/${ORDER_ID}/`);

    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('anonymous caller gets 401 before any order lookup', async () => {
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn(async () => ({
        auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: null })) },
      })),
    }));
    const { POST } = await import('@/app/api/bank-proof/url/route');
    const res = await POST(authedReq());
    expect(res.status).toBe(401);

    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('smoke: POST handler exported', async () => {
    const mod = await import('@/app/api/bank-proof/url/route');
    expect(typeof (mod as unknown as { POST: unknown }).POST).toBe('function');
  });
});
