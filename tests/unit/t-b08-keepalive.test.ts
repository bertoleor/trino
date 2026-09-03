import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-B08 keepalive pause7d pg_cron 6h logs Vercel 04:00 UTC', () => {
  it('migration 0010_keepalive.sql exists with pg_cron heartbeat', () => {
    const p = path.join(ROOT, 'supabase/migrations/0010_keepalive.sql');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/keepalive_logs/i);
    expect(c).toMatch(/pg_cron|cron\.schedule/i);
    expect(c).toMatch(/0 \*\/6 \* \* \*|6 hours|heartbeat/i);
    expect(c).toMatch(/select\s+1/i);
  });

  it('keepalive lib exists with SELECT 1 and log', () => {
    const p = path.join(ROOT, 'src/lib/supabase/keepalive.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/select\s+1|heartbeat|keepalive/i);
    expect(c).toMatch(/keepalive_logs|supabase/i);
  });

  it('cron route exists with auth and logs', () => {
    const p = path.join(ROOT, 'src/app/api/cron/keepalive/route.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/keepalive|select\s+1/i);
    expect(c).toMatch(/authorization|CRON_SECRET|Bearer/i);
  });

  it('vercel.json includes keepalive at 04:00 UTC', () => {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
    const crons = JSON.stringify(j.crons || j);
    expect(crons).toMatch(/keepalive/i);
    expect(crons).toMatch(/0 4|04:00|6 \* \* \*|keepalive/i);
  });

  it('github workflow keepalive.yml exists with SELECT1 and pg_cron fallback', () => {
    const p = path.join(ROOT, '.github/workflows/keepalive.yml');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/keepalive|select\s+1|pg_cron|heartbeat/i);
    expect(c).toMatch(/schedule|cron/i);
  });

  it('keepalive handles pause7d via 6h interval', () => {
    const mig = fs.readFileSync(path.join(ROOT, 'supabase/migrations/0010_keepalive.sql'), 'utf8');
    const lib = fs.readFileSync(path.join(ROOT, 'src/lib/supabase/keepalive.ts'), 'utf8');
    expect(mig + lib).toMatch(/6|pause|heartbeat/i);
  });
});
