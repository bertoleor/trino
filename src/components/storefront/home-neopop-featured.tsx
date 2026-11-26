import { ArrowRight, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { homeNeopopCopy } from './home-neopop-copy';
import { priceInCents } from '@/components/storefront/storefront-product';

const BRAND_TONES = ['bg-cream', 'bg-pink', 'bg-aqua', 'bg-lemon'];
const CHIP_PATHS = ['tienda', 'tienda?category=labios', 'tienda?category=rostro', 'tienda'];

export function HomeNeopopBrands({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).brands;

  return (
    <section
      data-purpose="home-brands"
      className="border-ink col-span-full border-b-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-label border-ink bg-lilac text-ink shadow-pop-sm rounded-control inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-display mt-4 text-3xl font-semibold uppercase sm:text-4xl">
          {copy.title}
        </h2>
        <p className="font-body mt-3 max-w-2xl">{copy.body}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {copy.items.map((brand, index) => (
            <Link
              key={brand.name}
              href={`/${locale}/tienda`}
              className={`border-ink shadow-pop rounded-card flex h-44 flex-col justify-between border-[3px] p-4 transition-transform hover:-translate-y-1 ${
                BRAND_TONES.at(index % BRAND_TONES.length) ?? 'bg-cream'
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="font-label border-ink bg-ink text-cream rounded-control border-2 px-2 py-0.5 text-[10px] font-bold uppercase">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <ArrowRight aria-hidden="true" />
              </span>
              <span>
                <span className="font-display block text-2xl font-semibold uppercase">
                  {brand.name}
                </span>
                <span className="font-body mt-3 block text-xs">{brand.detail}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeNeopopFeatured({
  locale,
  products,
}: {
  locale: string;
  products: StorefrontProductCardData[];
}) {
  const copy = homeNeopopCopy(locale).featured;

  return (
    <section
      id="drops"
      data-purpose="home-featured"
      className="border-ink col-span-full border-b-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {copy.chips.map((chip, index) => (
              <li key={chip}>
                <Link
                  href={`/${locale}/${CHIP_PATHS[index] ?? 'tienda'}`}
                  className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center border-2 px-4 text-xs font-bold uppercase"
                >
                  {chip}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {products.length === 0 ? (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyBody}
            icon={<Sparkles aria-hidden="true" />}
            className="mt-8"
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
