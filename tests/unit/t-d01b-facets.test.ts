import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/db/facets.ts');
const tienda = path.join(ROOT, 'src/app/[locale]/tienda/page.tsx');
const read = () => fs.readFileSync(p, 'utf8');
describe('T-D01b facets tipo10/tradicion9/intencion7 FTS GIN', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('exports triple taxonomies 10/9/7', async () => {
    const mod = await import('@/lib/db/facets');
    expect(mod.TIPO.length).toBe(10);
    expect(mod.TRADICION.length).toBe(9);
    expect(mod.INTENCION.length).toBe(7);
    expect(typeof mod.parseFacets).toBe('function');
    expect(typeof mod.buildFacetFilter).toBe('function');
  });
  it('contains GIN FTS reuse', () => {
    const c = read();
    expect(c).toMatch(/search_vector|GIN|tsvector|fts/i);
    expect(c).toMatch(/tipo|tradicion|intencion/i);
  });
  it('tienda page exists with facets ISR', () => {
    expect(fs.existsSync(tienda)).toBe(true);
    const c = fs.readFileSync(tienda, 'utf8');
    expect(c).toMatch(/facets|TIPO|TRADICION|INTENCION/i);
    expect(c).toMatch(/revalidate|ISR|force-static/i);
    expect(c).toMatch(/paginate|page|perPage/i);
  });
  it('parseFacets validates whitelist', async () => {
    const { parseFacets } = await import('@/lib/db/facets');
    expect(parseFacets({ tipo: 'velas' }).tipo).toEqual(['velas']);
    expect(parseFacets({ tipo: 'invalid' }).tipo).toEqual([]);
  });
});
