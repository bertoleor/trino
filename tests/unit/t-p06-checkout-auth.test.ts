import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const ROUTE = path.join(ROOT, 'src/app/api/checkout/route.ts');
const SCHEMA = path.join(ROOT, 'src/lib/validations/checkout.ts');
const RATE = path.join(ROOT, 'src/lib/rate-limit.ts');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-P06 (auditoría 34-auditor, P-06 MEDIUM, CWE-284/CWE-20 / OWASP A01):
// POST /api/checkout era público, sin rate-limit de escritura, con status
// derivado de payment_provider client-controlled ('bank' ->
// 'pending_verification'), storage_path/email sin validar y sin user_id en
// Contrato nuevo: rate-limit tier propio primero (protege el backend de
// auth del spam anónimo), auth obligatoria antes de cualquier trabajo DB,
// body cap, zod validation, status derivado SOLO del provider del enum
// validado, user_id SIEMPRE en el insert (columna NOT NULL + RLS).

describe('T-P06 checkout auth: authenticated orders only, server-controlled status', () => {
  it('route requires a session before any work (401)', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/auth\.getUser\(\)/);
    expect(c).toMatch(/401/);
    expect(c).toMatch(/unauthorized/);
  });

  it('guard order: rate-limit → auth → zod → any DB write work', () => {
    const c = read('src/app/api/checkout/route.ts');
    const rlIdx = c.indexOf('checkRateLimit');
    const authIdx = c.indexOf('auth.getUser()');
    const parseIdx = c.indexOf('checkoutRequestSchema.safeParse');
    const idemIdx = c.search(/idempotency_keys/);
    const insertIdx = c.search(/\.from\('orders'\)/);
    expect(rlIdx).toBeGreaterThan(-1);
    expect(authIdx).toBeGreaterThan(rlIdx);
    expect(parseIdx).toBeGreaterThan(authIdx);
    expect(idemIdx).toBeGreaterThan(parseIdx);
    expect(insertIdx).toBeGreaterThan(idemIdx);
  });

  it('dedicated checkout rate-limit tier exists and is applied (5/60s)', async () => {
    const { rateLimitConfigs } = await import('@/lib/rate-limit');
    expect(rateLimitConfigs.checkout).toBeDefined();
    expect(rateLimitConfigs.checkout.requests).toBe(5);
    expect(rateLimitConfigs.checkout.window).toBe('60 s');
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/checkRateLimit\(`checkout:\$\{ip\}`,\s*'checkout'\)/);
    expect(c).toMatch(/429/);
  });

  it('rate limit fires before json parsing (guard order)', () => {
    const c = read('src/app/api/checkout/route.ts');
    const rlIdx = c.indexOf('checkRateLimit');
    const jsonIdx = c.indexOf('req.json()');
    expect(rlIdx).toBeGreaterThan(-1);
    expect(jsonIdx).toBeGreaterThan(rlIdx);
  });

  it('body size cap 32KB enforced (413) before parse', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/MAX_BODY_BYTES/);
    expect(c).toMatch(/413/);
    const capIdx = c.indexOf('content-length');
    const parseIdx = c.indexOf('req.json()');
    expect(capIdx).toBeGreaterThan(-1);
    expect(parseIdx).toBeGreaterThan(capIdx);
  });

  it('checkout zod schema exists and bounds every stored client field', () => {
    expect(fs.existsSync(SCHEMA)).toBe(true);
    const s = read('src/lib/validations/checkout.ts');
    expect(s).toMatch(
      /paymentProviderSchema.*enum\(\[(['"]mercadopago['"],\s*['"]bank['"]|['"]bank['"],\s*['"]mercadopago['"])/
    );
    expect(s).toMatch(/storage_path.*max\(MAX_STORAGE_PATH_LEN\)/);
    expect(s).toMatch(/MAX_STORAGE_PATH_LEN\s*=\s*512/);
    expect(s).toMatch(/email.*\.email\(\)/);
    expect(s).toMatch(/MAX_CHECKOUT_ITEMS\s*=\s*25/);
    expect(s).toMatch(/product_id.*uuid\(\)/);
    expect(s).toMatch(/qty.*min\(1\).*max\(99\)/);
  });

  it('invalid payload is rejected 422 by zod before price recompute', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/checkoutRequestSchema\.safeParse/);
    expect(c).toMatch(/422/);
    const parseIdx = c.indexOf('checkoutRequestSchema.safeParse');
    const recomputeIdx = c.indexOf('recomputeTotal(');
    expect(recomputeIdx).toBeGreaterThan(parseIdx);
  });

  it('status is derived ONLY from the validated provider (no raw body branch)', () => {
    const c = read('src/app/api/checkout/route.ts');
    // The status derivation must read the parsed provider, never body directly.
    expect(c).toMatch(/payment_provider:\s*parsed\.data\.payment_provider/);
    expect(c).not.toMatch(/body\.payment_provider/);
  });

  it('insert carries user_id always (RLS contract, NOT NULL column)', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/user_id:\s*user\.id/);
  });

  it('stored client fields come from parsed.data only', () => {
    const c = read('src/app/api/checkout/route.ts');
    expect(c).toMatch(/storage_path:\s*parsed\.data\.storage_path/);
    expect(c).toMatch(/idempotency_key: idempotencyKey \|\| null/);
    // email flows to the mailer from parsed data, not raw body
    const emailLine = c.match(/to:\s*[^,\n]+/);
    expect(emailLine).not.toBeNull();
    expect(String(emailLine)).toMatch(/parsed\.data\.email/);
  });

  it('smoke: POST handler exports', async () => {
    const mod = await import('@/app/api/checkout/route');
    expect(typeof (mod as unknown as { POST: unknown }).POST).toBe('function');
  }, 20000);

  it('file hygiene: route, schema and rate-limit files exist', () => {
    expect(fs.existsSync(ROUTE)).toBe(true);
    expect(fs.existsSync(RATE)).toBe(true);
  });
});
