import { cookies } from 'next/headers';

// S-06 (CWE-639 / OWASP A01): anonymous cart/wishlist owners MUST be bound
// server-side. The client can never supply which cart it owns; instead the
// server issues a random id in an httpOnly cookie the browser cannot read or
// forge, and reuses it on subsequent requests. This prevents a caller from
// claiming / churning an arbitrary anonymous cart by passing any session_id.
const ANON_SESSION_COOKIE = 'trino_anon_session';
const MAX_AGE = 60 * 60 * 24 * 31; // 31 days, sliding enough for a browse session

export async function getOrCreateAnonSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(ANON_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(ANON_SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return id;
}