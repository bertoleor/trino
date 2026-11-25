'use client';

import { ArrowRight, CreditCard, Landmark, Wallet } from 'lucide-react';
import { PaymentCardPreview } from '@/components/storefront/payment-card-preview';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type PaymentMethod = 'card' | 'transfer' | 'wallet';

export function PaymentMethods() {
  const t = useTranslations('checkout.payment');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const options = [
    {
      id: 'card' as const,
      icon: CreditCard,
      label: t('methods.card'),
      hint: t('methods.cardHint'),
    },
    {
      id: 'transfer' as const,
      icon: Landmark,
      label: t('methods.transfer'),
      hint: t('methods.transferHint'),
    },
    {
      id: 'wallet' as const,
      icon: Wallet,
      label: t('methods.wallet'),
      hint: t('methods.walletHint'),
    },
  ];

  return (
    <section
      aria-labelledby="payment-methods-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <h1 id="payment-methods-title" className="font-display text-3xl font-semibold">
        {t('hero.title')}
      </h1>
      <p className="font-body mt-2 text-sm">{t('hero.description')}</p>

      <fieldset className="mt-5">
        <legend className="font-label text-ink mb-3 text-xs font-bold uppercase">
          {t('methods.legend')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map(({ id, icon: Icon, label, hint }) => (
            <label
              key={id}
              className={cn(
                'border-ink shadow-pop-sm flex min-h-28 cursor-pointer flex-col gap-2 border-2 p-3',
                method === id ? 'bg-lemon' : 'bg-cream'
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={id}
                checked={method === id}
                onChange={() => setMethod(id)}
                className="sr-only"
              />
              <Icon aria-hidden="true" className="text-ink h-6 w-6" />
              <span className="font-label text-ink text-xs font-bold uppercase">{label}</span>
              <span className="font-body text-xs">{hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        {method === 'card' ? (
          <PaymentCardPreview />
        ) : (
          <p className="border-ink bg-lemon shadow-pop-sm border-[3px] p-5 text-sm">
            {method === 'transfer' ? t('transferNote') : t('walletNote')}
          </p>
        )}
      </div>

      <div className="border-ink mt-6 flex flex-col gap-2 border-t-[3px] pt-5">
        <button
          type="button"
          disabled
          aria-describedby="payment-submit-note"
          className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-14 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase opacity-60"
        >
          {t('submit')}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
        <p id="payment-submit-note" className="font-body text-xs opacity-70">
          {t('submitNote')}
        </p>
      </div>
    </section>
  );
}
