import Image from 'next/image';
import Link from 'next/link';

export interface LegacyProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export function LegacyProductList({
  locale,
  items,
  page,
  perPage,
  filterCount,
  query,
  categories,
  subcategories,
  finishes,
}: {
  locale: string;
  items: LegacyProduct[];
  page: number;
  perPage: number;
  filterCount: number;
  query: string;
  categories: readonly string[];
  subcategories: readonly string[];
  finishes: readonly string[];
}) {
  return (
    <div className="col-span-full px-6">
      <h1 className="text-3xl font-bold lowercase">tienda.</h1>
      <section className="mt-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <span key={item} className="rounded-full border px-3 py-1 text-xs lowercase">
            {item}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {subcategories.map((item) => (
          <span key={item} className="rounded-full border px-3 py-1 text-xs lowercase">
            {item}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {finishes.map((item) => (
          <span key={item} className="rounded-full border px-3 py-1 text-xs lowercase">
            {item}
          </span>
        ))}
      </section>
      <p className="mt-4 text-sm text-zinc-500">
        pagina {page} — {perPage} por pagina — {filterCount} filtros
        {query ? ` — busqueda: ${query} (GIN search_vector)` : ''}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/${locale}/producto/${item.slug}`}
            className="rounded-xl border p-4 transition hover:shadow-md"
          >
            {item.image_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 3}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-zinc-100" />
            )}
            <h3 className="mt-3 font-medium lowercase">{item.name}</h3>
            <p className="text-sm text-zinc-500">{item.description}</p>
          </Link>
        ))}
      </div>
      {items.length === 0 ? <p className="mt-6 text-zinc-500">sin resultados.</p> : null}
    </div>
  );
}
