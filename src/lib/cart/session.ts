import { cookies } from 'next/headers';

// T-S06 (CWE-639 / OWASP A01): la identidad del carrito anónimo vive en una
// cookie httpOnly seteada por el server — jamás en un argumento client-supplied.
// Solo Server Actions / Route Handlers pueden crearla (cookies().set lanza en
// Server Components, que quedan read-only).
export const CART_SESSION_COOKIE = 'trino_cart_sid';

const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 180; // 180d — horizonte del carrito anónimo

/**
 * Devuelve la sesión anónima del caller desde la cookie httpOnly.
 * SIN cookie: genera una nueva, la persiste en la cookie store del
 * response y la devuelve — el caller nunca elige su session id.
 */
export async function getOrCreateCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing && existing.length > 0) return existing;

  const sid = crypto.randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: CART_SESSION_MAX_AGE,
  });
  return sid;
}

/**
 * Lee la sesión anónima SIN crearla (para paths read-only que no deben
 * mutar el response, p.ej. getCart desde un Server Component).
 * Devuelve null si el caller no tiene cookie — nunca inventa identidad.
 */
export async function readCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CART_SESSION_COOKIE)?.value;
  return value && value.length > 0 ? value : null;
}
