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
    <section aria-label={tStore('footer.servicesTitle')} className="col-span-full px-6">
      <ul className="border-ink flex flex-wrap gap-3 border-y-[3px] py-4">
        {trust.map((item) => (
          <li
            key={item.label}
            className="border-ink bg-cream shadow-pop-sm flex items-center gap-2 border-[3px] px-3 py-2 text-sm font-semibold"
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
  const tones = ['bg-cream', 'bg-pink', 'bg-aqua', 'bg-lemon'];
  return (
    <section id="marcas" className="col-span-full border-ink border-b-[3px] px-6 pb-12">
      <p className="font-display border-ink bg-lilac shadow-pop-sm inline-block border-2 px-3 py-1 text-sm font-bold uppercase">
        {t('brands.eyebrow')}
      </p>
      <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">{t('brands.title')}</h2>
      <p className="font-body mt-3 max-w-2xl">{t('brands.body')}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_BRANDS.map((brand, index) => (
          <Link
            key={brand.name}
            href={`/${locale}/tienda?brand=${encodeURIComponent(brand.query)}`}
            className={`border-ink shadow-pop flex h-44 flex-col justify-between border-[3px] p-4 transition-transform hover:-translate-y-1 ${tones[index % tones.length]}`}
          >
            <span className="flex items-center justify-between">
              <span className="border-ink bg-ink text-cream border-2 px-2 py-0.5 text-[10px] font-bold uppercase">
                {String(index + 1).padStart(2, '0')}
              </span>
              <ArrowRight aria-hidden="true" />
            </span>
            <span>
              <span className="font-display block text-2xl font-semibold uppercase">{brand.name}</span>
              <span className="font-body mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                {t('brands.available')}
                <ArrowRight aria-hidden="true" />
              </span>
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
  const tStore = await getTranslations({ locale, namespace: 'storefront' });
  const filters = [
    { key: 'nav.drops', href: `/${locale}/tienda` },
    { key: 'nav.lips', href: `/${locale}/tienda?category=labios` },
    { key: 'nav.face', href: `/${locale}/tienda?category=rostro` },
    { key: 'nav.catalog', href: `/${locale}/tienda` },
  ];
  return (
    <section id="drops" className="col-span-full border-ink border-b-[3px] px-6 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display border-ink bg-lemon shadow-pop-sm inline-block border-2 px-3 py-1 text-sm font-bold uppercase">
            {t('featured.eyebrow')}
          </p>
          <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">
            {t('featured.title')}
          </h2>
        </div>
        <ul className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <li key={filter.key}>
              <Link
                href={filter.href}
                className="border-ink bg-cream shadow-pop-sm inline-flex min-h-11 items-center px-4 text-xs font-bold uppercase"
              >
                {tStore(filter.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
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
