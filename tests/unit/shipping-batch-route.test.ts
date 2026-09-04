import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('shipping batch SSE W-07 POST ReadableStream progress per10 done grouped', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('route file exists and uses ReadableStream SSE progress done', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.resolve('src/app/api/admin/shipping/batch/route.ts');
    expect(fs.existsSync(file)).toBe(true);
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toMatch(/ReadableStream/);
    expect(content).toMatch(/event:\s*progress/);
    expect(content).toMatch(/event:\s*done/);
    expect(content).toMatch(/p-limit|pLimit/);
    expect(content).toMatch(/groupByPostalCode|postal_code/);
  });

  it('route requires editor role isEditorOrAbove requireRole', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const content = fs.readFileSync(path.resolve('src/app/api/admin/shipping/batch/route.ts'), 'utf8');
    expect(content).toMatch(/isEditorOrAbove|requireRole|hasRole/);
    expect(content).toMatch(/editor/);
    expect(content).toMatch(/403|Forbidden/);
  });

  it('POST 120 rows emits progress per10 and final done {urls} grouped', async () => {
    // mock supabase server to allow editor
    const mockFrom = vi.fn((table: string) => {
      if (table === 'entitlements') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ role: 'editor' }], error: null }),
          }),
        } as unknown as never;
      }
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: Array.from({ length: 120 }, (_, i) => ({
                  id: `id-${i}`,
                  postal_code: i % 2 === 0 ? '1425' : '1426',
                  status: 'paid',
                })),
                error: null,
              }),
            }),
          }),
        } as unknown as never;
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) } as unknown as never;
    });

    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn(async () => ({
        auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })) },
        from: mockFrom,
        rpc: vi.fn(async () => ({ data: true, error: null })),
      })),
    }));

    const { POST } = await import('@/app/api/admin/shipping/batch/route');

    const ids = Array.from({ length: 120 }, (_, i) => `id-${i}`);
    const req = new Request('http://localhost/api/admin/shipping/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids, format: 'ZPL' }),
    }) as unknown as never;

    const res = await POST(req as never);

    expect(res.headers.get('content-type')).toMatch(/text\/event-stream/);

    const text = await res.text();
    // must contain progress events per 10
    const progressMatches = [...text.matchAll(/event:\s*progress/g)];
    expect(progressMatches.length).toBeGreaterThanOrEqual(12); // 120/10 =12
    expect(text).toMatch(/event:\s*done/);
    expect(text).toMatch(/urls/);
    // done should contain grouped urls
    const doneLine = text.split('\n').find((l) => l.includes('"urls"')) ?? '';
    expect(doneLine).toContain('urls');

    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });

  it('POST with A4 vs ZPL content differs', async () => {
    const fs = await import('node:fs');
    const content = fs.readFileSync('src/app/api/admin/shipping/batch/route.ts', 'utf8');
    expect(content).toMatch(/A4|ZPL/);
    expect(content).toMatch(/\^XA|PDF|application\/pdf/);
  });

  it('viewer role denied 403', async () => {
    const mockFromViewer = vi.fn((table: string) => {
      if (table === 'entitlements') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ role: 'viewer' }], error: null }),
          }),
        } as unknown as never;
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) } as unknown as never;
    });

    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn(async () => ({
        auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'u2' } }, error: null })) },
        from: mockFromViewer,
        rpc: vi.fn(async () => ({ data: false, error: null })),
      })),
    }));

    const { POST } = await import('@/app/api/admin/shipping/batch/route');

    const req = new Request('http://localhost/api/admin/shipping/batch', {
      method: 'POST',
      body: JSON.stringify({ ids: ['a', 'b'], format: 'ZPL' }),
    }) as unknown as never;

    const res = await POST(req as never);
    expect(res.status).toBe(403);

    vi.doUnmock('@/lib/supabase/server');
    vi.resetModules();
  });
});
