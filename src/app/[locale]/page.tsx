import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, description, price, image_url, category_id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12);
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Santísima Trinidad</h1>
        <p className="mt-2 text-zinc-600">Artículos religiosos para tu fe y tu hogar</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Productos</h2>
        {!products || products.length === 0 ? (
          <p className="mt-4 text-zinc-500">Todavía no hay productos publicados. Vuelve pronto.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/producto/${product.slug}`}
                className="group rounded-xl border border-zinc-200 p-4 transition hover:shadow-md"
              >
                <div className="aspect-square w-full rounded-lg bg-zinc-100" />
                <h3 className="mt-3 font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{product.description}</p>
                <p className="mt-2 font-semibold">${product.price}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
