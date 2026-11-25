import { createClient } from '@/lib/supabase/server';
import { readCartSessionId } from '@/lib/cart/session';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface CartViewItem {
  id: string;
  name: string;
  variantName: string;
  slug: string;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
}

export interface CartRecommendation {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  priceCents: number;
}

export interface CartView {
  items: CartViewItem[];
  recommendations: CartRecommendation[];
}

/**
 * Read-only presentation data for the global drawer. It never creates a cart
 * session, never writes and never promotes an anonymous identity: the session
 * id comes from the httpOnly cookie and the user id from the Supabase session.
 * RLS still applies to every query — no service role, no bypass.
 */
export async function getCartView(): Promise<CartView> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessionId = user ? null : await readCartSessionId();
  if (!user && !sessionId) {
    return { items: [], recommendations: await getRecommendations(supabase) };
  }

  const rowsQuery = supabase.from('cart_items').select('id, variant_id, quantity');
  const { data: rows } = await (
    user ? rowsQuery.eq('user_id', user.id) : rowsQuery.eq('session_id', sessionId ?? '')
  ).order('created_at', { ascending: false });
  if (!rows?.length) {
    return { items: [], recommendations: await getRecommendations(supabase) };
  }

  const variantIds = [...new Set(rows.map((row) => row.variant_id))];
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, name, price, price_cents, product_id')
    .in('id', variantIds);
  const productIds = [...new Set((variants ?? []).map((variant) => variant.product_id))];
  const { data: products } = productIds.length
    ? await supabase.from('products').select('id, name, slug, image_url').in('id', productIds)
    : { data: [] };

  const byVariant = new Map((variants ?? []).map((variant) => [variant.id, variant]));
  const byProduct = new Map((products ?? []).map((product) => [product.id, product]));
  const items: CartViewItem[] = rows.flatMap((row) => {
    const variant = byVariant.get(row.variant_id);
    const product = variant ? byProduct.get(variant.product_id) : undefined;
    if (!variant || !product) return [];
    return [
      {
        id: row.id,
        name: product.name,
        variantName: variant.name,
        slug: product.slug,
        imageUrl: product.image_url,
        priceCents: variant.price_cents ?? Math.round(Number(variant.price) * 100),
        quantity: row.quantity,
      },
    ];
  });

  return {
    items,
    recommendations: await getRecommendations(supabase, new Set(productIds)),
  };
}

async function getRecommendations(
  supabase: Supabase,
  exclude: ReadonlySet<string> = new Set()
): Promise<CartRecommendation[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, price_cents, image_url')
    .is('deleted_at', null)
    .eq('is_active', true)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(12);
  return (data ?? [])
    .filter((product) => !exclude.has(product.id))
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.image_url,
      priceCents: product.price_cents ?? Math.round(Number(product.price) * 100),
    }));
}
