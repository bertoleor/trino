import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T4 RED-first guard: 10 `as never` narrowings via the TypedSupabase/isRecord
// boundary (zod cultura fixtures-first), 4 proxy fail-closed catches with
// logger.error (slice-B behavior preserved), split-or-justify contracts.
const NEVER_SCOPE = [
  'src/app/api/webhooks/mercadopago/route.ts',
  'src/app/api/checkout/route.ts',
  'src/components/shared/share-sheet.tsx',
  'src/proxy.ts',
  'src/lib/rate-limit.ts',
];

const CATCH_SITES = [
  { marker: 'has_role', log: 'proxy_has_role_failed', deny: 'return false' },
  { marker: 'security_logs', log: 'proxy_audit_security_logs_failed', deny: 'Forbidden' },
  { marker: 'audit_logs', log: 'proxy_audit_audit_logs_failed', deny: 'Forbidden' },
  {
    marker: 'entitlements',
    log: 'proxy_entitlements_fallback_failed',
    deny: 'return NextResponse.json',
  },
];

describe('t4 as-never narrowing via TypedSupabase/isRecord boundary', () => {
  it('zero as never remain in scope (10 sites narrowed)', () => {
    expect(NEVER_SCOPE.filter((f) => read(f).includes('as never'))).toEqual([]);
  });
  it('proxy narrows through the shared boundary (no inline casts)', () => {
    const c = read('src/proxy.ts');
    expect(c).toMatch(/toTypedSupabase/);
    expect(c).toMatch(/isRecord/);
    expect(read('src/lib/supabase/typed.ts')).toMatch(/toJson/);
  });
});

describe('t4 proxy fail-closed catches with logger (slice-B preserved)', () => {
  it('each of the 4 catches logs and keeps its deny path', () => {
    const c = read('src/proxy.ts');
    const bad: string[] = [];
    for (const s of CATCH_SITES) {
      const at = c.indexOf(s.marker);
      const li = at === -1 ? -1 : c.indexOf(s.log, at);
      const di = li === -1 ? -1 : c.indexOf(s.deny, li);
      if (at === -1 || li === -1 || di === -1 || !c.slice(at, li).includes('catch'))
        bad.push(s.marker);
    }
    expect(bad).toEqual([]);
  });
  it('no empty catch blocks and no secrets in logged proxy errors', () => {
    const c = read('src/proxy.ts');
    expect(c).not.toMatch(/catch\s*\{\s*\}/);
    const logged = c.split('\n').filter((l) => l.includes('logger.error'));
    expect(logged.length).toBeGreaterThanOrEqual(4);
    for (const l of logged) expect(l).not.toMatch(/SECRET|APIKEY|apikey|token/i);
  });
});

describe('t4 narrowing runtime (regression net)', () => {
  it('isShareEntity accepts the 5 entities, rejects the rest', async () => {
    const { isShareEntity } = await import('@/lib/share');
    for (const e of ['product', 'cultura', 'wishlist', 'review', 'cart'])
      expect(isShareEntity(e)).toBe(true);
    for (const e of ['admin', '', 'PRODUCT', 'product ']) expect(isShareEntity(e)).toBe(false);
    expect(isShareEntity(null)).toBe(false);
    expect(isShareEntity(undefined)).toBe(false);
  });
  it('toJson passes JSON-safe payloads through, coerces the rest', async () => {
    const { toJson } = await import('@/lib/supabase/typed');
    expect(toJson({ id: 'a', data: { id: 'b' }, type: 'payment' })).toEqual({
      id: 'a',
      data: { id: 'b' },
      type: 'payment',
    });
    expect(toJson({})).toEqual({});
    expect(toJson([1, 'a', null])).toEqual([1, 'a', null]);
    expect(toJson('x')).toBe('x');
    expect(toJson(undefined)).toBe(null);
  });
  it('toTypedSupabase boundary throws on primitives, passes clients through', async () => {
    const { isRecord, toTypedSupabase } = await import('@/lib/supabase/typed');
    expect(isRecord({})).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(() => toTypedSupabase(null)).toThrow();
    const rpc = async () => ({ data: true, error: null });
    await expect(toTypedSupabase({ rpc }).rpc('has_role', {})).resolves.toEqual({
      data: true,
      error: null,
    });
  });
  it('existing cultura payloads still validate (fixtures-first)', async () => {
    const { culturaSchema } = await import('@/lib/validations/cultura');
    const ok = culturaSchema.safeParse({
      slug: 'mi-post',
      title: 'Titulo valido',
      excerpt: 'excerpt',
      body: {},
      locale: 'es-AR',
      status: 'draft',
      tags: ['tag1'],
      related_product_ids: [],
    });
    expect(ok.success).toBe(true);
    const bad = culturaSchema.safeParse({
      slug: 'ab',
      title: 't',
      locale: 'es-AR',
      status: 'draft',
    });
    expect(bad.success).toBe(false);
  });
});

describe('t4 split-or-justify contracts', () => {
  it('oversized files carry T4 tickets, generated file cites regen', () => {
    expect(read('src/app/api/admin/shipping/batch/route.ts')).toMatch(/COMP-18/);
    expect(read('tests/unit/t-c04-proxy.test.ts')).toMatch(/COMP-19/);
    expect(read('src/types/database.types.ts').slice(0, 800)).toMatch(/gen:types/);
  });
});
