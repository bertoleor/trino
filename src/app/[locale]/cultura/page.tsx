import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 300;
export const dynamic = 'force-static';

export async function generateMetadata() {
  return { title: 'Cultura | trino.' };
}

export default async function CulturaPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('cultura_posts')
    .select('id, slug, title, excerpt, cover_image, published_at')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(12);

  const items = posts ?? [];
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold lowercase">cultura.</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <Link
            key={p.id}
            href={`/cultura/${p.slug}`}
            className="rounded-xl border p-4 hover:shadow-md"
          >
            {p.cover_image ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={p.cover_image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-zinc-100" />
            )}
            <h3 className="mt-3 font-medium lowercase">{p.title}</h3>
            <p className="text-sm text-zinc-500">{p.excerpt}</p>
          </Link>
        ))}
      </div>
      {items.length === 0 ? <p className="mt-6 text-zinc-500">sin articulos.</p> : null}
      <p className="mt-4 text-xs text-zinc-400">
        paginate 12 — ISR revalidate 300 — Skeleton Bauhaus
      </p>
    </main>
  );
}
