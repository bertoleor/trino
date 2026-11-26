import { BadgeCheck } from 'lucide-react';
import { CuentaActionLink } from '@/components/storefront/cuenta-ui';
import { getTranslations } from 'next-intl/server';

export async function CuentaBenefitBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });

  return (
    <section
      data-purpose="club-benefit-banner"
      className="border-ink bg-pink text-ink shadow-pop rounded-card flex flex-wrap items-center justify-between gap-3 border-2 p-4"
    >
      <div className="flex items-center gap-3">
        <span className="border-ink bg-lemon rounded-control flex h-8 w-8 shrink-0 items-center justify-center border-2">
          <BadgeCheck aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-label text-xs font-bold tracking-wide uppercase">
            {t('banner.label')}
          </p>
          <p className="font-body text-sm font-semibold">{t('banner.message')}</p>
          <p className="font-body text-xs">{t('banner.hint')}</p>
        </div>
      </div>
      <CuentaActionLink href={`/${locale}/cuenta#club`} tone="ink">
        {t('banner.action')}
      </CuentaActionLink>
    </section>
  );
}
