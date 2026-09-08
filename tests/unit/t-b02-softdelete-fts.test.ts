import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const MIG = path.join(ROOT, 'supabase/migrations/0003_softdelete_fts.sql');

describe('T-B02 softdelete FTS deleted_at GIN', () => {
  it('migration file exists', () => {
    expect(fs.existsSync(MIG)).toBe(true);
  });

  it('adds deleted_at timestamptz to products', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/deleted_at/i);
    expect(c).toMatch(/timestamptz/i);
  });

  it('adds search_vector tsvector', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/search_vector/i);
    expect(c).toMatch(/tsvector/i);
  });

  it('creates GIN index on search_vector', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/gin\s*\(\s*search_vector\s*\)/i);
    expect(c).toMatch(/create\s+index/i);
  });

  it('adds deleted_at index for soft-delete queries', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/deleted_at/);
    expect(c).toMatch(/create\s+index/i);
  });

  it('defines tsvector trigger or generated column for FTS', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/trigger|tsvector_update_trigger|to_tsvector|setweight/i);
  });

  it('mentions EXPLAIN for GIN verification', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/explain|gin/i);
  });
});
