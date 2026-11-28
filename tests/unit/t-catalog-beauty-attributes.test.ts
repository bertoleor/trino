import { describe, expect, it } from 'vitest';
import { catalogRowSchema } from '@/lib/validations/catalog';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const validRow = {
  slug: 'labial-liquido-mate-berry',
  title: 'Labial líquido mate berry',
  excerpt: 'Labial de alta cobertura y acabado mate sin transferencia.',
  price_cents: 249900,
  currency: 'ARS',
  sale_price_cents: 199900,
  sale_start: '2026-11-01T03:00:00Z',
  sale_end: '2026-11-30T03:00:00Z',
  stock: 80,
  sku: 'LL-MAT-001',
  weight_grams: 8,
  dimensions_cm: '9x3x3',
  images: 'products/labial/01.webp|products/labial/02.webp',
  category: 'labios',
  subcategory: 'labiales',
  brand: 'trino.',
  shade: '#8A2E4B',
  finish: 'mate',
  tags: 'labial,mate,berry',
  locale: 'es-AR',
  related_product_slugs: 'lip-liner-001',
  status: 'published',
};

describe('catalog beauty attributes (new schema - catalog_core)', () => {
  it('adds canonical columns in products and product_variants tables', () => {
    const sql = read('supabase/migrations/20261126000002_catalog_core.sql');
    // Products table has category, subcategory, brand, finish
    expect(sql).toMatch(/category\s+text/i);
    expect(sql).toMatch(/subcategory\s+text/i);
    expect(sql).toMatch(/brand\s+text/i);
    expect(sql).toMatch(/finish\s+text/i);
    // Product_variants has shade
    expect(sql).toMatch(/shade\s+text/i);
    // Partial indexes for published products
    expect(sql).toMatch(/idx_products_category.*where status = 'published'/);
    expect(sql).toMatch(/idx_products_subcategory.*where status = 'published'/);
    expect(sql).toMatch(/idx_products_brand.*where status = 'published'/);
    expect(sql).toMatch(/idx_products_finish.*where status = 'published'/);
    // GIN index for search
    expect(sql).toMatch(/idx_products_search_vector.*using gin.*search_vector/);
  });

  it('exposes the new columns in generated database types', () => {
    const types = read('src/types/database.types.ts');
    const products = types.slice(types.indexOf('products": {'), types.indexOf('profiles": {'));
    for (const col of ['brand', 'category', 'finish', 'subcategory']) {
      expect(products).toMatch(new RegExp(`"${col}": string`));
    }
  });

  it('validates a beauty catalog row and normalizes shade to lowercase', () => {
    const row = catalogRowSchema.parse(validRow);
    expect(row.shade).toBe('8a2e4b');
    expect(row.images).toHaveLength(2);
    expect(row.tags).toEqual(['labial', 'mate', 'berry']);
    expect(row.related_product_slugs).toEqual(['lip-liner-001']);
  });

  it('rejects legacy taxonomy, bad hex, wrong currency and inverted sale', () => {
    expect(catalogRowSchema.safeParse({ ...validRow, category: 'velas' }).success).toBe(false);
    expect(catalogRowSchema.safeParse({ ...validRow, shade: 'xyz123' }).success).toBe(false);
    expect(catalogRowSchema.safeParse({ ...validRow, currency: 'USD' }).success).toBe(false);
    expect(catalogRowSchema.safeParse({ ...validRow, sale_price_cents: 299900 }).success).toBe(
      false
    );
    expect(catalogRowSchema.safeParse({ ...validRow, slug: 'Bad Slug' }).success).toBe(false);
  });

  it('seeds beauty products instead of esoteric items', () => {
    const seed = read('supabase/seed.sql');
    expect(seed).not.toMatch(/sahumerio|palo santo|vela soja|incienzo|ritual|tarot/i);
    expect(seed).toMatch(/labial-liquido-mate-berry/);
    expect(seed).toMatch(/paleta-sombras-crushed/);
    expect(seed).toMatch(/insert into public\.products/i);
    expect(seed).toMatch(/insert into public\.product_variants/i);
    expect(seed).toMatch(/insert into public\.product_translations/i);
    expect(seed).toMatch(/insert into public\.product_images/i);
  });
});