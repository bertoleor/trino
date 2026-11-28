import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const TYPES = path.join(ROOT, 'src/types/database.types.ts');
const read = () => fs.readFileSync(TYPES, 'utf8');

describe('T-tooling-types database.types.ts post-regeneration', () => {
  it('types file exists', () => {
    expect(fs.existsSync(TYPES)).toBe(true);
  });

  it('exceeds 500 lines after regeneration', () => {
    const lines = read().split('\n').length;
    expect(lines).toBeGreaterThan(500);
  });

  it('contains entitlements table with role', () => {
    const c = read();
    expect(c).toMatch(/entitlements/);
    expect(c).toMatch(/role/);
  });

  it('contains has_role function', () => {
    expect(read()).toMatch(/has_role/);
  });

  it('contains search_vector columns (pg_trgm FTS)', () => {
    const c = read();
    expect(c).toMatch(/search_vector/);
  });

  it('contains money-int price_cents columns', () => {
    expect(read()).toMatch(/price_cents/);
  });

  it('contains editorial_posts table', () => {
    expect(read()).toMatch(/editorial_posts/);
  });

  it('contains global_settings table', () => {
    expect(read()).toMatch(/global_settings/);
  });
});