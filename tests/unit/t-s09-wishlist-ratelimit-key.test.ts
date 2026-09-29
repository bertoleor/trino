import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-S09 (auditoría 34-auditor, S-09 MEDIUM, CWE-799/CWE-770): el rate-limit
// anónimo de toggleWishlist se keyeaba por la cookie de sesión — el atacante
// dropea/rota trino_cart_sid por request y cada llamada mintea un bucket
// 60/m nuevo (elusión total). Contrato nuevo: la key del bucket NUNCA deriva
// de un valor client-controlable. Autenticado: user.id server-side. Anónimo:
// IP (x-forwarded-for, mismo trust model que proxy.ts y /api/shipping/rates).
// La cookie sigue siendo la identidad OWNER de los rows — solo deja de ser la
// key del rate limiter.

describe('T-S09 wishlist rate-limit key: never client-rotatable (IP for anon)', () => {
  it('the checkRateLimit key no longer interpolates user.id ?? sessionId', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    // El patrón vulnerable exacto del hallazgo (wishlist.ts:16-17).
    expect(wl).not.toMatch(/wishlist:\$\{user\?\.id\s*\?\?\s*sessionId/);
    expect(wl).not.toMatch(/wishlist:\$\{identifier\}/);
  });

  it('no sessionId variable reaches the rate-limit call site', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    const line = wl
      .split('\n')
      .find((l) => l.includes('await checkRateLimit'));
    expect(line).toBeDefined();
    // La key del bucket jamás contiene el sessionId (cookie rotable).
    expect(line).not.toContain('sessionId');
    expect(line).toMatch(/checkRateLimit\(`wishlist:\$\{rlId\}`,\s*'public'\)/);
  });

  it('anonymous bucket keys on x-forwarded-for (repo-wide anon trust model)', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    expect(wl).toMatch(/from 'next\/headers'/);
    expect(wl).toMatch(/get\('x-forwarded-for'\)/);
    // Branch anónimo: `ip:${ip}`; branch autenticado: `u:${user.id}`.
    expect(wl).toMatch(/`u:\$\{user\.id\}`/);
    expect(wl).toMatch(/`ip:\$\{ip\}`/);
  });

  it('session cookie remains the anonymous ROW owner, just not the RL key', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    // Owner identity de los rows sigue siendo la cookie httpOnly (S-06/S-07).
    expect(wl).toMatch(/getOrCreateCartSessionId/);
    expect(wl).toMatch(/\.eq\('session_id',\s*sessionId\)/);
    // ...pero el sessionId ya no alimenta ninguna key de rate limit.
    expect(wl).not.toMatch(/identifier\s*=\s*user\?\.\s*id\s*\?\?\s*sessionId/);
  });

  it('rate limit is checked BEFORE cookie creation (429 must not mint cookies)', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    const rlIdx = wl.indexOf('checkRateLimit(`wishlist:');
    const cookieIdx = wl.indexOf('getOrCreateCartSessionId()');
    expect(rlIdx).toBeGreaterThan(-1);
    expect(cookieIdx).toBeGreaterThan(rlIdx);
  });

  it('smoke: wishlist module still exports its actions', async () => {
    const mod = (await import('@/lib/actions/wishlist')) as Record<string, unknown>;
    for (const k of Object.keys(mod)) expect(typeof mod[k]).toBe('function');
    expect(typeof mod.toggleWishlist).toBe('function');
  });
});
