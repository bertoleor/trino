import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/db/facets.ts');
const tienda = path.join(ROOT, 'src/app/[locale]/tienda/page.tsx');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-D01b beauty facets category5/subcategory7/finish5 FTS GIN', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));

  it('exports beauty taxonomies 5/7/5', async () => {
    const mod = await import('@/lib/db/facets');
    expect(mod.CATEGORY.length).toBe(5);
    expect(mod.SUBCATEGORY.length).toBe(7);
    expect(mod.FINISH.length).toBe(5);
    expect(typeof mod.parseFacets).toBe('function');
    expect(typeof mod.buildFacetFilter).toBe('function');
  });

  it('contains GIN FTS reuse', () => {
    const c = read();
    expect(c).toMatch(/search_vector|GIN|tsvector|fts/i);
    expect(c).toMatch(/category|subcategory|finish|brand|shade/i);
    expect(c).not.toMatch(/tradicion|intencion|tarot|velas/i);
  });

  it('tienda page uses beauty facets with ISR and pagination', () => {
    expect(fs.existsSync(tienda)).toBe(true);
    const c = fs.readFileSync(tienda, 'utf8');
    expect(c).toMatch(/CATEGORY|SUBCATEGORY|FINISH/i);
    expect(c).toMatch(/revalidate|ISR|force-static/i);
    expect(c).toMatch(/paginate|page|perPage/i);
    expect(c).not.toMatch(/TIPO|TRADICION|INTENCION|facets\.tipo/i);
  });

  it('parseFacets validates whitelist and normalizes shade', async () => {
    const { parseFacets } = await import('@/lib/db/facets');
    expect(parseFacets({ category: 'velas' }).category).toEqual([]);
    expect(
      parseFacets({
        category: 'Labios,ojos',
        subcategory: 'labiales,gloss',
        finish: 'mate',
        brand: 'trino.',
        shade: '#8A2E4B',
      })
    ).toEqual({
      category: ['labios', 'ojos'],
      subcategory: ['labiales', 'gloss'],
      finish: ['mate'],
      brand: ['trino.'],
      shade: ['8a2e4b'],
    });
  });

  it('buildFacetFilter emits one intersect clause per active facet', async () => {
    const { buildFacetFilter, parseFacets } = await import('@/lib/db/facets');
    const f = parseFacets({ category: 'labios', finish: 'mate,gloss', shade: '8a2e4b' });
    const result = buildFacetFilter(f);
    expect(result.where).toEqual([
      'category = ANY(:category)',
      'finish = ANY(:finish)',
      'shade = ANY(:shade)',
    ]);
    expect(result.params).toEqual({
      category: ['labios'],
      finish: ['mate', 'gloss'],
      shade: ['8a2e4b'],
    });
    expect(result.searchVector).toMatch(/search_vector/);
    expect(result.ginIndex).toBe('idx_products_search_vector');
  });
});
