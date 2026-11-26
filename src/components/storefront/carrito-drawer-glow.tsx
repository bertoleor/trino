import { ArrowRight } from 'lucide-react';
import type { CartView } from '@/lib/db/cart-view';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatPriceARS } from '@/lib/money/format-price-ars';
import { getTranslations } from 'next-intl/server';

const BOX = 'border-ink bg-cream shadow-pop border-[3px]';
const BTN =
  'font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-12 items-center justify-center gap-2 border-2 px-5 text-xs font-bold uppercase';
const LABEL = 'font-label text-ink text-xs font-bold uppercase';

function Thumb({ src, alt, size }: { src: string | null; alt: string; size: 48 | 80 }) {
  return (
    <span
      className={`border-ink bg-cream relative shrink-0 overflow-hidden border-2 ${
        size === 80 ? 'h-20 w-20' : 'h-12 w-12'
      }`}
    >
      {src ? <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" /> : null}
    </span>
  );
}

export async function CarritoDrawerGlow({ locale, view }: { locale: string; view: CartView }) {
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.carritoDrawer' });
  const count = view.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = view.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <>
      <section
        data-purpose="carrito-drawer-panel"
        aria-labelledby="carrito-drawer-titulo"
        className={`${BOX} col-span-12 flex flex-col lg:col-span-8`}
      >
        <header className="border-ink bg-ink text-cream flex items-center justify-between gap-3 border-b-[3px] p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag aria-hidden="true" className="h-6 w-6" />
            <h1 id="carrito-drawer-titulo" className="font-display text-2xl font-semibold">
              {t('title')}
            </h1>
          </div>
          <span className="font-label border-ink bg-lemon text-ink border-2 px-3 py-1 text-[10px] font-black uppercase">
            {t('count', { count })}
          </span>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-5">
          {view.items.length === 0 ? (
            <div className="border-ink bg-lemon shadow-pop flex flex-col items-start gap-4 border-[3px] p-5">
              <h2 className="font-display text-xl font-semibold">{t('emptyTitle')}</h2>
              <p className="font-body text-sm">{t('emptyBody')}</p>
              <Link
                href={`/${locale}/tienda`}
                className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
              >
                {t('emptyAction')}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {view.items.map((item) => {
                const lineTotal = (item.priceCents * item.quantity) / 100;
                return (
                  <li key={item.id} className="border-ink bg-cream flex gap-3 border-2 p-3">
                    <Thumb src={item.imageUrl} alt={item.name} size={80} />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display truncate font-semibold">{item.name}</h2>
                      <p className={LABEL}>{t('itemVariant', { variant: item.variantName })}</p>
                      <p className={LABEL}>{t('itemQuantity', { quantity: item.quantity })}</p>
                      <data value={lineTotal} className="font-display mt-2 block text-base">
                        {formatPriceARS(lineTotal, locale)}
                      </data>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <aside
        data-purpose="carrito-drawer-resumen"
        aria-labelledby="carrito-drawer-resumen-titulo"
        className="col-span-12 flex flex-col gap-4 lg:col-span-4"
      >
        <div className="border-ink bg-lilac shadow-pop border-[3px] p-5">
          <h2 id="carrito-drawer-resumen-titulo" className="font-display text-xl font-semibold">
            {t('subtotal')}
          </h2>
          <data value={subtotal / 100} className="font-display block text-3xl font-semibold">
            {formatPriceARS(subtotal / 100, locale)}
          </data>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/${locale}/checkout`} className={BTN}>
              {t('checkout')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/tienda`}
              className="font-label border-ink bg-cream shadow-pop-sm inline-flex min-h-11 items-center justify-center gap-2 border-2 px-5 text-xs font-bold uppercase"
            >
              {t('continue')}
            </Link>
          </div>
          <p className="font-body mt-3 text-xs">{t('note')}</p>
        </div>
      </aside>

      {view.recommendations.length > 0 ? (
        <section
          data-purpose="carrito-drawer-recomendados"
          aria-labelledby="carrito-drawer-recomendados-titulo"
          className={`${BOX} col-span-12 p-5`}
        >
          <h2
            id="carrito-drawer-recomendados-titulo"
            className="font-display text-lg font-semibold"
          >
            {t('recommendationsTitle')}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {view.recommendations.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${locale}/producto/${item.slug}`}
                  className="border-ink shadow-pop-sm flex items-center gap-3 border-2 p-2"
                >
                  <Thumb src={item.imageUrl} alt={item.name} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="font-display block truncate text-sm font-semibold">
                      {item.name}
                    </span>
                    <data value={item.priceCents / 100} className="font-body text-xs">
                      {formatPriceARS(item.priceCents / 100, locale)}
                    </data>
                  </span>
                  <span className={LABEL}>{t('viewProduct')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
