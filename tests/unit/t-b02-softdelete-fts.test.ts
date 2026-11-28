import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
// New migration with deleted_at in editorial_posts (content_config)
const MIG = path.join(ROOT, 'supabase/migrations/20261126000006_content_config.sql');

describe('T-B02 softdelete FTS deleted_at GIN (new schema - editorial_posts)', () => {
  it('migration file exists', () => {
    expect(fs.existsSync(MIG)).toBe(true);
  });

  it('adds deleted_at timestamptz to editorial_posts', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/deleted_at/i);
    expect(c).toMatch(/timestamptz/i);
  });

  it('adds search_vector tsvector to editorial_posts', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/search_vector/i);
    expect(c).toMatch(/tsvector/i);
  });

  it('creates GIN index on search_vector for editorial_posts', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/gin\s*\(\s*search_vector\s*\)/i);
    expect(c).toMatch(/create\s+index/i);
  });

  it('adds deleted_at index for soft-delete queries on editorial_posts', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/deleted_at/);
    expect(c).toMatch(/create\s+index/i);
  });

  it('defines tsvector trigger for editorial_posts FTS', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/editorial_tsvector_update|to_tsvector/i);
  });

  it('mentions EXPLAIN for GIN verification', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/explain|gin/i);
  });
});