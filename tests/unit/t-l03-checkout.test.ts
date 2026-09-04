import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('T-L03 checkout price-integrity 422 orders', () => {
  it('price-integrity lib exists recompute 422', () => {
    const p = 'src/lib/checkout/price-integrity.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/price_mismatch|422/);
    expect(c).toMatch(/price_cents|recompute/);
  });
  it('checkout route POST checks total 422 and idempotency', () => {
    const p = 'src/app/api/checkout/route.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/POST/);
    expect(c).toMatch(/422|price_mismatch/);
    expect(c).toMatch(/Idempotency-Key|idempotency/i);
    expect(c).toMatch(/pending|pending_verification/);
    expect(c).toMatch(/failed_webhooks_log|DLQ/);
  });
  it('migration 0020 orders checkout exists', () => {
    const p = 'supabase/migrations/0020_orders_checkout.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/orders/);
    expect(c).toMatch(/storage_path|Idempotency|idempotency/i);
  });
});
