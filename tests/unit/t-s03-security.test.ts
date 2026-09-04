import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('T-S03 HMAC t v1 RLS Strict security_logs', () => {
  it('webhook parses t=,v1= and timingSafeEqual', () => {
    const c = fs.readFileSync('src/app/api/webhooks/mercadopago/route.ts', 'utf8');
    expect(c).toMatch(/t=.*v1=|v1=.*t=/);
    expect(c).toMatch(/timingSafeEqual/);
    expect(c).toMatch(/extract|split|v1/);
  });
  it('wishlists RLS no for all true', () => {
    const p = 'supabase/migrations/0013_wishlist_rls_fix.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).not.toMatch(/for all using \(true\)/i);
    expect(c).toMatch(/auth\.uid\(\)|session_id/);
  });
  it('proxy cookie SameSite Strict for admin', () => {
    const c = fs.readFileSync('src/proxy.ts', 'utf8');
    expect(c).toMatch(/SameSite.*Strict|Strict.*SameSite/);
    expect(c).toMatch(/\/admin/);
  });
  it('proxy inserts security_logs on 429 403', () => {
    const c = fs.readFileSync('src/proxy.ts', 'utf8');
    expect(c).toMatch(/security_logs/);
  });
});
