import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';

// S-12 (auditoría 34-auditor, LOW, CWE-770 / OWASP A04): GET /api/social/stats had no
// per-route rate limit. On cache MISS it calls the social provider whose budget is
// 200/h per provider (SOCIAL_RATE_LIMITS in src/lib/social/graph.ts). The generic
// proxy tier (60/m per IP) does not protect that GLOBAL budget: IP rotation or cold
// serverless instances (in-memory 24h cache lost per instance) can exhaust the
// provider token budget. The route now enforces a global per-platform limiter
// (200/h) BEFORE any provider fetch, fail-closed with rate-limit headers.

function makeReq(platform: string): NextRequest {
  return new NextRequest(`http://localhost/api/social/stats?platform=${platform}`);
}

async function loadRoute() {
  // Fresh module graph per test: the memory-fallback rate limiter keeps its
  // counters in a module-level Map, so each test needs a clean window.
  vi.resetModules();
  return await import('@/app/api/social/stats/route');
}

beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe('t-s12 /api/social/stats rate limit (CWE-770)', () => {
  it('rejects platform outside the allowlist with 422 without spending limiter budget', async () => {
    const { GET } = await loadRoute();
    const res = await GET(makeReq('facebook'));
    expect(res.status).toBe(422);
    // Invalid platform must not consume the global per-platform budget: the very
    // next valid request still passes the limiter.
    const ok = await GET(makeReq('instagram'));
    expect(ok.status).toBe(200);
  });

  it('serves up to 200 requests per platform then fail-closes the 201st with 429 + headers', async () => {
    const { GET } = await loadRoute();
    let lastOk = 0;
    for (let i = 1; i <= 200; i++) {
      const res = await GET(makeReq('instagram'));
      if (res.status !== 200) throw new Error(`request #${i} unexpectedly ${res.status}`);
      lastOk = i;
    }
    expect(lastOk).toBe(200);
    const blocked = await GET(makeReq('instagram'));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('x-ratelimit-limit')).toBe('200');
    expect(blocked.headers.get('retry-after')).toBeTruthy();
    // Budget is per platform, not shared across platforms.
    const other = await GET(makeReq('tiktok'));
    expect(other.status).toBe(200);
  });

  it('route wires checkRateLimit before the provider call and returns 429 with rl.headers', () => {
    const src = readFileSync('src/app/api/social/stats/route.ts', 'utf8');
    expect(src).toContain("checkRateLimit(`social:${platform}`, 'social')");
    // Order is asserted inside the handler body (both names also appear in imports).
    const body = src.slice(src.indexOf('export async function GET'));
    expect(body.indexOf('checkRateLimit')).toBeLessThan(body.indexOf('getSocialStats'));
    expect(src).toMatch(/status:\s*429,\s*headers:\s*rl\.headers/);
  });

  it('rate-limit tier "social" is aligned with the provider budget (200/h)', () => {
    const src = readFileSync('src/lib/rate-limit.ts', 'utf8');
    expect(src).toMatch(/social:\s*\{\s*requests:\s*200,\s*window:\s*'60 m'/);
  });
});
