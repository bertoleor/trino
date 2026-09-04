import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const m = path.join(ROOT, 'supabase/migrations/0008_cron.sql');
describe('T-D06 0008_cron >4h QStash Resend abandoned cart hourly', () => {
  it('file exists', () => {
    expect(fs.existsSync(m)).toBe(true);
  });
  it('pg_cron hourly QStash Resend abandoned cart', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/pg_cron|cron\.schedule/i);
    expect(c).toMatch(/abandoned|cart|4\s*hour/i);
    expect(c).toMatch(/QStash|qstash|Resend|resend/i);
  });
  it('72h bank cancel also in cron or T-D07', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/72|pending_verification|cancel/i);
  });
  it('hourly schedule', () => {
    const c = fs.readFileSync(m, 'utf8');
    expect(c).toMatch(/0 \* \* \* \*/);
  });
});
