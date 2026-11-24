import { CATEGORY, FINISH, SUBCATEGORY, parseFacets } from '@/lib/db/facets';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { paginate } from '@/lib/db/pagination';

export const revalidate = 300;
export const dynamic = 'force-static';

type Supabase = Awaited<ReturnType<typeof createClient>>;
type ProductFacets = ReturnType<typeof parseFacets>;

function selectProducts(supabase: Supabase, offset: number, limit: number) {
  return supabase
    .from('products')
    .select('id, name, slug, description, price_cents, image_url', { count: 'exact' })
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

type ProductsQuery = ReturnType<typeof selectProducts>;

function applyBeautyFilters(query: ProductsQuery, q: string, facets: ProductFacets): ProductsQuery {
  let next = query;
  if (q) next = next.textSearch('search_vector', q, { type: 'plain', config: 'spanish' });
  if (facets.category.length) next = next.in('category', facets.category);
  if (facets.subcategory.length) next = next.in('subcategory', facets.subcategory);
  if (facets.finish.length) next = next.in('finish', facets.finish);
  if (facets.brand.length) next = next.in('brand', facets.brand);
  if (facets.shade.length) next = next.in('shade', facets.shade);
  return next;
}

export async function generateMetadata() {
  return { title: 'Tienda | trino.' };
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const facets = parseFacets(sp);
  const { page, perPage, limit, offset } = paginate({
    page: Number(sp.page ?? 1),
    perPage: Number(sp.per_page ?? 25),
  });
  const supabase = await createClient();
  const { data: products } = await applyBeautyFilters(
    selectProducts(supabase, offset, limit),
    q,
    facets
  );
  const items = products ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold lowercase">tienda.</h1>
      <section className="mt-6 flex flex-wrap gap-2">
        {CATEGORY.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {SUBCATEGORY.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {FINISH.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <p className="mt-4 text-sm text-zinc-500">
        pagina {page} — {perPage} por pagina —{' '}
        {facets.category.length +
          facets.subcategory.length +
          facets.finish.length +
          facets.brand.length +
          facets.shade.length}{' '}
        filtros
        {q ? ` — busqueda: ${q} (GIN search_vector)` : ''}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <Link
            key={p.id}
            href={`/producto/${p.slug}`}
            className="rounded-xl border p-4 transition hover:shadow-md"
          >
            {p.image_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i < 3}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-zinc-100" />
            )}
            <h3 className="mt-3 font-medium lowercase">{p.name}</h3>
            <p className="text-sm text-zinc-500">{p.description}</p>
          </Link>
        ))}
      </div>
      {items.length === 0 ? <p className="mt-6 text-zinc-500">sin resultados.</p> : null}
    </main>
  );
}
