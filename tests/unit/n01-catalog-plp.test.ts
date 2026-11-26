import {
  catalogHref,
  facetHref,
  parseCatalogSort,
  sortProducts,
} from '@/lib/catalog/catalog-query';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const FORBIDDEN =
  /refill|recarga|100% original directo|directo de fábrica|distribuidor oficial exclusivo|vegan|cruelty[- ]free|\bMUA\b|maquilladora|turno|99\.9|precisi[oó]n|fabricaci[oó]n propia|CUIT|factura corporativa/i;
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return [next, ...keys(child, next)];
  });
}

describe('N-01 PLP desktop #70', () => {
  it('replaces the legacy list with the Neo-Pop catalog', () => {
    const c = read('src/app/[locale]/tienda/page.tsx');
    expect(c).not.toMatch(/LegacyProductList/);
    expect(c).toMatch(/CatalogHero/);
    expect(c).toMatch(/CatalogFilters/);
    expect(c).toMatch(/CatalogProductCard/);
    expect(c).toMatch(/parseFacets/);
    expect(c).toMatch(/revalidate\s*=\s*300/);
    expect(read('src/lib/catalog/catalog-data.ts')).toMatch(/image_url/);
  });

  it('keeps catalog controls server-rendered and mutation-free', () => {
    const files = [
      'src/components/storefront/catalog-hero.tsx',
      'src/components/storefront/catalog-filters.tsx',
      'src/components/storefront/catalog-toolbar.tsx',
      'src/components/storefront/catalog-product-card.tsx',
    ];
    for (const file of files) {
      const c = read(file);
      expect(c).toMatch(/href=/);
      expect(c).not.toMatch(/onClick|addToCart|createCheckout|useActionState/);
      expect(c).not.toMatch(/aida-public|data:image/i);
    }
  });

  it('ships identical catalog keys in all locales without forbidden claims', () => {
    let expected: string[] | null = null;
    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/search.json`)) as Record<
        string,
        unknown
      >;
      const catalog = messages.catalog;
      expect(catalog).toBeDefined();
      expect(JSON.stringify(catalog)).not.toMatch(FORBIDDEN);
      const actual = keys(catalog).sort();
      expected ??= actual;
      expect(actual).toEqual(expected);
    }
  });

  it('normalizes sort and builds stable facet URLs', () => {
    expect(parseCatalogSort({ sort: 'price_desc' })).toBe('price_desc');
    expect(parseCatalogSort({ sort: 'unknown' })).toBe('newest');
    expect(catalogHref('es-AR', { q: 'gloss', page: '3' }, { category: 'labios' })).toBe(
      '/es-AR/tienda?q=gloss&category=labios'
    );
    expect(facetHref('es-AR', { category: 'labios', q: 'gloss' }, 'category', 'labios')).toBe(
      '/es-AR/tienda?q=gloss'
    );
  });

  it('sorts only by real price and name data', () => {
    const items = [
      { name: 'B', price: 2, price_cents: null },
      { name: 'A', price: 1, price_cents: null },
    ];
    expect(sortProducts(items, 'price_asc').map((item) => item.name)).toEqual(['A', 'B']);
    expect(sortProducts(items, 'price_desc').map((item) => item.name)).toEqual(['B', 'A']);
    expect(sortProducts(items, 'name').map((item) => item.name)).toEqual(['A', 'B']);
  });

  it('documents the Stitch baseline used for the port', () => {
    expect(read('docs/plans/PLAN-migracion-frontend-neopop.md')).toMatch(
      /cat_logo_completo_drops_desktop/
    );
  });
});
