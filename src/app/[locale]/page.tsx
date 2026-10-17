import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getFeaturedProducts } from '@/lib/db/server';
import Hero from '@/components/home/hero';

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const products = await getFeaturedProducts();
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
      <Hero t={t} />
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
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
                <p className="mt-2 font-semibold">${product.price}</p>
              </Link>
            ))
          </div>
        )}
      </section>
    </main>
  );
}
