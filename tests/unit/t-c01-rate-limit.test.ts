import { describe, it, expect } from 'vitest';

describe('T-C01 rate-limit Upstash slidingWindow behavioral', () => {
  it('rateLimitConfigs has correct tier values', async () => {
    const { rateLimitConfigs } = await import('@/lib/rate-limit');
    expect(rateLimitConfigs.auth.requests).toBe(5);
    expect(rateLimitConfigs.auth.window).toBe('15 m');
    expect(rateLimitConfigs.public.requests).toBe(60);
    expect(rateLimitConfigs.admin.requests).toBe(10);
    expect(rateLimitConfigs.admin.window).toBe('60 m');
  });

  it('checkRateLimit returns headers with X-RateLimit and Retry-After', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const res = await checkRateLimit(`t-c01-headers-${Date.now()}`, 'public');
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('remaining');
    expect(res).toHaveProperty('reset');
    expect(res.headers).toHaveProperty('X-RateLimit-Limit');
    expect(res.headers).toHaveProperty('X-RateLimit-Remaining');
    expect(res.headers['Retry-After']).toBeDefined();
  });

  it('auth tier 5/15m locks after 5 then 6th is 429 with Retry-After 900', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const key = `auth-lock-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit(key, 'auth');
      expect(r.success).toBe(true);
    }
    const blocked = await checkRateLimit(key, 'auth');
    expect(blocked.success).toBe(false);
    expect(blocked.headers['Retry-After']).toBe('900');
    expect(blocked.headers['X-RateLimit-Limit']).toBe('5');
  });

  it('public tier allows up to 60 then 61st is 429', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const key = `public-60-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 60; i++) {
      const r = await checkRateLimit(key, 'public');
      expect(r.success).toBe(true);
    }
    const over = await checkRateLimit(key, 'public');
    expect(over.success).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it('rateLimitHeaders helper returns correct shape', async () => {
    const { rateLimitHeaders } = await import('@/lib/rate-limit');
    const h = rateLimitHeaders({ limit: 60, remaining: 10, reset: Date.now() + 60000, success: true });
    expect(h['X-RateLimit-Limit']).toBe('60');
    expect(h['X-RateLimit-Remaining']).toBe('10');
    expect(h['Retry-After']).toBe('0');
    const h2 = rateLimitHeaders({ limit: 5, remaining: 0, reset: Date.now() + 900000, success: false });
    expect(h2['Retry-After']).toBe('900');
  });

  it('memory fallback works without Redis env', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const r = await checkRateLimit(`mem-fallback-${Date.now()}`, 'webhook');
    expect(r.success).toBe(true);
    expect(r.limit).toBe(60);
  });
});
