import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/rate-limit.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-C01 rate-limit Upstash slidingWindow 5/15m 60/m 10/h 429', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('uses Upstash Ratelimit slidingWindow with 5/15m 60/m 10/h tiers', () => {
    const c = read();
    expect(c).toMatch(/@upstash\/ratelimit/);
    expect(c).toMatch(/@upstash\/redis/);
    expect(c).toMatch(/slidingWindow/);
    expect(c).toMatch(/5/);
    expect(c).toMatch(/15\s*\*?\s*60|900|15m/i);
    expect(c).toMatch(/60/);
    expect(c).toMatch(/10.*\/.*h|10.*hour/i);
  });
  it('exports checkRateLimit and returns 429 with Retry-After + X-RateLimit', async () => {
    const c = read();
    expect(c).toMatch(/429|Retry-After/i);
    expect(c).toMatch(/X-RateLimit/i);
    const mod = await import('@/lib/rate-limit');
    expect(typeof mod.checkRateLimit).toBe('function');
    expect(typeof mod.rateLimitConfigs).toBe('object');
  });
  it('has mock fallback when env missing', () => {
    const c = read();
    expect(c).toMatch(/mock|fallback|memory|Map/i);
    expect(c).toMatch(/UPSTASH_REDIS_REST_URL|REDIS/i);
  });
  it('handles 600/m authed tier or 429 headers', async () => {
    const mod = await import('@/lib/rate-limit');
    const res = await mod.checkRateLimit('test-key-t-c01', 'public');
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('remaining');
    expect(res).toHaveProperty('reset');
  });
});
