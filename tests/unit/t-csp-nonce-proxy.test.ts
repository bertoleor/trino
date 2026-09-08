import { NONCE_HEADER, buildCspWithNonce, isStaticCspRoute, nonceProp } from '@/lib/security/csp';
import { describe, expect, it } from 'vitest';
import type { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const proxySource = () => fs.readFileSync(path.join(ROOT, 'src/proxy.ts'), 'utf8');
const cspSource = () => fs.readFileSync(path.join(ROOT, 'src/lib/security/csp.ts'), 'utf8');

describe('T-CSP-Nonce proxy: per-request nonce + request stamp (slice 1)', () => {
  it('generates a per-request nonce with crypto.randomUUID', () => {
    expect(`${proxySource()}${cspSource()}`).toMatch(/crypto\.randomUUID\(\)/);
  });

  it('stamps the nonce on request headers via NextResponse.next({ request: { headers } })', () => {
    expect(cspSource()).toMatch(/NextResponse\.next\(\{\s*request:\s*\{\s*headers/);
    expect(cspSource()).toMatch(/x-nonce|NONCE_HEADER/);
    expect(proxySource()).toMatch(/nextWithNonce/);
    expect(proxySource()).toMatch(/nonceForRequest/);
  });

  it('owns the HTML Content-Security-Policy and injects script-src with the nonce', () => {
    expect(proxySource()).toMatch(/applyNonceCsp/);
    expect(cspSource()).toMatch(/Content-Security-Policy/);
    expect(cspSource()).toMatch(/script-src/);
    expect(cspSource()).toMatch(/nonce-/);
  });

  it('never leaks x-nonce into response headers', () => {
    for (const src of [proxySource(), cspSource()]) {
      expect(src).not.toMatch(/response\.headers\.set\(\s*["'`]x-nonce/);
      expect(src).not.toMatch(/\.headers\.set\(\s*["'`]x-nonce/);
    }
  });

  it('bypasses the nonce CSP for static public routes /tienda and /cultura', () => {
    expect(proxySource()).toMatch(/nonceForRequest/);
    expect(cspSource()).toMatch(/isStaticCspRoute/);
    expect(cspSource()).toMatch(/\/tienda/);
    expect(cspSource()).toMatch(/\/cultura/);
  });
});

describe('csp helpers: pure nonce builders (slice 1)', () => {
  it('exposes the request-only nonce header name', () => {
    expect(NONCE_HEADER).toBe('x-nonce');
  });

  it('builds a CSP embedding the given nonce in script-src', () => {
    const csp = buildCspWithNonce('abc123');
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
    expect(csp).toContain("default-src 'self'");
  });

  it('produces distinct CSPs for distinct nonces (no reuse)', () => {
    const first = buildCspWithNonce('nonce-one');
    const second = buildCspWithNonce('nonce-two');
    expect(first).not.toBe(second);
    expect(first).toContain('nonce-nonce-one');
    expect(second).toContain('nonce-nonce-two');
  });

  it('forbids strict-dynamic and unsafe-inline inside script-src', () => {
    const csp = buildCspWithNonce('xyz789');
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
    expect(scriptSrc.length).toBeGreaterThan(0);
    expect(scriptSrc).not.toMatch(/unsafe-inline/);
    expect(scriptSrc).not.toMatch(/strict-dynamic/);
  });

  it('classifies static public routes versus HTML routes', () => {
    expect(isStaticCspRoute('/tienda')).toBe(true);
    expect(isStaticCspRoute('/cultura/slug')).toBe(true);
    expect(isStaticCspRoute('/')).toBe(false);
    expect(isStaticCspRoute('/admin/easter')).toBe(false);
    expect(isStaticCspRoute('/tiendax')).toBe(false);
  });

  it('maps a missing request nonce to undefined for React props', () => {
    expect(nonceProp(null)).toBeUndefined();
    expect(nonceProp('abc')).toBe('abc');
  });
});

describe('T-CSP-Nonce slice B (S-4): CSP on HTML non-200, JSON exempt', () => {
  it('emits a single nonce CSP on HTML non-200 responses', async () => {
    const { applyNonceCsp } = await import('@/lib/security/csp');
    const res = {
      status: 404,
      headers: new Headers({ 'content-type': 'text/html' }),
    } as unknown as NextResponse;
    applyNonceCsp(res, 'nonce404');
    const values = [res.headers.get('Content-Security-Policy')];
    expect(values).toHaveLength(1);
    expect(values[0]).toContain('nonce-nonce404');
  });

  it('exempts JSON error responses (400/403/429) from CSP', async () => {
    const { applyNonceCsp } = await import('@/lib/security/csp');
    for (const status of [400, 403, 429]) {
      const res = {
        status,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as unknown as NextResponse;
      applyNonceCsp(res, 'json-nonce');
      expect(res.headers.get('Content-Security-Policy')).toBeNull();
    }
  });

  it('sets no CSP without a nonce, even on HTML 200', async () => {
    const { applyNonceCsp } = await import('@/lib/security/csp');
    const res = {
      status: 200,
      headers: new Headers({ 'content-type': 'text/html' }),
    } as unknown as NextResponse;
    applyNonceCsp(res, undefined);
    expect(res.headers.get('Content-Security-Policy')).toBeNull();
  });

  it('proxy carries zero anon-key audit references', () => {
    expect(proxySource()).not.toMatch(/apikey/);
    expect(proxySource()).not.toMatch(/rest\/v1\//);
  });
});
