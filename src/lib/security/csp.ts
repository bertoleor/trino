import { type NextRequest, NextResponse } from 'next/server';

export const NONCE_HEADER = 'x-nonce';

const CSP_HEADER = 'Content-Security-Policy';

export function buildCspWithNonce(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function isStaticCspRoute(pathname: string): boolean {
  return pathname === '/tienda' || pathname.startsWith('/cultura');
}

export function nonceForRequest(pathname: string): string | undefined {
  if (isStaticCspRoute(pathname)) return undefined;
  return crypto.randomUUID().replace(/-/g, '');
}

export function stampNonceHeader(headers: Headers, nonce: string): Headers {
  const stamped = new Headers(headers);
  stamped.set(NONCE_HEADER, nonce);
  return stamped;
}

export function nextWithNonce(request: NextRequest, nonce: string | undefined): NextResponse {
  if (!nonce) return NextResponse.next({ request });
  return NextResponse.next({ request: { headers: stampNonceHeader(request.headers, nonce) } });
}

export function applyNonceCsp(response: NextResponse, nonce: string | undefined): void {
  if (!nonce) return;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return;
  if (response.headers.has(CSP_HEADER)) return;
  response.headers.set(CSP_HEADER, buildCspWithNonce(nonce));
}

export function nonceProp(value: string | null): string | undefined {
  return value ?? undefined;
}
