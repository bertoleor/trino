import type { Facets } from '@/lib/db/facets';
import type { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_cents: number | null;
  sale_price_cents: number | null;
  image_url: string | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
}

function selectProducts(supabase: Supabase, offset: number, limit: number) {
  return supabase
    .from('products')
    .select(
      'id, name, slug, description, price, price_cents, sale_price_cents, image_url, brand, category, subcategory',
      { count: 'exact' }
    )
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

type ProductsQuery = ReturnType<typeof selectProducts>;

function applyBeautyFilters(query: ProductsQuery, q: string, facets: Facets): ProductsQuery {
  let next = query;
  if (q) next = next.textSearch('search_vector', q, { type: 'plain', config: 'spanish' });
  if (facets.category.length) next = next.in('category', facets.category);
  if (facets.subcategory.length) next = next.in('subcategory', facets.subcategory);
  if (facets.finish.length) next = next.in('finish', facets.finish);
  if (facets.brand.length) next = next.in('brand', facets.brand);
  if (facets.shade.length) next = next.in('shade', facets.shade);
  return next;
}

export async function loadCatalog({
  supabase,
  offset,
  limit,
  q,
  facets,
}: {
  supabase: Supabase;
  offset: number;
  limit: number;
  q: string;
  facets: Facets;
}): Promise<{ products: CatalogProduct[]; total: number }> {
  const { data, count } = await applyBeautyFilters(
    selectProducts(supabase, offset, limit),
    q,
    facets
  );
  return { products: (data ?? []) as CatalogProduct[], total: count ?? 0 };
}
