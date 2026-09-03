import { describe, it, expect } from 'vitest';
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
    expect(c).toMatch(/generated|DB-SYNC|supabase gen types/i);
    expect(c).toMatch(/public/);
  });

  it('file respects 150-line budget', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/types/database.types.ts'), 'utf8');
    expect(c.split('\n').length).toBeLessThanOrEqual(150);
  });
});
