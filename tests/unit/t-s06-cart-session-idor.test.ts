import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const read = (p2: string) => fs.readFileSync(path.join(ROOT, p2), 'utf8');

// T-S06 (auditoría 34-auditor, S-06 MEDIUM, CWE-639 / OWASP A01): addToCart
// aceptaba un `sessionId` client-supplied usado verbatim como owner del
// carrito anónimo (p_session_id) — cualquier caller podía escribir en el
// carrito de otro (IDOR). Contrato nuevo: la identidad anónima NUNCA viene
// del argumento de la Server Action; se resuelve server-side desde una
// cookie httpOnly propia, y quien no tiene cookie la recibe creada por el
// server. p_user_id se pasa SIEMPRE (user?.id ?? null), nunca inferida.

describe('T-S06 cart session identity: server-side only, never client-supplied', () => {
  it('addToCart signature does not accept a sessionId parameter', () => {
    const c = read('src/lib/actions/cart.ts');
    // La firma exportada ya no declara sessionId — no hay superficie IDOR.
    expect(c).toMatch(
      /export async function addToCart\(\s*variantId:\s*string,\s*quantity:\s*number\s*\)/
    );
  });

  it('cart.ts resolves the anonymous session via the cookie helpers, not from arguments', () => {
    const c = read('src/lib/actions/cart.ts');
    // Delega la identidad anónima a los helpers de cookie de lib/cart/session.
    expect(c).toMatch(/from '@\/lib\/cart\/session'/);
    expect(c).toMatch(/getOrCreateCartSessionId|readCartSessionId/);
    // La superficie IDOR está cerrada: ninguna referencia a un sessionId
    // derivado de argumento/cliente en la acción de escritura.
    expect(c).not.toMatch(/\bsessionId\b/);
  });

  it('cart.ts never passes a body/argument-derived session id to the RPC', () => {
    const c = read('src/lib/actions/cart.ts');
    // p_session_id se llena SOLO desde la cookie; no existe variable
    // sessionId derivada de argumento en el archivo.
    expect(c).not.toMatch(/p_session_id:\s*sessionId/);
    expect(c).toMatch(/p_session_id:\s*cartSessionId/);
  });

  it('p_user_id is always passed to the RPC (never omitted, null when anonymous)', () => {
    const c = read('src/lib/actions/cart.ts');
    // El owner se resuelve ANTES y se pasa SIEMPRE al RPC, con fallback
    // null explícito para anónimos — nunca se omite el parámetro.
    // En mergeCart (auth required) usar user.id directo es correcto.
    expect(c).toMatch(/const owner = user\?\.id \?\? null/);
    expect(c).toMatch(/p_user_id:\s*owner/);
    const addToCartBody = c.split('export async function mergeCart')[0];
    expect(addToCartBody).not.toMatch(/p_user_id:\s*user\.id/);
  });

  it('cart session cookie helpers live in lib (no inline crypto in the action)', () => {
    const h = read('src/lib/cart/session.ts');
    expect(h).toMatch(/CART_SESSION_COOKIE/);
    expect(h).toMatch(/crypto\.randomUUID\(\)/);
    expect(h).toMatch(/httpOnly:\s*true/);
    expect(h).toMatch(/sameSite:\s*'lax'/);
    // httpOnly true + not server-readable are contradictory; the option
    // block must not disable JS access.
    expect(h).not.toMatch(/httpOnly:\s*false/);
  });

  it('cookie options: path /, secure in production, 180d maxAge (anon cart horizon)', () => {
    const h = read('src/lib/cart/session.ts');
    expect(h).toMatch(/path:\s*'/);
    expect(h).toMatch(/secure:\s*process\.env\.NODE_ENV\s*===\s*'production'/);
    expect(h).toMatch(/maxAge/);
  });

  it('mergeCart also resolves sessionId server-side (no client-supplied param)', () => {
    const c = read('src/lib/actions/cart.ts');
    // mergeCart firma sin sessionId
    expect(c).toMatch(/export async function mergeCart\(\s*\)/);
    expect(c).not.toMatch(/mergeCart\(sessionId/);
  });

  it('smoke: module still exports the three cart actions', async () => {
    const mod = await import('@/lib/actions/cart');
    expect(typeof mod.addToCart).toBe('function');
    expect(typeof mod.mergeCart).toBe('function');
    expect(typeof mod.getCart).toBe('function');
  });
});
