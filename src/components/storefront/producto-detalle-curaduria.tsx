import { ArrowRight, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { priceInCents } from '@/components/storefront/storefront-product';
import { productoDetalleCopy } from './producto-detalle-copy';

export function ProductoDetalleBundle({ locale }: { locale: string }) {
  const copy = productoDetalleCopy(locale).bundle;

  return (
    <section
      data-purpose="product-guide"
      className="border-ink bg-lemon rounded-card col-span-full border-y-[3px] px-4 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-label text-ink text-xs font-bold tracking-wider uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
        <p className="font-body mt-2 max-w-2xl">{copy.body}</p>
        <div className="border-ink bg-cream shadow-pop rounded-card mt-8 grid grid-cols-1 gap-6 border-[3px] p-6 lg:grid-cols-12 lg:items-center">
          <p className="font-display text-2xl font-semibold lg:col-span-3">{copy.title}</p>
          <span
            aria-hidden="true"
            className="text-cobalt hidden justify-center lg:col-span-1 lg:flex"
          >
            <ArrowRight />
          </span>
          <ol className="font-body grid gap-2 text-sm lg:col-span-4">
            {copy.steps.map((step, index) => (
              <li key={step}>
                <span className="font-label text-cobalt mr-2 font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="font-body border-ink text-sm lg:col-span-4 lg:border-l-2 lg:pl-6">
            {copy.body}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProductoDetalleCompatibles({
  locale,
  products,
}: {
  locale: string;
  products: StorefrontProductCardData[];
}) {
  const copy = productoDetalleCopy(locale).compatible;

  return (
    <section data-purpose="product-related" className="col-span-full px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="font-label text-cobalt text-xs font-bold tracking-wider uppercase">
          {copy.eyebrow}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
          <Link
            href={`/${locale}/tienda`}
            className="border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-sm font-bold"
          >
            {copy.cta}
            <ArrowRight aria-hidden="true" />
          </Link>
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
