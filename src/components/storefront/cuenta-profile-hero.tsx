import { CheckCircle2, UserRound } from 'lucide-react';
import { CuentaBadge } from '@/components/storefront/cuenta-ui';
import { CuentaMetrics } from '@/components/storefront/cuenta-metrics';
import { getTranslations } from 'next-intl/server';

export async function CuentaProfileHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });

  return (
    <section
      data-purpose="profile-hero"
      className="border-ink bg-cream shadow-pop-lg rounded-card border-2 p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          aria-hidden="true"
          className="border-ink bg-pink text-ink shadow-pop rounded-card flex h-24 w-24 shrink-0 items-center justify-center border-2"
        >
          <UserRound className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {t('profile.greeting')}
            </h1>
            <CuentaBadge tone="lemon">{t('profile.role')}</CuentaBadge>
          </div>
          <p className="font-body text-sm">{t('profile.summary')}</p>
          <p className="font-label flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            {t('profile.status')}
          </p>
        </div>
      </div>
      <CuentaMetrics locale={locale} />
    </section>
  );
}
