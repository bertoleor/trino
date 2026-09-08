import WishlistHeart from '@/components/shared/wishlist-heart';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: `Wishlist ${locale}` };
}
export default async function WishlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const t = await getTranslations({ locale, namespace: 'common' });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let query = supabase.from('wishlists').select('id, product_id, created_at', { count: 'exact' });
  if (user) query = query.eq('user_id', user.id);
  else query = query.eq('session_id', 'anon');
  const from = (page - 1) * 12;
  const to = from + 12 - 1;
  const { data, count } = await query.range(from, to).order('created_at', { ascending: false });
  const items = data ?? [];
  const total = count ?? 0;
  const title = t.has('wishlist.title') ? t('wishlist.title') : 'Wishlist';
  if (!items.length) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold lowercase">{title} — wishlist empty Bauhaus</h1>
        <div className="mt-8 rounded border border-dashed p-12 text-center">
          <div className="mx-auto h-24 w-24 rounded-full border-4 border-black" />
          <p className="mt-4 text-zinc-600">
            No hay favoritos aún. empty Bauhaus 12 ISR revalidate 300 locale i18n
          </p>
        </div>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold lowercase">
        {title} — {total} items paginated 12 ISR 300
      </h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.id} className="rounded border p-4">
            <div className="aspect-square rounded bg-zinc-100" />
            <p className="mt-2 text-sm">{it.product_id}</p>
            <WishlistHeart productId={it.product_id} initial />
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-2">
        {Array.from({ length: Math.ceil(total / 12) })
          .slice(0, 5)
          .map((_, i) => (
            <a
              key={i}
              href={`/${locale}/wishlist?page=${i + 1}`}
              className="rounded border px-3 py-2 text-sm"
              style={{ minHeight: 44 }}
            >
              {i + 1}
            </a>
          ))}
      </div>
    </main>
  );
}
