import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-P07 (auditoría 34-auditor, P-07 MEDIUM, CWE-840/CWE-20 / OWASP A04):
// recomputeTotal multiplicaba qty client-controlled sin validar (negativa,
// fraccional, 0, gigante) y un product_id desconocido caía a price_cents 0
// vía `?? 0` — el server recomputaba ese total manipulado, lo ALMACENABA en
// orders.total_cents y un atacante podía llevar la orden a 0 o negativo.
// Contrato nuevo: recomputeTotal devuelve un result { ok } y es fail-closed:
//  - line_items solo array no-vacío, ≤ MAX_CHECKOUT_LINE_ITEMS (25, mismo
//    bound que el zod schema de P-06 — defensa en profundidad);
//  - qty entero 1..MAX_QTY_PER_LINE (99);
//  - product_id string no-vacío y PRESENTE en la tabla products: sin precio
//    utilizable (fila faltante o price_cents no number finito ≥ 0) el
//    recompute falla cerrado, nunca suma 0;
//  - la ruta guarda sobre el result ANTES de comparar con el total del
//    cliente y antes de cualquier escritura, y persiste recomputed.total.

describe('T-P07 price integrity: server-side qty/product validation, no free orders', () => {
  it('accepts a well-formed cart and echoes the bounded items', async () => {
    const { validateLineItems } = await import('@/lib/checkout/price-integrity');
    const res = validateLineItems([
      { product_id: 'prod-a', qty: 2 },
      { product_id: 'prod-b', qty: 99 },
    ]);
    expect(res).toEqual({
      ok: true,
      items: [
        { product_id: 'prod-a', qty: 2 },
        { product_id: 'prod-b', qty: 99 },
      ],
    });
  });

  it('rejects non-array, empty array and over-cap carts', async () => {
    const { validateLineItems, MAX_CHECKOUT_LINE_ITEMS } = await import(
      '@/lib/checkout/price-integrity'
    );
    expect(validateLineItems(null)).toEqual({ ok: false, error: 'invalid_line_items' });
    expect(validateLineItems('x')).toEqual({ ok: false, error: 'invalid_line_items' });
    expect(validateLineItems({ 0: 'not-an-array' })).toEqual({ ok: false, error: 'invalid_line_items' });
    expect(validateLineItems([])).toEqual({ ok: false, error: 'invalid_line_items' });
    const over = Array.from({ length: MAX_CHECKOUT_LINE_ITEMS + 1 }, (_, i) => ({
      product_id: `p${i}`,
      qty: 1,
    }));
    expect(validateLineItems(over)).toEqual({ ok: false, error: 'too_many_line_items' });
  });

  it('P-07 core: qty 0 / negative / fractional / over-bound never reaches the total', async () => {
    const { validateLineItems, MAX_QTY_PER_LINE } = await import(
      '@/lib/checkout/price-integrity'
    );
    for (const qty of [0, -1, -100, 0.5, 1.5, 99.0001, NaN, Infinity, '2', null, undefined]) {
      expect(validateLineItems([{ product_id: 'prod-a', qty }])).toEqual({
        ok: false,
        error: 'invalid_qty',
      });
    }
    expect(validateLineItems([{ product_id: 'prod-a', qty: MAX_QTY_PER_LINE + 1 }])).toEqual({
      ok: false,
      error: 'invalid_qty',
    });
  });

  it('rejects missing, empty, non-string product_id and non-object entries', async () => {
    const { validateLineItems } = await import('@/lib/checkout/price-integrity');
    expect(validateLineItems([{ qty: 1 }])).toEqual({ ok: false, error: 'invalid_product_id' });
    expect(validateLineItems([{ product_id: '', qty: 1 }])).toEqual({
      ok: false,
      error: 'invalid_product_id',
    });
    expect(validateLineItems([{ product_id: 123, qty: 1 }])).toEqual({
      ok: false,
      error: 'invalid_product_id',
    });
    expect(validateLineItems([null])).toEqual({ ok: false, error: 'invalid_line_item' });
    expect(validateLineItems(['prod-a'])).toEqual({ ok: false, error: 'invalid_line_item' });
  });

  it('recomputes a real total from fetched prices only', async () => {
    const { recomputeTotal } = await import('@/lib/checkout/price-integrity');
    const prices: Record<string, number> = { 'prod-a': 500, 'prod-b': 1234 };
    const res = await recomputeTotal(
      [
        { product_id: 'prod-a', qty: 2 },
        { product_id: 'prod-b', qty: 1 },
      ],
      async (id) => ({ price_cents: prices[id] })
    );
    expect(res).toEqual({ ok: true, total: 500 * 2 + 1234 });
  });

  it('P-07 core: unknown product_id fails closed — no more `?? 0` free items', async () => {
    const { recomputeTotal } = await import('@/lib/checkout/price-integrity');
    const res = await recomputeTotal([{ product_id: 'ghost', qty: 1 }], async () => null);
    expect(res).toEqual({ ok: false, code: 400, error: 'unknown_product' });
  });

  it('P-07 core: negative qty can no longer drive the total to <= 0', async () => {
    const { recomputeTotal } = await import('@/lib/checkout/price-integrity');
    const res = await recomputeTotal([{ product_id: 'prod-a', qty: -3 }], async () => ({
      price_cents: 999,
    }));
    expect(res).toEqual({ ok: false, code: 400, error: 'invalid_qty' });
  });

  it('P-07 core: a price row without a usable finite price fails closed', async () => {
    const { recomputeTotal } = await import('@/lib/checkout/price-integrity');
    const missing = await recomputeTotal([{ product_id: 'p', qty: 1 }], async () => ({
      price_cents: undefined,
    }));
    expect(missing).toEqual({ ok: false, code: 400, error: 'unknown_product' });
    const negative = await recomputeTotal([{ product_id: 'p', qty: 1 }], async () => ({
      price_cents: -10,
    }));
    expect(negative).toEqual({ ok: false, code: 400, error: 'unknown_product' });
  });

  it('bounds match the P-06 checkout zod contract (defense in depth)', async () => {
    const { MAX_CHECKOUT_LINE_ITEMS, MAX_QTY_PER_LINE } = await import(
      '@/lib/checkout/price-integrity'
    );
    expect(MAX_CHECKOUT_LINE_ITEMS).toBe(25);
    expect(MAX_QTY_PER_LINE).toBe(99);
  });

  it('route guards on the recompute result BEFORE the client-total comparison', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/const recomputed = await recomputeTotal\(/);
    const resIdx = c.indexOf('const recomputed = await recomputeTotal(');
    const guardIdx = c.indexOf('if (!recomputed.ok)');
    const checkIdx = c.indexOf('checkPriceIntegrity(');
    expect(guardIdx).toBeGreaterThan(resIdx);
    expect(checkIdx).toBeGreaterThan(guardIdx);
    // fail-closed response carries the recompute error + code
    expect(c).toMatch(/recomputed\.error/);
    expect(c).toMatch(/recomputed\.code/);
  });

  it('route stores recomputed.total — never an unvalidated client total', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/total_cents:\s*recomputed\.total/);
    expect(c).toMatch(/totalCents:\s*recomputed\.total/);
    expect(c).not.toMatch(/total_cents:\s*dbTotal/);
  });

  it('lib no longer defaults unknown prices to 0 (the `?? 0` is gone)', () => {
    const c = read('src/lib/checkout/price-integrity.ts');
    expect(c).not.toMatch(/\?\?\s*0/);
  });

  it('smoke: lib and route exports still load', async () => {
    const mod = await import('@/lib/checkout/price-integrity');
    expect(typeof mod.recomputeTotal).toBe('function');
    expect(typeof mod.checkPriceIntegrity).toBe('function');
    const route = (await import('@/app/api/checkout/route')) as unknown as { POST: unknown };
    expect(typeof route.POST).toBe('function');
  }, 20000);

  it('file hygiene: lib and route exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/checkout/price-integrity.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/app/api/checkout/route.ts'))).toBe(true);
  });
});
