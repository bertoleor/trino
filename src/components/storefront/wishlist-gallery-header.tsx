import { ArrowRight, Heart, Share2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function WishlistGalleryHeader({
  locale,
  title,
  total,
}: {
  locale: string;
  title: string;
  total: number;
}) {
  const t = await getTranslations({ locale, namespace: 'institucional.wishlist' });

  return (
    <>
      <nav
        data-purpose="wishlist-gallery-breadcrumb"
        aria-label={t('breadcrumb.current')}
        className="font-body col-span-12 flex flex-wrap items-center gap-2 text-sm"
      >
        <Link href={`/${locale}`} className="text-cobalt underline-offset-2 hover:underline">
          {t('breadcrumb.home')}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-label text-xs font-bold uppercase">
          {t('breadcrumb.current')}
        </span>
      </nav>

      <section
        data-purpose="wishlist-gallery-hero"
        aria-labelledby="wishlist-gallery-title"
        className="border-ink bg-cream shadow-pop rounded-card col-span-12 border-[3px] p-6 sm:p-8 lg:p-10"
      >
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-label border-ink bg-pink text-ink shadow-pop-sm rounded-control inline-flex items-center gap-2 border-2 px-3 py-2 text-[10px] font-bold uppercase">
                <Heart aria-hidden="true" className="h-4 w-4" />
                {t('hero.badgeSaved')}
              </span>
              <span className="font-label border-ink bg-aqua text-ink shadow-pop-sm rounded-control inline-flex items-center gap-2 border-2 px-3 py-2 text-[10px] font-bold uppercase">
                <Share2 aria-hidden="true" className="h-4 w-4" />
                {t('hero.badgeShared')}
              </span>
              <span className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control border-2 px-3 py-2 text-[10px] font-bold uppercase">
                {t('hero.badgeNote')}
              </span>
            </div>
            <h1
              id="wishlist-gallery-title"
              className="font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl"
            >
              {title} <span className="text-pink">{t('hero.titleAccent')}</span>
            </h1>
            <p className="font-body max-w-2xl text-sm leading-relaxed">{t('hero.description')}</p>
          </div>
          <div className="flex gap-3 lg:col-span-4">
            <div className="border-ink bg-lilac shadow-pop-sm rounded-card flex-1 border-2 p-4">
              <p className="font-label text-[10px] font-bold uppercase">{t('hero.counterLabel')}</p>
              <p className="font-display mt-1 text-2xl font-semibold">{total}</p>
            </div>
            <div className="border-ink bg-lemon shadow-pop-sm rounded-card flex-1 border-2 p-4">
              <p className="font-label text-[10px] font-bold uppercase">{t('hero.counterUnit')}</p>
              <p className="font-body mt-2 text-xs">{t('hero.updated')}</p>
            </div>
          </div>
        </div>
      </section>

      <div
        data-purpose="wishlist-gallery-toolbar"
        className="border-ink bg-cream shadow-pop rounded-card col-span-12 flex flex-wrap items-center justify-between gap-4 border-[3px] p-4"
      >
        <span className="font-label border-ink bg-ink text-cream shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase">
          <ShoppingBag aria-hidden="true" className="h-4 w-4" />
          {t('toolbar.count', { count: total })}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/tienda`}
            className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            {t('toolbar.browse')}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
