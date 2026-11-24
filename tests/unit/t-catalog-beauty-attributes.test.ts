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

describe('catalog beauty attributes (0028)', () => {
  it('adds canonical columns, partial indexes and GIN-backed FTS', () => {
    const sql = read('supabase/migrations/0028_product_beauty_attributes.sql');
    for (const col of ['category', 'subcategory', 'brand', 'shade', 'finish']) {
      expect(sql).toMatch(new RegExp(`add column if not exists ${col} text`));
    }
    expect(sql).toMatch(/idx_products_beauty_category/);
    expect(sql).toMatch(/idx_products_beauty_shade/);
    expect(sql).toMatch(/to_tsvector/);
    expect(sql).toMatch(/idx_products_search_vector/);
    expect(sql).toMatch(/coalesce\(new\.brand/);
    expect(sql).not.toMatch(/tipo|tradicion|intencion|tarot|velas/i);
  });

  it('exposes the new columns in generated database types', () => {
    const types = read('src/types/database.types.ts');
    const products = types.slice(types.indexOf('products: {'), types.indexOf('profiles: {'));
    for (const col of ['brand', 'category', 'finish', 'shade', 'subcategory']) {
      expect(products).toMatch(new RegExp(`${col}: string \\| null`));
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
    expect(seed).toMatch(/insert into public\.makeup_products/);
    expect(seed).toMatch(/'labios','labiales','trino\.','8a2e4b','mate'/);
  });
});
