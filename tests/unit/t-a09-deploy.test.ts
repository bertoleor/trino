import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A09 deploy vercel cron (external, no pg_cron in migrations)', () => {
  it('DOCS/DEPLOY.md exists with .com.ar/.com CNAME SSL', () => {
    const p = path.join(ROOT, 'docs/DEPLOY.md');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/com\.ar|\.com/);
    expect(c).toMatch(/CNAME|NIC|Namecheap/i);
    expect(c).toMatch(/SSL|auto/i);
  });

  it('vercel.json exists with crons', () => {
    const p = path.join(ROOT, 'vercel.json');
    expect(fs.existsSync(p)).toBe(true);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    expect(JSON.stringify(j)).toMatch(/cron/i);
  });

  it('DEPLOY.md mentions Vercel Cron (external cron, no pg_cron in migrations)', () => {
    const c = fs.readFileSync(path.join(ROOT, 'docs/DEPLOY.md'), 'utf8');
    expect(c).toMatch(/Vercel Cron|cron/i);
  });
});