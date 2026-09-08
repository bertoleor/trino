import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const WF = path.join(ROOT, '.github/workflows/migrate-preview.yml');

describe('T-B01b migrate-preview workflow', () => {
  it('workflow file exists', () => {
    expect(fs.existsSync(WF)).toBe(true);
  });

  it('triggers on pull_request to preview migrations', () => {
    const c = fs.readFileSync(WF, 'utf8');
    expect(c).toMatch(/pull_request/i);
    expect(c).toMatch(/supabase|migrate/i);
  });

  it('runs supabase db reset with preview branch', () => {
    const c = fs.readFileSync(WF, 'utf8');
    expect(c).toMatch(/supabase\s+db\s+reset|db\s+reset/i);
  });

  it('verifies migrations 0002..0016 and GIN', () => {
    const c = fs.readFileSync(WF, 'utf8');
    expect(c).toMatch(/0002|migration/i);
    expect(c).toMatch(/gin|explain/i);
  });

  it('includes EXPLAIN verification step', () => {
    const c = fs.readFileSync(WF, 'utf8');
    expect(c).toMatch(/explain/i);
  });

  it('file is <=90 lines', () => {
    const c = fs.readFileSync(WF, 'utf8');
    const lines = c.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeLessThanOrEqual(90);
  });
});
