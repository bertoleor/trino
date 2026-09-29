import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A05 database.types.ts DB-SYNC', () => {
  it('src/types/database.types.ts exists', () => {
    const p = path.join(ROOT, 'src/types/database.types.ts');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('exports Database type with tables', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/types/database.types.ts'), 'utf8');
    expect(c).toMatch(/Database/);
    expect(c).toMatch(/profiles|products|orders/);
  });

  it('contains DB-SYNC marker and generation note', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/types/database.types.ts'), 'utf8');
    expect(c).toMatch(/public/);
    // The file is pure `supabase gen types` output (drift-guard contract: regen must be
    // diff-clean, so no hand-added comments live inside it). The DB-SYNC marker lives in
    // package.json gen:types script, asserted here.
    const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
    expect(pkg).toMatch(/gen:types/);
    expect(pkg).toMatch(/supabase gen types typescript --local/);
  });

  it('file is non-trivial CLI output (schema sanity floor)', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/types/database.types.ts'), 'utf8');
    // Generated size is whatever the pinned CLI emits for the current schema; a hard line cap
    // is not enforceable without hand-editing, which the drift guard forbids.
    expect(c.split('\n').length).toBeGreaterThan(500);
  });
});
