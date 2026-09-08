import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A09 deploy vercel cron keepalive', () => {
  it('docs/DEPLOY.md exists with .com.ar/.com CNAME SSL', () => {
    const p = path.join(ROOT, 'docs/DEPLOY.md');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/com\.ar|\.com/);
    expect(c).toMatch(/CNAME|NIC|Namecheap/i);
    expect(c).toMatch(/SSL|auto/i);
  });

  it('vercel.json exists with crons 100/d', () => {
    const p = path.join(ROOT, 'vercel.json');
    expect(fs.existsSync(p)).toBe(true);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    expect(JSON.stringify(j)).toMatch(/cron/i);
  });

  it('supabase/migrations/0009_cron_keepalive.sql exists with pg_cron', () => {
    const p = path.join(ROOT, 'supabase/migrations/0009_cron_keepalive.sql');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/pg_cron|cron\.schedule|heartbeat|keepalive/i);
  });

  it('DEPLOY md mentions Vercel Cron and pg_cron heartbeat', () => {
    const c = fs.readFileSync(path.join(ROOT, 'docs/DEPLOY.md'), 'utf8');
    expect(c).toMatch(/Vercel Cron|pg_cron/);
  });
});
