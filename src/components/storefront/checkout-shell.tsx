import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export type CheckoutState = 'payment' | 'rejected';

export async function CheckoutShell({
  locale,
  state,
  children,
  summary,
}: {
  locale: string;
  state: CheckoutState;
  children: ReactNode;
  summary: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: 'checkout' });
  const steps = [
    { number: '01', label: t('steps.contact') },
    { number: '02', label: t('steps.delivery') },
    { number: '03', label: t('steps.payment') },
  ];

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8"
    >
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const current = index === 2;
          return (
            <li
              key={step.number}
              aria-current={current ? 'step' : undefined}
              className={cn(
                'border-ink shadow-pop-sm flex items-center justify-between gap-3 border-[3px] p-4',
                current ? 'bg-lemon' : 'bg-cream'
              )}
            >
              <span className="font-label text-ink text-xs font-bold tracking-wide uppercase">
                {step.number}. {step.label}
              </span>
              {current ? (
                <span className="font-label border-ink bg-ink text-cream border-2 px-2 py-1 text-[10px] font-bold uppercase">
                  {state === 'rejected' ? t('steps.attention') : t('steps.current')}
                </span>
              ) : (
                <Check aria-hidden="true" className="text-ink h-5 w-5" />
              )}
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">{children}</div>
        <aside aria-label={t('payment.summary.title')} className="lg:col-span-5">
          {summary}
        </aside>
      </div>
    </StitchShell>
  );
}
