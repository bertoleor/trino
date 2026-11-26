import Link from 'next/link';
import { WishlistGalleryNotify } from '@/components/storefront/wishlist-gallery-notify';
import WishlistHeart from '@/components/shared/wishlist-heart';
import { getTranslations } from 'next-intl/server';

export interface WishlistEntry {
  id: string;
  product_id: string;
  created_at: string | null;
}

export async function WishlistGalleryGrid({
  locale,
  entries,
}: {
  locale: string;
  entries: WishlistEntry[];
}) {
  const t = await getTranslations({ locale, namespace: 'institucional.wishlist.grid' });

  return (
    <section
      data-purpose="wishlist-gallery-grid"
      aria-labelledby="wishlist-gallery-grid-title"
      className="col-span-12"
    >
      <h2 id="wishlist-gallery-grid-title" className="sr-only">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            data-purpose="wishlist-gallery-item"
            className="border-ink bg-cream shadow-pop rounded-card flex flex-col overflow-hidden border-[3px]"
          >
            <div className="border-ink bg-lilac relative aspect-square border-b-[3px]">
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <span className="font-display text-xl font-semibold break-words">
                  {entry.product_id}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <WishlistHeart productId={entry.product_id} initial />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="font-label text-[10px] font-bold tracking-widest uppercase">
                {t('referenceLabel')}
              </p>
              <p className="font-body text-sm break-words">{entry.product_id}</p>
              <div className="border-ink mt-auto flex items-center justify-between border-t-2 pt-3">
                <Link
                  href={`/${locale}/tienda`}
                  className="font-label bg-ink text-cream shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 px-4 text-[10px] font-bold uppercase"
                >
                  {t('browse')}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <WishlistGalleryNotify />
      </div>
    </section>
  );
}
