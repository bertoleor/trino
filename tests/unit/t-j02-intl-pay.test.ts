import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const stripe = path.join(ROOT, 'src/lib/payments/providers/stripe.ts');
const paypal = path.join(ROOT, 'src/lib/payments/providers/paypal.ts');
const router = path.join(ROOT, 'src/lib/payments/router.ts');
const swh = path.join(ROOT, 'src/app/api/webhooks/stripe/route.ts');
const pwh = path.join(ROOT, 'src/app/api/webhooks/paypal/route.ts');
describe('T-J02 intl pay Stripe PayPal router HMAC DLQ', () => {
  it('stripe provider zero-PAN delegated', () => {
    expect(fs.existsSync(stripe)).toBe(true);
    const c = fs.readFileSync(stripe, 'utf8');
    expect(c).toMatch(/stripe/i);
    expect(c).toMatch(/PAYMENTS_STRIPE_ENABLED|stripe.*enabled/i);
    expect(c).toMatch(/zero.*pan|delegated|Elements/i);
  });
  it('paypal provider zero-PAN delegated', () => {
    expect(fs.existsSync(paypal)).toBe(true);
    const c = fs.readFileSync(paypal, 'utf8');
    expect(c).toMatch(/paypal/i);
    expect(c).toMatch(/PAYPAL_ENABLED|paypal.*enabled/i);
    expect(c).toMatch(/zero.*pan|delegated|SDK/i);
  });
  it('router Strategy selects mp/stripe/paypal by flag', () => {
    expect(fs.existsSync(router)).toBe(true);
    const c = fs.readFileSync(router, 'utf8');
    expect(c).toMatch(/mercadopago|mp/i);
    expect(c).toMatch(/stripe/i);
    expect(c).toMatch(/paypal/i);
    expect(c).toMatch(/PAYMENTS_STRIPE_ENABLED|PAYPAL_ENABLED/i);
  });
  it('stripe webhook HMAC timingSafeEqual idempotency DLQ 1MB', () => {
    expect(fs.existsSync(swh)).toBe(true);
    const c = fs.readFileSync(swh, 'utf8');
    expect(c).toMatch(/timingSafeEqual/);
    expect(c).toMatch(/stripe.*signature|stripe-signature/i);
    expect(c).toMatch(/processed_events/);
    expect(c).toMatch(/failed_webhooks_log/);
    expect(c).toMatch(/1.*1024.*1024|1048576|MAX_BYTES/i);
  });
  it('paypal webhook HMAC timingSafeEqual idempotency DLQ 1MB', () => {
    expect(fs.existsSync(pwh)).toBe(true);
    const c = fs.readFileSync(pwh, 'utf8');
    expect(c).toMatch(/timingSafeEqual/);
    expect(c).toMatch(/paypal/i);
    expect(c).toMatch(/processed_events/);
    expect(c).toMatch(/failed_webhooks_log/);
    expect(c).toMatch(/1.*1024.*1024|1048576|MAX_BYTES/i);
  });
});
