import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-P09 (auditoría 34-auditor, P-09 MEDIUM, CWE-284 / OWASP A01):
// cuando createSignedUploadUrl fallaba, el handler construía y devolvía con
// 200 una URL de upload NO firmada (…/storage/v1/object/upload/sign/…):
// exponía el path del objeto y evadía la autorización + expiry de la signed
// URL. Contrato nuevo: si Storage no firma, NO existe fallback — el endpoint
// responde 503 fail-closed sin url/path/token en el body y el caller reintentó.

const ORDER_ID = '22222222-2222-4222-8222-222222222222';

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

type SignResult = { data: { signedUrl: string; token: string } | null; error: unknown };

const mockSupabase = (signResult: SignResult) =>
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
          // P-08: ownership server-side — el caller es dueño del order.
          const maybeSingle = vi.fn(async () => ({
            data: [{ id: ORDER_ID, user_id: 'u-owner' }],
            error: null,
          }));
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
          createSignedUploadUrl: vi.fn().mockResolvedValue(signResult),
        })),
      },
    })),
  }));

describe('T-P09 bank-proof: sin fallback unsigned, Storage caído = 503', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('el route ya no construye ninguna URL de upload no firmada', () => {
    const c = read('src/app/api/bank-proof/url/route.ts');
    // Ni el endpoint de sign directo ni ninguna variable fallback.
    expect(c).not.toMatch(/upload\/sign/);
    expect(c).not.toMatch(/fallback/i);
    // Fail-closed explícito: error de Storage se reporta 5xx, nunca 200.
    expect(c).toMatch(/503|502/);
  });

  it('storage que no firma → 503 sin url/path/token en el body', { timeout: 30000 }, async () => {
    mockSupabase({ data: null, error: { message: 'storage exploded' } });
    const { POST } = await import('@/app/api/bank-proof/url/route');
    const res = await POST(authedReq());
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(String(body.error)).toMatch(/storage|sign|upload/i);
    // El body no contiene URL ni path de storage: nada que reusar.
    expect(JSON.stringify(body)).not.toMatch(/"url"|bank_proofs\/|token/);
  });

  it('storage sano → 200 con signed URL (regresión del happy path)', { timeout: 30000 }, async () => {
    mockSupabase({ data: { signedUrl: 'https://signed.example/p09', token: 'tok-p09' }, error: null });
    const { POST } = await import('@/app/api/bank-proof/url/route');
    const res = await POST(authedReq());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url?: string; path?: string };
    expect(body.url).toMatch(/signed\.example/);
    expect(body.path).toContain(`bank_proofs/${ORDER_ID}/`);
  });

  it('ninguna ruta de src/ arma el patrón de upload unsigned', () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : [full];
      });
    const offenders = walk(path.join(ROOT, 'src'))
      .filter((f) => /\.(ts|tsx|js|jsx)$/.test(f))
      .filter((f) => fs.readFileSync(f, 'utf8').includes('object/upload/sign'));
    expect(offenders).toEqual([]);
  });
});
