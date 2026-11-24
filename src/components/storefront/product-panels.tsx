import { ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { getTranslations } from 'next-intl/server';
import { priceInCents } from '@/components/storefront/storefront-product';

export async function ProductDetails({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'product' });
  const details = [
    { key: 'what', title: t('details.whatTitle'), body: t('details.what') },
    { key: 'how', title: t('details.howTitle'), body: t('details.how') },
    {
      key: 'ingredients',
      title: t('details.ingredientsTitle'),
      body: t('details.ingredients'),
    },
    { key: 'shipping', title: t('details.shippingTitle'), body: t('details.shipping') },
  ] as const;
  return (
    <section className="col-span-full">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t('details.title')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {details.map((item) => (
          <details key={item.key} className="border-ink bg-cream shadow-pop-sm border-2 p-5">
            <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold">
              {item.title}
              <ChevronDown aria-hidden="true" />
            </summary>
            <p className="font-body mt-4 text-sm">{item.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export async function RelatedProducts({
  locale,
  products,
}: {
  locale: string;
  products: StorefrontProductCardData[];
}) {
  const t = await getTranslations({ locale, namespace: 'product' });
  return (
    <section className="col-span-full">
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('related.eyebrow')}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('related.title')}</h2>
        <Link
          href={`/${locale}/tienda`}
          className="border-ink bg-cream shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 text-sm font-semibold"
        >
          {t('related.cta')}
        </Link>
      </div>
      {products.length === 0 ? (
        <EmptyState title={t('related.empty')} className="mt-8" />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              locale={locale}
              product={{
                name: product.name,
                slug: product.slug,
                imageUrl: product.image_url,
                priceCents: priceInCents(product),
                salePriceCents: product.sale_price_cents,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export async function ProductCommunity({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'product' });
  return (
    <section
      className="border-ink bg-cream shadow-pop-lg col-span-full border-2 p-8 sm:p-12"
      style={{
        backgroundImage: 'url(/brand/trino-pattern-dots.svg)',
        backgroundRepeat: 'repeat',
      }}
    >
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('community.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
        {t('community.title')}
      </h2>
      <p className="font-body mt-4 max-w-2xl">{t('community.body')}</p>
    </section>
  );
}
