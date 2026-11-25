import type { CartView, CartViewItem } from '@/lib/db/cart-view';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatPriceARS } from '@/lib/money/format-price-ars';
import { getTranslations } from 'next-intl/server';

function SummaryItem({
  item,
  locale,
  variantLabel,
  quantityLabel,
}: {
  item: CartViewItem;
  locale: string;
  variantLabel: string;
  quantityLabel: string;
}) {
  return (
    <li className="border-ink bg-cream flex gap-3 border-2 p-3">
      <div className="border-ink bg-cream relative h-16 w-16 shrink-0 overflow-hidden border-2">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-sm font-semibold">{item.name}</p>
        <p className="font-label text-ink truncate text-[11px] font-bold uppercase">
          {variantLabel}
        </p>
        <div className="font-label mt-1 flex items-center justify-between gap-2 text-[11px] font-bold">
          <span>{quantityLabel}</span>
          <data value={(item.priceCents * item.quantity) / 100} className="font-display text-sm">
            {formatPriceARS((item.priceCents * item.quantity) / 100, locale)}
          </data>
        </div>
      </div>
    </li>
  );
}

export async function CheckoutSummary({ locale, view }: { locale: string; view: CartView }) {
  const t = await getTranslations({ locale, namespace: 'checkout.payment.summary' });
  const tItem = await getTranslations({ locale, namespace: 'cart.drawer.item' });
  const total = view.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <section
      aria-labelledby="checkout-summary-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <div className="border-ink flex items-center justify-between gap-3 border-b-[3px] pb-3">
        <h2 id="checkout-summary-title" className="font-display text-xl font-semibold">
          {t('title')}
        </h2>
        <span className="font-label border-ink bg-lemon border-2 px-2 py-1 text-xs font-bold">
          {t('count', { count: view.items.length })}
        </span>
      </div>

      {view.items.length ? (
        <>
          <ul className="mt-4 space-y-3">
            {view.items.map((item) => (
              <SummaryItem
                key={item.id}
                item={item}
                locale={locale}
                variantLabel={tItem('variant', { variant: item.variantName })}
                quantityLabel={tItem('quantity', { quantity: item.quantity })}
              />
            ))}
          </ul>
          <dl className="border-ink mt-5 flex items-baseline justify-between gap-3 border-t-[3px] pt-4">
            <dt className="font-display text-lg font-semibold">{t('total')}</dt>
            <dd className="font-display text-2xl font-semibold">
              <data value={total / 100}>{formatPriceARS(total / 100, locale)}</data>
            </dd>
          </dl>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-4">
          <ShoppingBag aria-hidden="true" className="text-ink h-8 w-8" />
          <p className="font-body text-sm">{t('empty')}</p>
          <Link
            href={`/${locale}/tienda`}
            className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center border-2 px-4 text-xs font-bold uppercase"
          >
            {t('browse')}
          </Link>
        </div>
      )}
    </section>
  );
}
