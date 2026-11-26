import { EmptyState } from '@/components/storefront/empty-state';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { WishlistGalleryAssurance } from '@/components/storefront/wishlist-gallery-assurance';
import { WishlistGalleryGrid } from '@/components/storefront/wishlist-gallery-grid';
import { WishlistGalleryHeader } from '@/components/storefront/wishlist-gallery-header';
import { WishlistGalleryShare } from '@/components/storefront/wishlist-gallery-share';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

// Session-bound page: renders the signed-in user's wishlist from the auth cookie.
// force-dynamic replaces the revalidate=300 ISR config, which could never cache
// per-user output and crashed the static export (cookies() during prerender).
export const dynamic = 'force-dynamic';

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
  const tPage = await getTranslations({ locale, namespace: 'institucional.wishlist' });

  const shell = (children: ReactNode) => (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="grid grid-cols-12 gap-6 px-6 py-8"
    >
      <WishlistGalleryHeader locale={locale} title={title} total={total} />
      {children}
    </StitchShell>
  );

  if (!items.length) {
    return shell(
      <>
        <div className="col-span-12">
          <EmptyState
            title={tPage('empty.title')}
            description={tPage('empty.description')}
            action={
              <Link
                href={`/${locale}/tienda`}
                className="font-label border-ink bg-ink text-cream shadow-pop-sm rounded-control inline-flex min-h-11 items-center border-2 px-5 text-xs font-bold uppercase"
              >
                {tPage('empty.action')}
              </Link>
            }
          />
        </div>
        <WishlistGalleryAssurance locale={locale} />
      </>
    );
  }

  return shell(
    <>
      <WishlistGalleryGrid locale={locale} entries={items} />
      <WishlistGalleryShare />
      <WishlistGalleryAssurance locale={locale} />
      <nav
        data-purpose="wishlist-gallery-pagination"
        aria-label={tPage('grid.title')}
        className="border-ink bg-cream shadow-pop rounded-card col-span-12 flex flex-wrap gap-3 border-[3px] p-4"
      >
        {Array.from({ length: Math.ceil(total / 12) })
          .slice(0, 5)
          .map((_, i) => (
            <Link
              key={i}
              href={`/${locale}/wishlist?page=${i + 1}`}
              aria-current={page === i + 1 ? 'page' : undefined}
              className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex min-h-11 min-w-11 items-center justify-center border-2 px-3 text-xs font-bold"
            >
              {i + 1}
            </Link>
          ))}
      </nav>
    </>
  );
}
