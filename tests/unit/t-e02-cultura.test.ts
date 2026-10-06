import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const v = path.join(ROOT, 'src/lib/validations/cultura.ts');
const a = path.join(ROOT, 'src/lib/actions/cultura.ts');
describe('T-E02 cultura validations+actions Zod triple', () => {
  it('files exist', () => {
    expect(fs.existsSync(v)).toBe(true);
    expect(fs.existsSync(a)).toBe(true);
  });
  it('validations Zod triple slug/title/excerpt/body/cover/tags', async () => {
    const mod = await import('@/lib/validations/cultura');
    expect(mod.culturaSchema).toBeDefined();
    const r = mod.culturaSchema.safeParse({
      slug: 'ab',
      title: 't',
      locale: 'es-AR',
      status: 'draft',
    });
    expect(r.success).toBe(false);
    const ok = mod.culturaSchema.safeParse({
      slug: 'mi-post',
      title: 'Titulo valido',
      excerpt: 'excerpt',
      body: {},
      locale: 'es-AR',
      status: 'draft',
      tags: ['tag1'],
      related_product_ids: [],
    });
    expect(ok.success).toBe(true);
  });
  it('actions is_admin 403 revalidatePath FTS soft-delete', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/is_admin|403/i);
    expect(c).toMatch(/revalidatePath/);
    expect(c).toMatch(/soft|deleted_at|search_vector/i);
    expect(c).toMatch(/createCultura|updateCultura|publishCultura|deleteCultura/i);
  });
});
