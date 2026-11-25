import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function PaymentRejected({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkout.rejected' });

  return (
    <section
      aria-labelledby="checkout-rejected-title"
      className="border-ink bg-cream shadow-pop flex flex-col gap-6 border-[3px] p-6"
    >
      <div className="border-ink flex items-center gap-4 border-b-[3px] pb-4">
        <span className="border-ink bg-lemon flex h-12 w-12 shrink-0 items-center justify-center border-2">
          <AlertTriangle aria-hidden="true" className="text-ink h-7 w-7" />
        </span>
        <div>
          <h1 id="checkout-rejected-title" className="font-display text-2xl font-semibold">
            {t('hero.title')}
          </h1>
          <p className="font-body mt-1 text-sm">{t('hero.description')}</p>
        </div>
      </div>

      <div className="border-ink bg-cream flex flex-col gap-3 border-2 p-4">
        <p className="font-label text-ink text-xs font-bold uppercase">{t('details.title')}</p>
        <p className="font-body text-sm">{t('details.description')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${locale}/checkout/pago`}
          className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-12 flex-1 items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          {t('actions.retry')}
        </Link>
        <Link
          href={`/${locale}/tienda`}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm inline-flex min-h-12 flex-1 items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t('actions.catalog')}
        </Link>
      </div>

      <p className="font-body text-sm">{t('note')}</p>
    </section>
  );
}
