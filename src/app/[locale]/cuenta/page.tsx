import { CuentaBenefitBanner } from '@/components/storefront/cuenta-benefit-banner';
import { CuentaClubPanel } from '@/components/storefront/cuenta-club-panel';
import { CuentaOrderHistory } from '@/components/storefront/cuenta-order-history';
import { CuentaOrderTracker } from '@/components/storefront/cuenta-order-tracker';
import { CuentaProfileHero } from '@/components/storefront/cuenta-profile-hero';
import { CuentaShell } from '@/components/storefront/cuenta-shell';
import { CuentaShortcuts } from '@/components/storefront/cuenta-shortcuts';
import { CuentaTabs } from '@/components/storefront/cuenta-tabs';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  return {
    title: t('meta.cuenta.title'),
    description: t('meta.cuenta.description'),
    alternates: { canonical: localizedUrl(locale, 'cuenta') },
    robots: { index: false, follow: false },
  };
}

export default async function CuentaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CuentaShell locale={locale}>
      <CuentaBenefitBanner locale={locale} />
      <CuentaProfileHero locale={locale} />
      <CuentaTabs locale={locale} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <CuentaOrderTracker locale={locale} />
          <CuentaOrderHistory locale={locale} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <CuentaClubPanel locale={locale} />
          <CuentaShortcuts locale={locale} />
        </div>
      </div>
    </CuentaShell>
  );
}
