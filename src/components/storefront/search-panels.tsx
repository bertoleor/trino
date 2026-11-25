import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { getTranslations } from 'next-intl/server';
import { priceInCents } from '@/components/storefront/storefront-product';

export async function SearchBreadcrumb({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <nav
      aria-label={t('breadcrumb.results')}
      className="text-ink col-span-full px-6 pt-2 text-xs font-semibold uppercase"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={`/${locale}`} className="underline-offset-2 hover:underline">
            {t('breadcrumb.home')}
          </Link>
        </li>
        <li aria-hidden="true">✦</li>
        <li>
          <Link href={`/${locale}/tienda`} className="underline-offset-2 hover:underline">
            {t('breadcrumb.catalog')}
          </Link>
        </li>
        <li aria-hidden="true">✦</li>
        <li className="border-ink bg-lemon shadow-pop-sm border-2 px-2 py-0.5 font-bold">
          {t('breadcrumb.results')}
        </li>
      </ol>
    </nav>
  );
}

export async function SearchRequest({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <div className="border-ink bg-aqua/20 shadow-pop flex w-full flex-col gap-4 border-[3px] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="border-ink bg-aqua flex h-12 w-12 shrink-0 items-center justify-center border-2">
          <Sparkles aria-hidden="true" className="text-ink h-6 w-6" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold sm:text-xl">{t('request.title')}</h2>
          <p className="font-body mt-1 text-sm">{t('request.description')}</p>
        </div>
      </div>
      <Link
        href={`/${locale}#contacto`}
        className="font-label border-ink bg-lemon text-ink shadow-pop-sm inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border-2 px-5 text-xs font-bold uppercase"
      >
        {t('request.action')}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}

export async function SearchRecommendations({
  locale,
  products,
}: {
  locale: string;
  products: StorefrontProductCardData[];
}) {
  if (products.length === 0) return null;
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <section
      aria-labelledby="search-recommendations-title"
      className="border-ink col-span-full border-t-[3px] px-6 py-10"
    >
      <div className="border-ink flex flex-col gap-2 border-b-[3px] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-label text-ink text-xs font-bold uppercase">
            {t('recommendations.eyebrow')}
          </p>
          <h2
            id="search-recommendations-title"
            className="font-display mt-2 text-2xl font-semibold sm:text-4xl"
          >
            {t('recommendations.title')}
          </h2>
        </div>
        <Link
          href={`/${locale}/tienda`}
          className="font-label text-ink inline-flex items-center gap-1 text-xs font-bold uppercase hover:underline"
        >
          {t('recommendations.viewAll')}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={{
              name: product.name,
              slug: product.slug,
              imageUrl: product.image_url,
              priceCents: priceInCents(product),
              salePriceCents: product.sale_price_cents,
            }}
            locale={locale}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
