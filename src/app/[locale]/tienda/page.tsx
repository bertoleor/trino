import { INTENCION, TIPO, TRADICION, parseFacets } from '@/lib/db/facets';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { paginate } from '@/lib/db/pagination';

export const revalidate = 300;
export const dynamic = 'force-static';

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
  let query = supabase
    .from('products')
    .select('id, name, slug, description, price_cents, image_url', { count: 'exact' })
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) query = query.textSearch('search_vector', q, { type: 'plain', config: 'spanish' });
  if (facets.tipo.length) query = query.in('tipo', facets.tipo);
  if (facets.tradicion.length) query = query.in('tradicion', facets.tradicion);
  if (facets.intencion.length) query = query.in('intencion', facets.intencion);

  const { data: products } = await query;
  const items = products ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold lowercase">tienda.</h1>
      <section className="mt-6 flex flex-wrap gap-2">
        {TIPO.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {TRADICION.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <section className="mt-2 flex flex-wrap gap-2">
        {INTENCION.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs lowercase">
            {t}
          </span>
        ))}
      </section>
      <p className="mt-4 text-sm text-zinc-500">
        pagina {page} — {perPage} por pagina — {facets.tipo.length + facets.tradicion.length + facets.intencion.length} filtros
        {q ? ` — busqueda: ${q} (GIN search_vector)` : ''}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/producto/${p.slug}`}
            className="rounded-xl border p-4 transition hover:shadow-md"
          >
            <div className="aspect-square rounded-lg bg-zinc-100" />
            <h3 className="mt-3 font-medium lowercase">{p.name}</h3>
            <p className="text-sm text-zinc-500">{p.description}</p>
          </Link>
        ))}
      </div>
      {items.length === 0 ? <p className="mt-6 text-zinc-500">sin resultados.</p> : null}
    </main>
  );
}
