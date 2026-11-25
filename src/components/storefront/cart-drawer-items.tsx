'use client';

import type { CartRecommendation, CartViewItem } from '@/lib/db/cart-view';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPriceARS } from '@/lib/money/format-price-ars';
import { useTranslations } from 'next-intl';

function ItemRow({ item, locale }: { item: CartViewItem; locale: string }) {
  const t = useTranslations('cart.drawer.item');
  return (
    <li className="border-ink bg-cream flex gap-3 border-2 p-3">
      <div className="border-ink bg-cream relative h-20 w-20 shrink-0 overflow-hidden border-2">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display truncate font-semibold">{item.name}</p>
            <p className="font-label text-ink text-xs font-bold uppercase">
              {t('variant', { variant: item.variantName })}
            </p>
          </div>
          <Link
            href={`/${locale}/producto/${item.slug}`}
            className="font-label text-ink shrink-0 text-xs font-bold uppercase underline-offset-2 hover:underline"
          >
            {t('view')}
          </Link>
        </div>
        <div className="font-label mt-2 flex items-center justify-between gap-2 text-xs font-bold">
          <span>{t('quantity', { quantity: item.quantity })}</span>
          <data value={(item.priceCents * item.quantity) / 100} className="font-display text-base">
            {formatPriceARS((item.priceCents * item.quantity) / 100, locale)}
          </data>
        </div>
      </div>
    </li>
  );
}

function EmptyState({ locale }: { locale: string }) {
  const t = useTranslations('cart.drawer.empty');
  return (
    <div className="border-ink bg-lemon shadow-pop flex flex-col items-start gap-4 border-[3px] p-5">
      <h3 className="font-display text-xl font-semibold">{t('title')}</h3>
      <p className="font-body text-sm">{t('body')}</p>
      <Link
        href={`/${locale}/tienda`}
        className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
      >
        {t('action')}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function CartItemList({ items, locale }: { items: CartViewItem[]; locale: string }) {
  if (items.length === 0) return <EmptyState locale={locale} />;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} locale={locale} />
      ))}
    </ul>
  );
}

export function CartRecommendations({
  items,
  locale,
}: {
  items: CartRecommendation[];
  locale: string;
}) {
  const t = useTranslations('cart.drawer.recommendations');
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="cart-drawer-recommendations" className="pt-2">
      <h3 id="cart-drawer-recommendations" className="font-display text-base font-semibold">
        {t('title')}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((product) => (
          <li key={product.id}>
            <Link
              href={`/${locale}/producto/${product.slug}`}
              className="border-ink shadow-pop-sm flex items-center gap-3 border-2 p-2"
            >
              <span className="border-ink bg-cream relative h-12 w-12 shrink-0 overflow-hidden border-2">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block truncate text-sm font-semibold">
                  {product.name}
                </span>
                <data value={product.priceCents / 100} className="font-body text-xs">
                  {formatPriceARS(product.priceCents / 100, locale)}
                </data>
              </span>
              <span className="font-label text-ink shrink-0 text-xs font-bold uppercase">
                {t('view')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
