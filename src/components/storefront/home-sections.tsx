import { ArrowRight, CreditCard, MapPin, PackageCheck, Sparkles, Truck } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import { HOME_BRANDS } from '@/components/storefront/home-brands';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { getTranslations } from 'next-intl/server';
import { priceInCents } from '@/components/storefront/storefront-product';

export async function HomeTrust({ locale }: { locale: string }) {
  const tStore = await getTranslations({ locale, namespace: 'storefront' });
  const trust = [
    { label: tStore('trust.shipping.label'), icon: <Truck aria-hidden="true" /> },
    { label: tStore('trust.pickup.label'), icon: <MapPin aria-hidden="true" /> },
    { label: tStore('trust.packaging.label'), icon: <PackageCheck aria-hidden="true" /> },
    { label: tStore('trust.installments.label'), icon: <CreditCard aria-hidden="true" /> },
  ];
  return (
    <section aria-label={tStore('footer.servicesTitle')} className="col-span-full">
      <ul className="border-ink flex flex-wrap gap-3 border-y-2 py-4">
        {trust.map((item) => (
          <li
            key={item.label}
            className="border-ink bg-cream shadow-pop-sm flex items-center gap-2 border-2 px-3 py-2 text-sm font-semibold"
          >
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function HomeBrands({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <section className="col-span-full">
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('brands.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{t('brands.title')}</h2>
      <p className="font-body mt-3 max-w-2xl">{t('brands.body')}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/${locale}/tienda?brand=${encodeURIComponent(brand.query)}`}
            className="border-ink bg-cream hover:shadow-pop p-6 transition-shadow"
          >
            <h3 className="font-display text-2xl font-semibold">{brand.name}</h3>
            <span className="font-body mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              {t('brands.available')}
              <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function HomeFeatured({
  locale,
  products,
}: {
  locale: string;
  products: StorefrontProductCardData[];
}) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <section className="col-span-full">
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('featured.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
        {t('featured.title')}
      </h2>
      {products.length === 0 ? (
        <EmptyState
          title={t('featured.emptyTitle')}
          description={t('featured.emptyBody')}
          icon={<Sparkles aria-hidden="true" />}
          className="mt-8"
        />
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
