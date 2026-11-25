import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import type { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface SearchFallback {
  suggestions: string[];
  recommendations: StorefrontProductCardData[];
}

export async function getSearchFallback(supabase: Supabase): Promise<SearchFallback> {
  const { data: brandRows } = await supabase
    .from('products')
    .select('brand')
    .is('deleted_at', null)
    .eq('is_active', true)
    .not('brand', 'is', null)
    .limit(200);
  const suggestions = [
    ...new Set(
      (brandRows ?? [])
        .map((row) => row.brand?.trim())
        .filter((brand): brand is string => Boolean(brand))
    ),
  ].slice(0, 6);

  const { data: productRows } = await supabase
    .from('products')
    .select('id, name, slug, price, price_cents, sale_price_cents, image_url')
    .is('deleted_at', null)
    .eq('is_active', true)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4);
  const recommendations: StorefrontProductCardData[] = (productRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    price_cents: row.price_cents,
    sale_price_cents: row.sale_price_cents,
    image_url: row.image_url,
  }));

  return { suggestions, recommendations };
}
