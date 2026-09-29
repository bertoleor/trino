import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-S07 (auditoría 34-auditor, S-07 MEDIUM, CWE-639 / OWASP A01):
// mergeCart y mergeWishlist aceptaban un `sessionId` atacante-controlado y
// mergeaban los rows anónimos de CUALQUIER session al account del usuario
// autenticado (IDOR). Contrato nuevo: ninguna Server Action de cart/wishlist
// acepta sessionId — la identidad anónima la lee el server desde la cookie
// httpOnly trino_cart_sid (lib/cart/session) y merge* opera SOLO sobre la
// session del caller que hace login. Los componentes cliente ya no llevan
// sessionId prop.

describe('T-S07 merge identity: anonymous session comes from the caller cookie, never arguments', () => {
  it('mergeCart and mergeWishlist take no sessionId parameter', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    expect(cart).toMatch(/export async function mergeCart\(\s*\)/);
    expect(wl).toMatch(/export async function mergeWishlist\(\s*\)/);
    expect(cart).not.toMatch(/mergeCart\(sessionId/);
    expect(wl).not.toMatch(/mergeWishlist\(sessionId/);
  });

  it('merge results are bound to readCartSessionId() — never to a caller-supplied value', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    // Ambas mergean la session anónima de la cookie del caller.
    expect(cart).toMatch(/await readCartSessionId\(\)/);
    expect(wl).toMatch(/await readCartSessionId\(\)/);
    // Y el RPC / queries reciben SOLO esa variable, nunca un sessionId crudo.
    expect(cart).toMatch(/p_session_id:\s*cartSessionId/);
    expect(wl).toMatch(/\.eq\('session_id',\s*sessionId\)/);
    expect(wl).not.toMatch(/mergeWishlist\(sessionId:\s*string\)/);
  });

  it('no cart/wishlist Server Action declares a sessionId parameter anywhere', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    for (const src of [cart, wl]) {
      // No signature takes sessionId — cerrado el vector completo (write+merge+read).
      expect(src).not.toMatch(/function \w+\([^)]*\bsessionId\b/);
    }
  });

  it('client components no longer carry a sessionId prop (no client-chosen identity)', () => {
    const heart = read('src/components/shared/wishlist-heart.tsx');
    const button = read('src/components/shared/wishlist-button.tsx');
    for (const src of [heart, button]) {
      expect(src).not.toMatch(/\bsessionId\b/);
      expect(src).toMatch(/toggleWishlist\(productId\)/);
    }
  });

  it('wishlist anonymous identity reuses the cart httpOnly cookie helper', () => {
    const wl = read('src/lib/actions/wishlist.ts');
    expect(wl).toMatch(/from '@\/lib\/cart\/session'/);
    expect(wl).toMatch(/getOrCreateCartSessionId|readCartSessionId/);
  });

  it('smoke: cart and wishlist modules still export their actions', async () => {
    const cart = (await import('@/lib/actions/cart')) as Record<string, unknown>;
    const wl = (await import('@/lib/actions/wishlist')) as Record<string, unknown>;
    for (const mod of [cart, wl]) {
      for (const k of Object.keys(mod)) expect(typeof mod[k]).toBe('function');
    }
    expect(typeof cart.mergeCart).toBe('function');
    expect(typeof wl.mergeWishlist).toBe('function');
    expect(typeof wl.toggleWishlist).toBe('function');
  });
});
