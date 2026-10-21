import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-P04 (auditoría 34-auditor, P-04 HIGH, CWE-362/CWE-799):
// POST /api/checkout clavaba la idempotencia con check-then-insert y el
// resultado del INSERT en idempotency_keys nunca se verificaba: dos
// requests concurrentes con la misma Idempotency-Key pasaban ambos el
// SELECT, y el perdedor de la carrera (INSERT rechazado por la PK de
// idempotency_keys con 23505 — error ignorado) seguía igual y creaba la
// orden duplicada / doble procesamiento.
// Contrato nuevo: el INSERT es el claim atómico y su resultado DECIDE vía
// decideIdempotencyClaim — ganado procesa; perdido (key existente o 23505)
// responde replay idempotente 200 con la orden existente del usuario;
// error desconocido → fail-closed 500 (nunca se procesa sin claim ganado).
// Además: un 23505 en el INSERT de orders (deriva de constraints) responde
// replay idempotente en vez de 500+DLQ, y un INSERT de orden fallido por
// otra causa libera el claim para no envenenar la key de un retry legítimo.

describe('T-P04 checkout idempotency: atomic claim, no TOCTOU duplicate orders', () => {
  it('claim decision covers the full race state machine (won/lost/failed)', async () => {
    const { decideIdempotencyClaim } = await import('@/lib/checkout/idempotency');
    // replay fast-path: the key was already claimed by an earlier request
    expect(decideIdempotencyClaim(true, null)).toBe('lost');
    // winner: the atomic claim INSERT succeeded — this request owns the key
    expect(decideIdempotencyClaim(false, null)).toBe('won');
    // loser: the claim INSERT hit the PK unique violation — barrier held
    expect(decideIdempotencyClaim(false, { code: '23505' })).toBe('lost');
    // fail-closed: any other claim error must NEVER proceed to order work
    expect(decideIdempotencyClaim(false, { code: '08006' })).toBe('failed');
    expect(decideIdempotencyClaim(false, { code: null })).toBe('failed');
  });

  it('isUniqueViolation narrows Postgres 23505 only', async () => {
    const { isUniqueViolation } = await import('@/lib/checkout/idempotency');
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    expect(isUniqueViolation({ code: '23503' })).toBe(false);
    expect(isUniqueViolation(new Error('boom'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });

  it('route claims the key through the audited decision before any orders write', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/decideIdempotencyClaim\(/);
    const decideIdx = c.indexOf('decideIdempotencyClaim(');
    const ordersIdx = c.indexOf(".from('orders')");
    expect(decideIdx).toBeGreaterThan(-1);
    expect(ordersIdx).toBeGreaterThan(decideIdx);
  });

  it('claim insert result is checked — no fire-and-forget claim write', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(
      /const \{ error \} = await supabase\s*\.from\('idempotency_keys'\)\s*\.insert\(\{\s*key: idempotencyKey\s*\}\)/
    );
    expect(c).toMatch(/claimError/);
    const insertIdx = c.search(/from\('idempotency_keys'\)\s*\.insert/);
    const decideIdx = c.indexOf('decideIdempotencyClaim(');
    expect(decideIdx).toBeGreaterThan(insertIdx);
  });

  it('lost race responds idempotently: 200 already_processed with user-scoped order', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/claim === 'lost'/);
    const lostIdx = c.indexOf("claim === 'lost'");
    const processedIdx = c.indexOf("'already_processed'");
    expect(processedIdx).toBeGreaterThan(lostIdx);
    expect(c).toMatch(/\.eq\('idempotency_key', idempotencyKey\)/);
    expect(c).toMatch(/\.eq\('user_id', user\.id\)/);
  });

  it('unknown claim error fails closed (500) — never processes without a won claim', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/claim === 'failed'/);
    const failedIdx = c.indexOf("claim === 'failed'");
    const failIdx = c.indexOf("'idempotency claim failed'");
    expect(failIdx).toBeGreaterThan(failedIdx);
    // the fail-closed response is a 500
    expect(c).toMatch(/idempotency claim failed[\s\S]{0,220}status: 500/s);
  });

  it('orders insert unique violation replays idempotently instead of 500/DLQ', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/isUniqueViolation\(e\)/);
    const uvIdx = c.indexOf('isUniqueViolation(e)');
    const dlqIdx = c.indexOf('failed_webhooks_log');
    expect(dlqIdx).toBeGreaterThan(uvIdx);
    // both the claim-lost replay and the orders-23505 replay are idempotent
    const processedCount = (c.match(/'already_processed'/g) ?? []).length;
    expect(processedCount).toBeGreaterThanOrEqual(2);
  });

  it('failed order insert releases the claim so the same key can retry', () => {
    const c = read('src/app/api/checkout/route.ts');
    const releaseIdx = c.search(/from\('idempotency_keys'\)[\s\S]{0,140}\.delete\(\)/);
    expect(releaseIdx).toBeGreaterThan(-1);
    const uvIdx = c.indexOf('isUniqueViolation(e)');
    // release only after the unique-violation branch: a dup must NOT free the key
    expect(releaseIdx).toBeGreaterThan(uvIdx);
  });

  it('guard order preserved: rate-limit → auth → cap → zod → idempotency claim → orders', () => {
    const c = read('src/app/api/checkout/route.ts');
    const rlIdx = c.indexOf('checkRateLimit');
    const authIdx = c.indexOf('auth.getUser()');
    const parseIdx = c.indexOf('checkoutRequestSchema.safeParse');
    const idemIdx = c.search(/idempotency_keys/);
    const ordersIdx = c.indexOf(".from('orders')");
    expect(rlIdx).toBeGreaterThan(-1);
    expect(authIdx).toBeGreaterThan(rlIdx);
    expect(parseIdx).toBeGreaterThan(authIdx);
    expect(idemIdx).toBeGreaterThan(parseIdx);
    expect(ordersIdx).toBeGreaterThan(idemIdx);
  });

  it('smoke: idempotency lib exports and route POST still export', async () => {
    const mod = await import('@/lib/checkout/idempotency');
    expect(typeof mod.decideIdempotencyClaim).toBe('function');
    expect(typeof mod.isUniqueViolation).toBe('function');
    const route = (await import('@/app/api/checkout/route')) as unknown as { POST: unknown };
    expect(typeof route.POST).toBe('function');
  }, 20000);

  it('file hygiene: idempotency lib and route exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/checkout/idempotency.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/app/api/checkout/route.ts'))).toBe(true);
  });
});
