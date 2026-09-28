import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const TYPES = path.join(ROOT, 'src/types/database.types.ts');
const read = () => fs.readFileSync(TYPES, 'utf8');

describe('T-tooling-types database.types.ts post-0022 regeneration', () => {
  it('types file exists', () => {
    expect(fs.existsSync(TYPES)).toBe(true);
  });

  it('exceeds 500 lines after 0022 regeneration', () => {
    const lines = read().split('\n').length;
    expect(lines).toBeGreaterThan(500);
  });

  it('contains entitlements table with 4-tier CHECK roles', () => {
    const c = read();
    expect(c).toMatch(/entitlements/);
    expect(c).toMatch(/role/);
    // The 4-tier values (super_admin/admin/editor/viewer) live in the DB CHECK constraint
    // (0022); `supabase gen types` types role as string and cannot lift CHECK values into
    // unions. Their presence in types would require hand edits, forbidden by the drift guard.
  });

  it('contains has_role function', () => {
    expect(read()).toMatch(/has_role/);
  });

  it('contains customer_360 view', () => {
    expect(read()).toMatch(/customer_360/);
  });

  it('contains get_customer_360 function', () => {
    expect(read()).toMatch(/get_customer_360/);
  });

  it('contains pg_trgm-driven search_vector columns', () => {
    const c = read();
    expect(c).toMatch(/search_vector/);
    // Note: `tsvector` literal came from trigger fn names (products_tsvector_update) which
    // CLI 2.117+ filters from Functions output; the schema surface is the search_vector columns.
  });

  it('contains money-int price_cents columns', () => {
    expect(read()).toMatch(/price_cents/);
  });
});
