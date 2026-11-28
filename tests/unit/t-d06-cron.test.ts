import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const m = path.join(ROOT, 'supabase/migrations/20261126000007_platform_audit.sql');

describe('T-D06 platform_audit migration (cron features moved to external cron)', () => {
  it('file exists', () => {
    expect(fs.existsSync(m)).toBe(true);
  });
  it('has audit tables for tracking cron-related events', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/audit_logs/i);
    expect(c).toMatch(/security_logs/i);
    // No pg_cron in this migration - cron jobs are external (Vercel/GitHub Actions)
  });
  it('security_logs can track cron events', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/security_logs/i);
    expect(c).toMatch(/event/i);
    expect(c).toMatch(/metadata/i);
  });
  it('processed_events for idempotency', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/processed_events/i);
  });
});