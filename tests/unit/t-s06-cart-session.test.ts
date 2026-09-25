import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// S-06 (CWE-639 / OWASP A01): addToCart must NOT accept a client-supplied
// sessionId as the anonymous cart owner. The anonymous session must be bound
// server-side (httpOnly cookie) so a malicious caller cannot claim/churn an
// arbitrary cartridge by supplying any session_id. Static regression test:
// fails against the pre-fix code (cart.ts:6-24 accepted `sessionId`).
const ROOT = path.resolve(__dirname, '../..');
const CART = path.join(ROOT, 'src/lib/actions/cart.ts');
const SESSION_HELPER = path.join(ROOT, 'src/lib/session/anon.ts');

function read(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

describe('T-S06 cart anonymous-session binding (no client-supplied owner)', () => {
  it('addToCart signature no longer takes a sessionId parameter', () => {
    const c = read(CART);
    // Pre-fix: `export async function addToCart(variantId, quantity, sessionId?)`
    expect(c).not.toMatch(/addToCart\s*\([^)]*sessionId/);
    expect(c).toMatch(/addToCart/);
  });

  it('addToCart does not forward a body-derived session_id to the RPC', () => {
    const c = read(CART);
    expect(c).not.toMatch(/p_session_id:\s*sessionId/);
    expect(c).not.toMatch(/p_session_id:\s*[a-zA-Z]+\s*\?\?\s*null/);
  });

  it('anonymous owner comes from a server-side session helper, not the body', () => {
    const c = read(CART);
    expect(c).toMatch(/getOrCreateAnonSession|anonSession/i);
  });

  it('session helper exists and sets an httpOnly cookie', () => {
    expect(fs.existsSync(SESSION_HELPER)).toBe(true);
    const h = read(SESSION_HELPER);
    expect(h).toMatch(/httpOnly|httponly/i);
    expect(h).toMatch(/randomUUID|crypto\.random|randomBytes/i);
  });
});