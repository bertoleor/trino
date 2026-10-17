import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(
      'id, name, description, price, image_url, category_id, product_variants(id, name, sku, price, stock)'
    )
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square w-full rounded-xl bg-zinc-100" />
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-zinc-600">{product.description}</p>
          <p className="mt-6 text-2xl font-semibold">${product.price}</p>

          {product.product_variants && product.product_variants.length > 0 ? (
            <ul className="mt-6 space-y-2">
              {product.product_variants.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2"
                >
                  <span>
                    {v.name} · <span className="text-zinc-500">{v.sku}</span>
                  </span>
                  <span>
                    ${v.price} · {v.stock > 0 ? `${v.stock} en stock` : 'Agotado'}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <button className="mt-8 rounded-md bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700">
            Agregar al carrito
          </button>
        </div>
      </div>
    </main>
  );
}
