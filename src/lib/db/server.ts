import { createClient } from '@/lib/supabase/server';

export async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, description, price, image_url, category_id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12);
  return products;
}