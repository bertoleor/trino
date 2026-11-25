'use client';

import { useTranslations } from 'next-intl';

export function PaymentCardPreview() {
  const t = useTranslations('checkout.payment.card');

  return (
    <div className="border-ink bg-aqua shadow-pop-sm border-[3px] p-5">
      <p className="font-label text-ink text-xs font-bold uppercase">{t('previewLabel')}</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="border-ink bg-cream flex h-36 w-full max-w-60 shrink-0 flex-col justify-between border-2 p-4">
          <span className="font-display text-lg font-semibold">
            trino<span className="text-cobalt">.</span>
          </span>
          <span className="font-display tracking-widest" aria-hidden="true">
            •••• •••• •••• ••••
          </span>
          <span className="font-label flex justify-between text-[10px] font-bold uppercase">
            <span>{t('holder')}</span>
            <span>{t('expiry')}</span>
          </span>
        </div>
        <dl className="flex flex-1 flex-col gap-3">
          <div>
            <dt className="font-label text-ink text-[11px] font-bold uppercase">{t('number')}</dt>
            <dd className="border-ink bg-cream font-display mt-1 flex min-h-11 items-center border-2 px-3 tracking-widest">
              <span aria-hidden="true">•••• •••• •••• ••••</span>
            </dd>
          </div>
          <div>
            <dt className="font-label text-ink text-[11px] font-bold uppercase">{t('name')}</dt>
            <dd className="border-ink bg-cream mt-1 flex min-h-11 items-center border-2 px-3">
              <span aria-hidden="true">••••••••••••</span>
            </dd>
          </div>
        </dl>
      </div>
      <p className="font-body mt-4 text-xs">{t('note')}</p>
    </div>
  );
}
