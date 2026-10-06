import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-S08 (auditoría 34-auditor, S-08 MEDIUM, CWE-639 / CWE-200): getCart y
// getWishlist anónimos devolvían los datos del `sessionId` client-supplied
// sin ownership check — cualquier caller leía el carrito/wishlist anónimo
// de otro (lectura IDOR). Contrato nuevo: el READ path anónimo resuelve la
// identidad SOLO desde la cookie httpOnly server-side (readCartSessionId);
// sin cookie = lista vacía legítima (first-time visitor), jamás un 401 ni
// datos ajenos. El read path es read-only: NO mints cookies (getOrCreate
// queda reservado a los Server Actions de escritura).

describe('T-S08 anonymous read identity: cookie server-side, never client-supplied sessionId', () => {
  it('getCart and getWishlist take no sessionId parameter (no IDOR surface)', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    expect(cart).toMatch(/export async function getCart\(\s*\)/);
    expect(wl).toMatch(/export async function getWishlist\(\s*\)/);
    expect(cart).not.toMatch(/getCart\(sessionId/);
    expect(wl).not.toMatch(/getWishlist\(sessionId/);
  });

  it('anonymous read is bound to the caller cookie, never a body value', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    // La session anónima del READ path sale de la cookie httpOnly...
    expect(cart).toMatch(/await readCartSessionId\(\)/);
    expect(wl).toMatch(/await readCartSessionId\(\)/);
    // ...y la query filtra por esa variable de cookie, nunca un valor crudo
    // del caller.
    expect(cart).toMatch(/\.eq\('session_id',\s*cartSessionId\)/);
    expect(wl).toMatch(/\.eq\('session_id',\s*sessionId\)/);
  });

  it('anonymous read NEVER mints a session cookie (read-only path)', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    // getCart/getWishlist no pueden llamar cookies().set: leer un carrito
    // no debe crear identidad.
    const cartGetCart = cart.split('export async function getCart')[1] ?? '';
    expect(cartGetCart).not.toMatch(/getOrCreateCartSessionId/);
    const wlGetWishlist = wl.split('export async function getWishlist')[1] ?? '';
    expect(wlGetWishlist).not.toMatch(/getOrCreateCartSessionId/);
  });

  it('no-cookie anonymous callers get an empty legit result, not a 401', () => {
    const cart = read('src/lib/actions/cart.ts');
    const wl = read('src/lib/actions/wishlist.ts');
    // First-time visitor sin cookie: vacío legítimo — sin session required.
    const cartGetCart = cart.split('export async function getCart')[1] ?? '';
    expect(cartGetCart).toMatch(/return \{ data: \[\], error: null \}/);
    const wlGetWishlist = wl.split('export async function getWishlist')[1] ?? '';
    expect(wlGetWishlist).toMatch(/return \{ data: \[\], error: null \}/);
    expect(cartGetCart).not.toMatch(/session required/);
    expect(wlGetWishlist).not.toMatch(/session required/);
  });

  it('smoke: read actions still exported as functions', async () => {
    const cart = (await import('@/lib/actions/cart')) as Record<string, unknown>;
    const wl = (await import('@/lib/actions/wishlist')) as Record<string, unknown>;
    expect(typeof cart.getCart).toBe('function');
    expect(typeof wl.getWishlist).toBe('function');
  });
});
