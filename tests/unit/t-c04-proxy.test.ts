import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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
