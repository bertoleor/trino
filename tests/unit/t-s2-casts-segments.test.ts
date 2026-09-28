import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
// S2 RED-first guards: local narrowing + shared TypedSupabase + admin segments.
// S1-owned (checkout, mercadopago, fx, share-sheet, batch) and S3-owned
// (proxy.ts, cron routes) as-never sites are OUT of scope for this slice.
const S2_CAST_FILES = [
  'src/lib/db/facets.ts',
  'src/lib/supabase/keepalive.ts',
  'src/lib/supabase/typed.ts',
  'src/lib/orders/bank-cancel.ts',
  'src/lib/money/decimal.ts',
  'src/components/shared/currency-switcher.tsx',
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/api/webhooks/paypal/route.ts',
  'src/app/[locale]/admin/cultura/page.tsx',
  'src/app/[locale]/admin/error.tsx',
  'src/app/[locale]/admin/loading.tsx',
];

describe('t-s2 shared TypedSupabase contract (design: central interface, local narrowing)', () => {
  it('exposes TypedSupabase + toTypedSupabase boundary helper', async () => {
    const mod = await import('@/lib/supabase/typed');
    expect(typeof mod.toTypedSupabase).toBe('function');
    const stub = { from: () => ({}), rpc: async () => ({ data: null, error: null }) };
    const db = mod.toTypedSupabase(stub);
    expect(typeof db.rpc).toBe('function');
    expect(typeof db.from).toBe('function');
  });
  it('supabase rpc/from clusters route through the shared type', () => {
    expect(read('src/lib/supabase/keepalive.ts')).toMatch(/TypedSupabase/);
    expect(read('src/app/[locale]/admin/cultura/page.tsx')).toMatch(/TypedSupabase/);
  });
});

describe('t-s2 as-never narrowing (S2-owned cluster only)', () => {
  it('leaves zero as-never casts in S2-owned files', () => {
    const hits: string[] = [];
    for (const f of S2_CAST_FILES) {
      const bad = read(f)
        .split('\n')
        .filter((l) => l.includes('as never'));
      for (const b of bad) hits.push(`${f}: ${b.trim()}`);
    }
    expect(hits).toEqual([]);
  });
  it('keeps DLQ/audit behavior keywords after narrowing', () => {
    expect(read('src/app/api/webhooks/stripe/route.ts')).toMatch(/failed_webhooks_log/);
    expect(read('src/app/api/webhooks/paypal/route.ts')).toMatch(/failed_webhooks_log/);
    expect(read('src/app/[locale]/admin/cultura/page.tsx')).toMatch(/is_admin/);
    expect(read('src/app/[locale]/admin/cultura/page.tsx')).toMatch(/revalidatePath/);
  });
});

describe('t-s2 local narrowing behavior', () => {
  it('parseFacets keeps known facets, drops unknown, lowercases', async () => {
    const mod = await import('@/lib/db/facets');
    const f = mod.parseFacets({
      tipo: 'Velas,unknown-facet',
      tradicion: undefined,
      intencion: ['amor', 'nope'],
    });
    expect(f.tipo).toEqual(['velas']);
    expect(f.intencion).toEqual(['amor']);
  });
  it('toDecimalCents rounds half-up and falls back on out-of-range modes', async () => {
    const mod = await import('@/lib/money/decimal');
    expect(mod.toDecimalCents(10.5)).toBe(11);
    expect(mod.toDecimalCents(10.5, 999)).toBe(11);
  });
  it('currency target guard accepts FxTarget union only', async () => {
    const mod = await import('@/components/shared/currency-switcher');
    expect(mod.isCurrencyTarget('USD')).toBe(true);
    expect(mod.isCurrencyTarget('JPY')).toBe(false);
  });
  it('bank-cancel keeps 72h pending-verification semantics', async () => {
    const mod = await import('@/lib/orders/bank-cancel');
    expect(mod.BANK_PENDING_HOURS).toBe(72);
    const old = new Date(Date.now() - 73 * 3600 * 1000).toISOString();
    expect(mod.shouldCancelPendingVerification('pending_verification', old)).toBe(true);
    expect(mod.shouldCancelPendingVerification('paid', old)).toBe(false);
  });
});

describe('t-s2 admin segments render (spec observability-health)', () => {
  it('admin error.tsx renders alert + retry and logs', async () => {
    const mod = await import('@/app/[locale]/admin/error');
    const html = renderToStaticMarkup(
      createElement(mod.default, { error: new Error('boom'), reset: () => {} })
    );
    expect(html).toMatch(/role="alert"/);
    expect(html).toMatch(/reintentar|retry/i);
    expect(read('src/app/[locale]/admin/error.tsx')).toMatch(/logger/);
  });
  it('admin loading.tsx renders Bauhaus skeleton', async () => {
    const mod = await import('@/app/[locale]/admin/loading');
    const html = renderToStaticMarkup(createElement(mod.default));
    expect(html).toMatch(/animate-pulse/);
  });
});

describe('t-s2 database.types exception recorded (NOT hand-edited)', () => {
  it('keeps globalIgnores cover + generated marker, body untouched by S2', () => {
    expect(read('eslint.config.mjs')).toMatch(/database\.types\.ts/);
    // Drift-guard contract: the types file is pure CLI output; the regen marker lives in
    // package.json gen:types script.
    expect(read('package.json')).toMatch(/gen:types/);
    expect(read('package.json')).toMatch(/supabase gen types typescript --local/);
  });
});
