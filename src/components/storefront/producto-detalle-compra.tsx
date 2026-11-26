import { Heart } from 'lucide-react';
import Link from 'next/link';
import { PriceBlock } from '@/components/storefront/price-block';
import { ShadeSwatch } from '@/components/storefront/shade-swatch';
import type { StorefrontProductDetail } from '@/components/storefront/storefront-product';
import { productoDetalleCopy } from './producto-detalle-copy';

export function ProductoDetalleCompra({
  locale,
  product,
  priceCents,
}: {
  locale: string;
  product: StorefrontProductDetail;
  priceCents: number;
}) {
  const copy = productoDetalleCopy(locale).purchase;
  const shade = product.shade?.replace(/^#/, '');
  const hasShade = shade ? /^[0-9a-f]{6}$/i.test(shade) : false;

  return (
    <div data-purpose="product-purchase" className="flex flex-col">
      <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
        {product.name}
      </h1>
      {product.description ? (
        <p className="font-body mt-4 max-w-xl">{product.description}</p>
      ) : null}
      <div className="border-ink bg-cream shadow-pop rounded-card mt-8 border-[3px] p-5">
        <p className="font-label text-xs font-bold tracking-wide uppercase">{copy.priceLabel}</p>
        <PriceBlock
          priceCents={priceCents}
          salePriceCents={product.sale_price_cents}
          locale={locale}
          className="mt-2 text-3xl"
        />
      </div>
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">{copy.shadeTitle}</h2>
        {hasShade && shade ? (
          <div className="mt-3 flex flex-wrap gap-3">
            <ShadeSwatch
              color={`#${shade}`}
              shadeLabel={`${copy.shadeTitle}: #${shade}`}
              selected
              disabled
            />
            <span className="font-label self-center text-xs font-bold uppercase">#{shade}</span>
          </div>
        ) : (
          <p className="font-body mt-2 text-sm">{copy.shadeMissing}</p>
        )}
      </section>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="font-label border-ink bg-ink text-cream shadow-pop-lg rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-sm font-bold uppercase"
        >
          {copy.addToBag}
        </button>
        <Link
          href={`/${locale}/wishlist`}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-4 text-sm font-bold uppercase"
        >
          <Heart aria-hidden="true" />
          {copy.save}
        </Link>
      </div>
      <p className="font-body mt-4 text-sm">{copy.note}</p>
    </div>
  );
}
