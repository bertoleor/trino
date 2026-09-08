import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// T4 split-or-justify: 151 lines raw, within the 150 max-lines gate code-only
// (skipComments/skipBlankLines). Kept single-file: the slice-B contract asserts
// proxy + helper + audit route as one cohesive unit; a split would scatter the
// fail-closed matrix across files; ticket: repo-cleanup-final/COMP-19

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/proxy.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-C04 proxy cookie HttpOnly Secure SameSite Turnstile honeypot compose', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('sets HttpOnly Secure SameSite cookies via supabase SSR', () => {
    const c = read();
    expect(c).toMatch(/HttpOnly|httpOnly/i);
    expect(c).toMatch(/Secure|secure/i);
    expect(c).toMatch(/SameSite|samesite/i);
    expect(c).toMatch(/createServerClient|supabase/i);
  });
  it('verifies Turnstile and honeypot', () => {
    const c = read();
    expect(c).toMatch(/turnstile|honeypot/i);
    expect(c).toMatch(/verify|siteverify/i);
  });
  it('composes next-intl + rate-limit + supabase', () => {
    const c = read();
    expect(c).toMatch(/createIntlMiddleware|next-intl/i);
    expect(c).toMatch(/rate-limit|ratelimit|checkRateLimit/i);
    expect(c).toMatch(/updateSession|auth\.getUser/i);
  });
  it('exports proxy and config matcher', () => {
    const c = read();
    expect(c).toMatch(/export.*proxy|export async function proxy/);
    expect(c).toMatch(/matcher|config/i);
  });
});

describe('T-C04 slice B (S-1): Turnstile fail-closed verification', () => {
  it('forbids fail-open on missing secret', () => {
    const c = read();
    expect(c).not.toMatch(/if\s*\(\s*!secret\s*\)\s*return\s+true/);
  });

  it('verifyTurnstile denies when the secret is missing (fail-closed)', async () => {
    const prev = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    try {
      const { verifyTurnstile } = await import('@/lib/proxy/turnstile');
      await expect(verifyTurnstile('any-token')).resolves.toBe(false);
    } finally {
      if (prev !== undefined) process.env.TURNSTILE_SECRET_KEY = prev;
    }
  });

  it('verifyTurnstile denies on missing token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    try {
      const { verifyTurnstile } = await import('@/lib/proxy/turnstile');
      await expect(verifyTurnstile('')).resolves.toBe(false);
    } finally {
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it('verifyTurnstile denies on provider outage and success:false, passes on success:true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    const orig = globalThis.fetch;
    try {
      const { verifyTurnstile } = await import('@/lib/proxy/turnstile');
      globalThis.fetch = (async () => {
        throw new Error('provider down');
      }) as typeof fetch;
      await expect(verifyTurnstile('tok')).resolves.toBe(false);
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ success: false }), { status: 200 })) as typeof fetch;
      await expect(verifyTurnstile('tok')).resolves.toBe(false);
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 })) as typeof fetch;
      await expect(verifyTurnstile('tok')).resolves.toBe(true);
    } finally {
      globalThis.fetch = orig;
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });
});

describe('T-C04 slice B (S-2/S-3): auth tier + hardened audit path', () => {
  it('routes /login, /signup and /api/auth/* to the auth rate-limit tier', () => {
    const c = read();
    expect(c).toMatch(/\/login/);
    expect(c).toMatch(/\/signup/);
    expect(c).toMatch(/\/api\/auth/);
    expect(c).toMatch(/["']auth["']/);
  });

  it('sends denials through the hardened internal audit path', () => {
    const c = read();
    expect(c).toMatch(/enqueueSecurityAudit/);
    expect(c).toMatch(/turnstile_403/);
    expect(c).toMatch(/rate_limit_429/);
    const helper = fs.readFileSync(path.join(ROOT, 'src/lib/proxy/turnstile.ts'), 'utf8');
    expect(helper).toMatch(/\/api\/internal\/audit/);
    expect(helper).toMatch(/AUDIT_INGEST_SECRET/);
    expect(helper).not.toMatch(/apikey/);
  });

  it('contains zero anon-key REST audit inserts', () => {
    const c = read();
    expect(c).not.toMatch(/apikey/);
    expect(c).not.toMatch(/rest\/v1\/security_logs/);
  });

  it('audit route exists, is Node-only, and enforces the ingest secret with service-role insert', () => {
    const route = path.join(ROOT, 'src/app/api/internal/audit/route.ts');
    expect(fs.existsSync(route)).toBe(true);
    const c = fs.readFileSync(route, 'utf8');
    expect(c).toMatch(/AUDIT_INGEST_SECRET/);
    expect(c).toMatch(/SUPABASE_SERVICE_ROLE/);
    expect(c).toMatch(/runtime.*nodejs|nodejs.*runtime/);
    expect(c).not.toMatch(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    expect(c).not.toMatch(/apikey/);
  });

  it('audit route rejects unauthenticated ingest with 401 (fail-closed)', async () => {
    process.env.AUDIT_INGEST_SECRET = 'test-ingest-secret-0123456789';
    try {
      const { POST } = await import('@/app/api/internal/audit/route');
      const res = await POST(
        new Request('http://localhost/api/internal/audit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ event: 'turnstile_403' }),
        }) as never,
      );
      expect(res.status).toBe(401);
    } finally {
      delete process.env.AUDIT_INGEST_SECRET;
    }
  });

  it('audit route refuses ingest with 503 when AUDIT_INGEST_SECRET is unprovisioned (fail-closed fallback)', async () => {
    delete process.env.AUDIT_INGEST_SECRET;
    const { POST } = await import('@/app/api/internal/audit/route');
    const res = await POST(
      new Request('http://localhost/api/internal/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'turnstile_403' }),
      }) as never,
    );
    expect(res.status).toBe(503);
  });
});
