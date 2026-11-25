'use client';

import { Mail, PackageCheck, Store, Truck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Method = 'home' | 'pickup' | 'post';

const METHODS: { id: Method; icon: typeof Truck }[] = [
  { id: 'home', icon: Truck },
  { id: 'pickup', icon: Store },
  { id: 'post', icon: Mail },
];

export function DeliveryOptions({ locale }: { locale: string }) {
  const t = useTranslations('checkout.delivery');
  const [method, setMethod] = useState<Method>('home');
  const [slot, setSlot] = useState<'afternoon' | 'evening'>('afternoon');

  return (
    <section
      aria-labelledby="checkout-delivery-title"
      className="border-ink bg-cream shadow-pop flex flex-col gap-6 border-[3px] p-6"
    >
      <div className="border-ink flex items-center justify-between gap-3 border-b-[3px] pb-4">
        <div>
          <h1 id="checkout-delivery-title" className="font-display text-2xl font-semibold">
            {t('hero.title')}
          </h1>
          <p className="font-body mt-1 text-sm">{t('hero.description')}</p>
        </div>
        <Truck aria-hidden="true" className="text-ink h-8 w-8 shrink-0" />
      </div>

      <div className="border-ink bg-cream shadow-pop-sm flex flex-wrap items-center justify-between gap-3 border-2 p-3">
        <p className="font-body text-sm">
          <span className="font-label text-ink font-bold uppercase">{t('address.title')}: </span>
          {t('address.empty')}
        </p>
        <Link
          href={`/${locale}/checkout/contacto`}
          className="font-label text-ink text-xs font-bold uppercase underline"
        >
          {t('address.edit')}
        </Link>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display font-semibold">{t('legend')}</legend>
        {METHODS.map(({ id, icon: Icon }) => (
          <label
            key={id}
            className={cn(
              'border-ink shadow-pop-sm flex cursor-pointer gap-3 border-[3px] p-4',
              method === id ? 'bg-lemon' : 'bg-cream'
            )}
          >
            <input
              type="radio"
              name="delivery-method"
              value={id}
              checked={method === id}
              onChange={() => setMethod(id)}
              className="accent-ink mt-1 h-5 w-5"
            />
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <Icon aria-hidden="true" className="text-ink h-5 w-5" />
                <span className="font-display font-semibold">{t(`methods.${id}`)}</span>
              </span>
              <span className="font-body text-sm">{t(`methods.${id}Hint`)}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === 'home' ? (
        <fieldset className="border-ink flex flex-col gap-3 border-t-2 pt-4">
          <legend className="font-display text-sm font-semibold">{t('slots.legend')}</legend>
          {(['afternoon', 'evening'] as const).map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="delivery-slot"
                value={id}
                checked={slot === id}
                onChange={() => setSlot(id)}
                className="accent-ink h-4 w-4"
              />
              <span className="font-body text-sm">{t(`slots.${id}`)}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="border-ink bg-cream flex items-start gap-3 border-2 p-4">
        <PackageCheck aria-hidden="true" className="text-ink h-6 w-6 shrink-0" />
        <div>
          <p className="font-label text-ink text-xs font-bold uppercase">{t('care.title')}</p>
          <p className="font-body mt-1 text-sm">{t('care.description')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled
          className="font-label border-ink bg-ink text-cream shadow-pop-sm min-h-12 w-full border-2 px-6 text-xs font-bold uppercase disabled:cursor-not-allowed"
        >
          {t('submit')}
        </button>
        <p className="font-body text-sm">{t('submitNote')}</p>
      </div>
    </section>
  );
}
