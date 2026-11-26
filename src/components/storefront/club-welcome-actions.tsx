import { CuentaActionLink } from '@/components/storefront/cuenta-ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ClubWelcomeActions({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });

  return (
    <div data-purpose="welcome-actions" className="space-y-6">
      <div className="space-y-2">
        <p className="font-label text-xs font-bold tracking-wide uppercase">
          {t('welcome.mailTitle')}
        </p>
        <p className="font-body text-xs">{t('welcome.mailHint')}</p>
        <div className="flex flex-wrap gap-2">
          <CuentaActionLink href="https://mail.google.com" external tone="cream">
            {t('welcome.mailGmail')}
          </CuentaActionLink>
          <CuentaActionLink href="https://outlook.live.com" external tone="cream">
            {t('welcome.mailOutlook')}
          </CuentaActionLink>
        </div>
      </div>

      <div className="border-ink space-y-3 border-t-2 pt-4">
        <CuentaActionLink href={`/${locale}/tienda`} tone="ink" className="w-full">
          {t('welcome.cta')}
        </CuentaActionLink>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CuentaActionLink href={`/${locale}/cuenta`} tone="lemon">
            {t('welcome.secondary')}
          </CuentaActionLink>
          <Link
            href={`/${locale}#contacto`}
            className="font-label text-xs font-bold tracking-wide uppercase underline underline-offset-4"
          >
            {t('welcome.help')}
          </Link>
        </div>
      </div>
    </div>
  );
}
