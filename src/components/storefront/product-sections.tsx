import { Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PriceBlock } from '@/components/storefront/price-block';
import { ShadeSwatch } from '@/components/storefront/shade-swatch';
import type { StorefrontProductDetail } from '@/components/storefront/storefront-product';
import { getTranslations } from 'next-intl/server';

export async function ProductBreadcrumb({ locale, name }: { locale: string; name: string }) {
  const t = await getTranslations({ locale, namespace: 'product' });
  return (
    <nav aria-label={t('breadcrumb.label')} className="font-body col-span-full text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/${locale}/tienda`}>{t('breadcrumb.shop')}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{name}</li>
      </ol>
    </nav>
  );
}

export async function ProductGallery({
  locale,
  product,
}: {
  locale: string;
  product: StorefrontProductDetail;
}) {
  const t = await getTranslations({ locale, namespace: 'product' });
  return (
    <div>
      {product.image_url ? (
        <div className="border-ink bg-cream shadow-pop-lg relative aspect-square w-full overflow-hidden border-2">
          <Image
            src={product.image_url}
            alt={t('gallery.mainAlt', { name: product.name })}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>
      ) : (
        <div className="border-ink bg-lilac shadow-pop-lg flex aspect-square flex-col items-center justify-center gap-3 border-2 p-8 text-center">
          <Sparkles aria-hidden="true" />
          <p className="font-display text-xl font-semibold">{t('gallery.empty')}</p>
          <p className="font-body text-sm">{t('gallery.emptyHint')}</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="border-ink bg-lemon shadow-pop-sm px-3 py-1 text-xs font-semibold uppercase">
          {t('badges.inStock')}
        </span>
        <span className="border-ink bg-cream shadow-pop-sm px-3 py-1 text-xs font-semibold uppercase">
          {t('badges.selected')}
        </span>
      </div>
    </div>
  );
}

export async function ProductPurchase({
  locale,
  product,
  priceCents,
}: {
  locale: string;
  product: StorefrontProductDetail;
  priceCents: number;
}) {
  const t = await getTranslations({ locale, namespace: 'product' });
  const shade = product.shade?.replace(/^#/, '');
  const hasShade = shade ? /^[0-9a-f]{6}$/i.test(shade) : false;
  return (
    <div>
      <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
        {product.name}
      </h1>
      {product.description ? (
        <p className="font-body mt-4 max-w-xl">{product.description}</p>
      ) : null}
      <div className="mt-8">
        <p className="font-body text-sm font-semibold uppercase">{t('purchase.priceLabel')}</p>
        <PriceBlock
          priceCents={priceCents}
          salePriceCents={product.sale_price_cents}
          locale={locale}
          className="mt-2 text-3xl"
        />
        <p className="font-body mt-2 text-sm font-semibold">{t('purchase.installments')}</p>
      </div>
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">{t('shade.title')}</h2>
        {hasShade ? (
          <div className="mt-3">
            <ShadeSwatch
              color={`#${shade}`}
              shadeLabel={`${t('shade.title')}: #${shade}`}
              selected
              disabled
            />
          </div>
        ) : (
          <p className="font-body mt-2 text-sm">{t('shade.none')}</p>
        )}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="border-ink bg-ink text-cream shadow-pop-lg inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
        >
          {t('purchase.addToBag')}
        </button>
        <Link
          href={`/${locale}/wishlist`}
          className="border-ink bg-cream text-ink shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 font-semibold"
        >
          <Heart aria-hidden="true" />
          {t('purchase.save')}
        </Link>
      </div>
      <p id="shipping-note" className="font-body mt-4 text-sm">
        {t('purchase.shippingNote')}
      </p>
    </div>
  );
}
