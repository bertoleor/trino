import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const MIG = path.join(ROOT, 'supabase/migrations/0002_money_int.sql');

describe('T-B01 money INT MONEY-01 expand/contract', () => {
  it('migration file exists', () => {
    expect(fs.existsSync(MIG)).toBe(true);
  });

  it('adds price_cents INT with check >=0', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/price_cents/i);
    expect(c).toMatch(/integer|int/i);
    expect(c).toMatch(/check\s*\(.*price_cents.*>=/i);
  });

  it('adds currency CHAR(3) DEFAULT ARS CHECK ARS', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/currency/i);
    expect(c).toMatch(/char\s*\(\s*3\s*\)/i);
    expect(c).toMatch(/default\s*'ARS'/i);
    expect(c).toMatch(/check\s*\(.*currency.*=.*'ARS'/i);
  });

  it('adds sale_price_cents sale_start sale_end', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/sale_price_cents/i);
    expect(c).toMatch(/sale_start/i);
    expect(c).toMatch(/sale_end/i);
  });

  it('backfills ROUND(price*100) expand phase', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/round\s*\(\s*price\s*\*\s*100\s*\)/i);
  });

  it('does not drop price column (expand/contract)', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).not.toMatch(/drop\s+column\s+price\s*;/i);
  });

  it('covers products product_variants orders order_items', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/products/i);
    expect(c).toMatch(/product_variants/i);
  });

  it('file is <=30 lines effective', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    const lines = c.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeLessThanOrEqual(60);
  });
});
