import { CircleHelp, CreditCard, FileText, Link2, Search } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const TILES = [
  {
    tone: 'bg-lemon',
    labelKey: 'tiles.holder.label',
    valueKey: 'tiles.holder.value',
    hintKey: 'tiles.holder.hint',
  },
  {
    tone: 'bg-lemon',
    labelKey: 'tiles.method.label',
    valueKey: 'tiles.method.value',
    hintKey: 'tiles.method.hint',
  },
  {
    tone: 'bg-lemon',
    labelKey: 'tiles.detail.label',
    valueKey: 'tiles.detail.value',
    hintKey: 'tiles.detail.hint',
  },
] as const;

export async function TransferenciaData({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'transferencia.data' });

  return (
    <section
      data-purpose="transferencia-payment-data"
      aria-labelledby="transferencia-data-title"
      className="border-ink bg-cream shadow-pop flex flex-col gap-5 border-[3px] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="border-ink bg-lemon shadow-pop-sm flex h-12 w-12 shrink-0 items-center justify-center border-2">
            <CreditCard aria-hidden="true" className="text-ink h-6 w-6" />
          </span>
          <h2
            id="transferencia-data-title"
            className="font-display text-xl font-semibold uppercase"
          >
            {t('title')}
          </h2>
        </div>
        <span className="font-label border-ink bg-cream text-ink border-2 px-2 py-1 text-[10px] font-bold uppercase">
          {t('tag')}
        </span>
      </div>

      <div className="border-ink bg-lemon shadow-pop flex flex-col gap-3 border-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-label text-ink block text-[10px] font-bold tracking-wide uppercase">
            {t('primaryLabel')}
          </span>
          <span className="font-display text-ink block text-xl font-semibold uppercase">
            {t('primaryValue')}
          </span>
        </div>
        <Link
          href={`/${locale}/contacto`}
          aria-label={t('primaryAction')}
          className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-[10px] font-bold uppercase"
        >
          <Link2 aria-hidden="true" className="h-4 w-4" />
          {t('primaryAction')}
        </Link>
      </div>

      <div className="border-ink bg-cream shadow-pop-sm flex flex-col gap-3 border-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-label text-ink block text-[10px] font-bold uppercase">
            {t('secondaryLabel')}
          </span>
          <span className="font-label text-ink block text-xs font-bold">{t('secondaryValue')}</span>
        </div>
        <Link
          href={`/${locale}/checkout/pago`}
          aria-label={t('secondaryAction')}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-[10px] font-bold uppercase"
        >
          <CircleHelp aria-hidden="true" className="h-4 w-4" />
          {t('secondaryAction')}
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <li key={tile.labelKey} className={`border-ink ${tile.tone} border-2 p-3`}>
            <span className="font-label text-ink block text-[10px] font-bold uppercase">
              {t(tile.labelKey)}
            </span>
            <span className="font-display text-ink mt-2 block text-sm font-semibold">
              {t(tile.valueKey)}
            </span>
            <span className="font-body mt-1 block text-[11px]">{t(tile.hintKey)}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/${locale}/contacto`}
        aria-label={t('allAction')}
        className="font-label border-ink bg-pink text-ink shadow-pop inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
      >
        <FileText aria-hidden="true" className="h-4 w-4" />
        {t('allAction')}
      </Link>
      <p className="font-body text-ink flex items-center gap-2 text-[11px]">
        <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
        {t('note')}
      </p>
    </section>
  );
}
