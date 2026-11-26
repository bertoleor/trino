import { Clock, Package, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function TransferenciaSummary({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'transferencia.summary' });

  return (
    <section
      data-purpose="transferencia-summary"
      aria-labelledby="transferencia-summary-title"
      className="border-ink bg-cream shadow-pop flex flex-col gap-5 border-[3px] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-label text-ink block text-[10px] font-bold tracking-wide uppercase">
            {t('label')}
          </span>
          <h2
            id="transferencia-summary-title"
            className="font-display text-sm font-semibold uppercase"
          >
            {t('title')}
          </h2>
        </div>
        <span className="font-label border-ink bg-lemon text-ink shadow-pop-sm flex items-center gap-1 border-2 px-2 py-1 text-[10px] font-bold uppercase">
          <Clock aria-hidden="true" className="h-3 w-3" />
          {t('badge')}
        </span>
      </div>

      <dl className="border-ink bg-lemon shadow-pop-sm flex flex-col gap-2 border-2 p-4 text-sm">
        <div className="font-body flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2">
            <Package aria-hidden="true" className="text-ink h-4 w-4" />
            {t('rows.products')}
          </dt>
          <dd className="font-label text-ink text-[10px] font-bold">{t('rows.catalog')}</dd>
        </div>
        <div className="font-body flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2">
            <Tag aria-hidden="true" className="text-ink h-4 w-4" />
            {t('rows.priceDetail')}
          </dt>
          <dd className="font-label text-ink text-[10px] font-bold">{t('rows.pending')}</dd>
        </div>
        <div className="font-body flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2">
            <ShoppingBag aria-hidden="true" className="text-ink h-4 w-4" />
            {t('rows.delivery')}
          </dt>
          <dd className="font-label text-ink text-[10px] font-bold">{t('rows.perOption')}</dd>
        </div>
      </dl>

      <div className="border-ink bg-ink text-cream shadow-pop flex flex-col gap-2 border-[3px] p-4">
        <span className="font-label text-cream text-[10px] font-bold tracking-wide uppercase">
          {t('total.label')}
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-2xl font-semibold uppercase">{t('total.value')}</span>
          <Link
            href={`/${locale}/tienda`}
            aria-label={t('total.action')}
            className="font-label border-ink bg-cream text-ink shadow-pop-sm inline-flex min-h-11 items-center border-2 px-3 text-[10px] font-bold uppercase"
          >
            {t('total.action')}
          </Link>
        </div>
        <p className="font-body text-[11px]">{t('total.note')}</p>
      </div>
    </section>
  );
}
