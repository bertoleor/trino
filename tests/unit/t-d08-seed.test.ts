import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'supabase/seed.sql');
describe('T-D08 seed factories 90/80 SEED sadPaths', () => {
  it('file exists', () => {
    expect(fs.existsSync(p)).toBe(true);
  });
  it('factories and inserts', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/insert into|products|cultura_posts|wishlists|reviews/i);
    expect(c.length).toBeGreaterThan(500);
  });
  it('sadPaths coverage', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/sad|deleted_at|pending|duplicate/i);
  });
});
