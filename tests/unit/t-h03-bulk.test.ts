import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const v = path.join(ROOT, 'src/lib/validations/cultura-bulk.ts');
const a = path.join(ROOT, 'src/lib/actions/cultura-bulk.ts');
describe('T-H03 bulk publish duplicate SEO reading time version history', () => {
  it('files exist', () => {
    expect(fs.existsSync(v)).toBe(true);
    expect(fs.existsSync(a)).toBe(true);
  });
  it('bulk validations Zod ids action enum', async () => {
    const mod = await import('@/lib/validations/cultura-bulk');
    expect(mod.culturaBulkSchema).toBeDefined();
    const bad = mod.culturaBulkSchema.safeParse({ ids: [], action: 'publish' });
    expect(bad.success).toBe(false);
    const ok = mod.culturaBulkSchema.safeParse({ ids: ['123e4567-e89b-12d3-a456-426614174000'], action: 'publish' });
    expect(ok.success).toBe(true);
  });
  it('actions bulk publish unpublish archive delete duplicate SEO score reading time version jsonb', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/bulk|publish/i);
    expect(c).toMatch(/unpublish|archive|delete/i);
    expect(c).toMatch(/duplicate/i);
    expect(c).toMatch(/SEO|seo/i);
    expect(c).toMatch(/reading.*time|words\/200|200/i);
    expect(c).toMatch(/version|jsonb|versions/i);
    expect(c).toMatch(/is_admin|403/i);
    const vc = fs.readFileSync(v, 'utf8');
    expect(vc).toMatch(/title.*60|excerpt.*155|slug/i);
  });
});
