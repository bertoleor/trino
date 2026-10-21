import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-P11 (auditoría 34-auditor, P-11 MEDIUM, CWE-20/770 / OWASP A04):
// cuando el fetch de orders fallaba o devolvía null/vacío, el endpoint de
// shipping batch FABRICABA OrderForLabel con CP sintéticos '1425'/'1426'
// para ids posiblemente inexistentes y generaba etiquetas igual
// (route.ts:107-112) => envíos mal etiquetados. Contrato nuevo (fail-closed):
//  - fetch de orders explota o data === null -> 503 orders_fetch_failed, sin stream
//  - ids que no existen en DB -> no se les genera etiqueta; van en done.missing
//  - order sin postal_code -> skipped en done.skipped, JAMÁS CP inventado
//  - sin orders válidos -> 404 no_valid_orders, no se fabrica nada

const ID_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ID_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CP_A = 'C1425DQF'; // CP real, no el sintético del hallazgo
const CP_B = 'C1426XYZ';

type OrderRow = {
  id: string;
  postal_code?: string | null;
  shipping_address?: { postal_code?: string } | null;
};

type OrdersFetch = { data: OrderRow[] | null } | { throw: true };

const editorReq = (ids: string[]) =>
  new Request('http://localhost/api/admin/shipping/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids, format: 'ZPL' }),
  }) as unknown as never;

const mockSupabase = (orders: OrdersFetch) => {
  // narrow de la unión fuera de la closure (tsc no estrecha el capture).
  const throwIt = !('data' in orders);
  const ordersData: OrderRow[] | null = 'data' in orders ? orders.data : null;
  return vi.doMock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: 'u-editor' } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table === 'entitlements') {
          const eq = vi.fn(async () => ({ data: [{ role: 'editor' }], error: null }));
          return { select: vi.fn().mockReturnValue({ eq }) };
        }
        if (table === 'orders') {
          const inFn = vi.fn(async () => {
            if (throwIt) throw new Error('db exploded');
            return { data: ordersData, error: null };
          });
          return { select: vi.fn().mockReturnValue({ in: inFn }) };
        }
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn(async () => ({ data: [], error: null })) }),
        };
      }),
      rpc: vi.fn(async () => ({ data: false })),
    })),
  }));
};

type SseEvent = { event: string; data: Record<string, unknown> | null };

const readSse = async (res: Response): Promise<SseEvent[]> => {
  const text = await res.text();
  const events: SseEvent[] = [];
  for (const block of text.split('\n\n')) {
    const evm = /^event: (.*)$/m.exec(block);
    const dm = /^data: (.*)$/m.exec(block);
    if (evm) {
      const evName = evm[1] as string;
      const raw = dm?.[1];
      events.push({
        event: evName,
        data: raw ? (JSON.parse(raw) as Record<string, unknown>) : null,
      });
    }
  }
  return events;
};

describe('T-P11 shipping batch: cero fabricación de orders (fail-closed)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('el route ya no contiene CP sintéticos ni fabrica orders', () => {
    const c = read('src/app/api/admin/shipping/batch/route.ts');
    expect(c).not.toMatch(/['"]1425['"]|['"]1426['"]/);
    // Fail-closed explícito: falla de DB se reporta 5xx, nunca 200 con labels.
    expect(c).toMatch(/503/);
    expect(c).toMatch(/orders_fetch_failed/);
  });

  it('fetch de orders que explota → 503 fail-closed, sin stream ni labels', { timeout: 30000 }, async () => {
    mockSupabase({ throw: true });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A, ID_B]));
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(String(body.error)).toMatch(/orders_fetch_failed/);
  });

  it('fetch que devuelve data:null → 503, no fabrica orders', { timeout: 30000 }, async () => {
    mockSupabase({ data: null });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A]));
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(String(body.error)).toMatch(/orders_fetch_failed/);
  });

  it('ids inexistentes en DB → 404 no_valid_orders con missing, sin labels', { timeout: 30000 }, async () => {
    mockSupabase({ data: [] });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A, ID_B]));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error?: string; missing?: string[] };
    expect(String(body.error)).toMatch(/no_valid_orders/);
    expect(body.missing).toEqual([ID_A, ID_B]);
  });

  it('parcial: labels solo para orders reales, ids faltantes reportados en done.missing', { timeout: 30000 }, async () => {
    mockSupabase({ data: [{ id: ID_A, postal_code: CP_A }] });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A, ID_B]));
    expect(res.status).toBe(200);
    const events = await readSse(res);
    const done = events.find((e) => e.event === 'done')?.data as {
      groups?: string[];
      total?: number;
      missing?: string[];
      skipped?: string[];
      urls?: string[];
    };
    expect(done?.groups).toEqual([CP_A]);
    expect(done?.total).toBe(1);
    expect(done?.missing).toEqual([ID_B]);
    // El id inexistente no aparece en ninguna etiqueta generada (urls/grupos),
    // solo en el reporte de missing del evento done.
    expect(done?.urls?.join(' ')).not.toContain(ID_B);
    expect(done?.groups?.join(' ')).not.toContain(ID_B);
  });

  it('order sin postal_code → skipped, jamás CP inventado', { timeout: 30000 }, async () => {
    mockSupabase({
      data: [
        { id: ID_A, postal_code: null, shipping_address: null },
        { id: ID_B, postal_code: CP_B },
      ],
    });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A, ID_B]));
    expect(res.status).toBe(200);
    const events = await readSse(res);
    const done = events.find((e) => e.event === 'done')?.data as {
      groups?: string[];
      skipped?: string[];
    };
    expect(done?.skipped).toEqual([ID_A]);
    expect(done?.groups).toEqual([CP_B]);
    // Ningún CP sintético del hallazgo aparece en el stream.
    const raw = JSON.stringify(events);
    expect(raw).not.toMatch(/['"]1425['"]|['"]1426['"]/);
  });

  it('happy path: orders reales con CP → 200 SSE con labels para todos', { timeout: 30000 }, async () => {
    mockSupabase({
      data: [
        { id: ID_A, postal_code: CP_A },
        { id: ID_B, shipping_address: { postal_code: '1888' } },
      ],
    });
    const { POST } = await import('@/app/api/admin/shipping/batch/route');
    const res = await POST(editorReq([ID_A, ID_B]));
    expect(res.status).toBe(200);
    const events = await readSse(res);
    const done = events.find((e) => e.event === 'done')?.data as {
      groups?: string[];
      total?: number;
      urls?: string[];
    };
    expect(done?.total).toBe(2);
    expect(done?.groups).toEqual([CP_A, '1888']);
    expect(done?.urls?.length).toBeGreaterThan(0);
  });
});
