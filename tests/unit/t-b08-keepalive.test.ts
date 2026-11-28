import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-B08 platform_audit migration (replaces keepalive)', () => {
  it('migration 20261126000007_platform_audit.sql exists with audit tables', () => {
    const p = path.join(ROOT, 'supabase/migrations/20261126000007_platform_audit.sql');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    // Check for audit_logs table
    expect(c).toMatch(/audit_logs/i);
    expect(c).toMatch(/table_name|record_id|action|old_data|new_data/i);
    // Check for security_logs table
    expect(c).toMatch(/security_logs/i);
    expect(c).toMatch(/event|ip|metadata/i);
    // Check for processed_events (idempotency)
    expect(c).toMatch(/processed_events/i);
    // Check for failed_webhooks_log (DLQ)
    expect(c).toMatch(/failed_webhooks_log/i);
    // Check for idempotency_keys
    expect(c).toMatch(/idempotency_keys/i);
  });

  it('keepalive lib exists with SELECT 1', () => {
    const p = path.join(ROOT, 'src/lib/supabase/keepalive.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/select\s+1|heartbeat|keepalive/i);
  });

  it('cron route exists with auth', () => {
    const p = path.join(ROOT, 'src/app/api/cron/keepalive/route.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/keepalive|select\s+1/i);
    expect(c).toMatch(/authorization|CRON_SECRET|Bearer/i);
  });

  it('vercel.json includes keepalive schedule', () => {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
    const crons = JSON.stringify(j.crons || j);
    expect(crons).toMatch(/keepalive/i);
  });

  it('github workflow keepalive.yml exists', () => {
    const p = path.join(ROOT, '.github/workflows/keepalive.yml');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/keepalive|select\s+1|heartbeat/i);
  });
});