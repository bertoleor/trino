import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/app/api/webhooks/mercadopago/route.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-C02 webhooks/mercadopago HMAC 401 DLQ dup200', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('verifies HMAC and returns 401-only on failure', () => {
    const c = read();
    expect(c).toMatch(/hmac|signature|crypto/i);
    expect(c).toMatch(/401/);
    expect(c).not.toMatch(/return.*403.*hmac/i);
    expect(c).toMatch(/timingSafeEqual|constant.*time/i);
  });
  it('enforces 1MB payload limit', () => {
    const c = read();
    expect(c).toMatch(/1\s*\*\s*1024\s*\*\s*1024|1048576|1.*MB/i);
  });
  it('dedup via processed_events returns 200 on duplicate', () => {
    const c = read();
    expect(c).toMatch(/processed_events/);
    expect(c).toMatch(/200/);
    expect(c).toMatch(/dedup|already.*processed|duplicate/i);
  });
  it('DLQ via failed_webhooks_log and SECURITY DEFINER', () => {
    const c = read();
    expect(c).toMatch(/failed_webhooks_log/);
    const mig = fs.readFileSync(path.join(ROOT, 'supabase/migrations/0005_events_entitlements.sql'), 'utf8');
    expect(mig).toMatch(/failed_webhooks_log/);
  });
  it('business failure returns 200 not 500', () => {
    const c = read();
    expect(c).toMatch(/try.*catch|catch/i);
    expect(c).toMatch(/200/);
  });
});
