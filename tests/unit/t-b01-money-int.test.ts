import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
// New migration with price_cents in catalog_core
const MIG = path.join(ROOT, 'supabase/migrations/20261126000002_catalog_core.sql');

describe('T-B01 money INT MONEY-01 expand/contract (new schema)', () => {
  it('migration file exists', () => {
    expect(fs.existsSync(MIG)).toBe(true);
  });

  it('adds base_price_cents INT with check >=0 to products', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/base_price_cents/i);
    expect(c).toMatch(/integer|int/i);
    expect(c).toMatch(/check\s*\(.*base_price_cents.*>=/i);
  });

  it('adds price_cents INT with check >=0 to product_variants', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/price_cents/i);
    expect(c).toMatch(/integer|int/i);
    expect(c).toMatch(/check\s*\(.*price_cents.*>=/i);
  });

  it('adds currency CHAR(3) DEFAULT ARS CHECK ARS to products', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/currency/i);
    expect(c).toMatch(/char\s*\(\s*3\s*\)/i);
    expect(c).toMatch(/default\s*'ARS'/i);
    expect(c).toMatch(/check\s*\(.*currency.*=.*'ARS'/i);
  });

  it('adds sale_price_cents sale_start sale_end to product_variants', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/sale_price_cents/i);
    expect(c).toMatch(/sale_start/i);
    expect(c).toMatch(/sale_end/i);
  });

  it('covers products and product_variants tables', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/create table public\.products/i);
    expect(c).toMatch(/create table public\.product_variants/i);
  });

  it('file has reasonable size', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    const lines = c.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeLessThanOrEqual(250);
  });
});