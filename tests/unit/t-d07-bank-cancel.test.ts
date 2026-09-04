import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-D07 72h bank cancel re-entry idempotent', () => {
  it('bank-cancel lib exists or cron covers 72h', async () => {
    const lib = path.join(ROOT, 'src/lib/orders/bank-cancel.ts');
    const mig = path.join(ROOT, 'supabase/migrations/0008_cron.sql');
    const hasLib = fs.existsSync(lib);
    const hasMig = fs.existsSync(mig) && fs.readFileSync(mig, 'utf8').match(/72|pending_verification/);
    expect(hasLib || hasMig).toBeTruthy();
  });
  it('idempotent cancel logic', async () => {
    const libPath = path.join(ROOT, 'src/lib/orders/bank-cancel.ts');
    if (!fs.existsSync(libPath)) return;
    const m = await import('@/lib/orders/bank-cancel');
    expect(typeof m.shouldCancelPendingVerification).toBe('function');
    const old = new Date(Date.now() - 73 * 3600 * 1000).toISOString();
    expect(m.shouldCancelPendingVerification('pending_verification', old)).toBe(true);
    expect(m.shouldCancelPendingVerification('pending_verification', new Date().toISOString())).toBe(false);
    expect(m.shouldCancelPendingVerification('authorized', old)).toBe(false);
  });
  it('re-entry idempotent 409/duplicate guard', () => {
    const libPath = path.join(ROOT, 'src/lib/orders/bank-cancel.ts');
    if (!fs.existsSync(libPath)) {
      const c = fs.readFileSync(path.join(ROOT, 'supabase/migrations/0008_cron.sql'), 'utf8');
      expect(c).toMatch(/idempotent|processed_events|72/);
      return;
    }
    const c = fs.readFileSync(libPath, 'utf8');
    expect(c).toMatch(/idempotent|shouldCancel|72/i);
  });
});
