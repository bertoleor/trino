'use client';

import { ArrowRight, X } from 'lucide-react';
import { CartItemList, CartRecommendations } from '@/components/storefront/cart-drawer-items';
import type { CartView } from '@/lib/db/cart-view';
import Link from 'next/link';
import type { RefObject } from 'react';
import { formatPriceARS } from '@/lib/money/format-price-ars';
import { useTranslations } from 'next-intl';

function Summary({ view, locale }: { view: CartView; locale: string }) {
  const t = useTranslations('cart.drawer.summary');
  const total = view.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const amount = formatPriceARS(total / 100, locale);
  return (
    <div className="border-ink bg-cream shrink-0 border-t-4 p-5">
      <dl className="font-body space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt>{t('subtotal')}</dt>
          <dd className="font-bold">
            <data value={total / 100}>{amount}</data>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <dt className="font-display text-lg font-semibold">{t('total')}</dt>
          <dd className="font-display text-xl font-semibold">
            <data value={total / 100}>{amount}</data>
          </dd>
        </div>
      </dl>
      {view.items.length ? (
        <Link
          href={`/${locale}/checkout/pago`}
          className="font-label border-ink bg-ink text-cream shadow-pop-sm mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          {t('checkout')}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <p className="font-label border-ink bg-cream text-ink mt-4 flex min-h-14 items-center justify-center border-2 px-4 text-xs font-bold uppercase opacity-60">
          {t('checkoutEmpty')}
        </p>
      )}
    </div>
  );
}

export function CartDrawerPanel({
  locale,
  view,
  onClose,
  closeRef,
}: {
  locale: string;
  view: CartView;
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations('cart.drawer');
  return (
    <>
      <div className="border-ink bg-lemon flex shrink-0 items-center justify-between gap-3 border-b-4 px-5 py-4">
        <h2 id="cart-drawer-title" className="font-display text-2xl font-semibold">
          {t('title')}
        </h2>
        <button
          ref={closeRef}
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="border-ink bg-cream text-ink flex h-11 w-11 items-center justify-center border-2"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
        <CartItemList items={view.items} locale={locale} />
        <CartRecommendations items={view.recommendations} locale={locale} />
      </div>
      <Summary view={view} locale={locale} />
    </>
  );
}
