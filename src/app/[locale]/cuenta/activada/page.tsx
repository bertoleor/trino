import { ClubActivationHero } from '@/components/storefront/club-activation-hero';
import { ClubOnboarding } from '@/components/storefront/club-onboarding';
import { ClubPerksSidebar } from '@/components/storefront/club-perks-sidebar';
import { CuentaShell } from '@/components/storefront/cuenta-shell';
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
    title: t('meta.activada.title'),
    description: t('meta.activada.description'),
    alternates: { canonical: localizedUrl(locale, 'cuenta/activada') },
    robots: { index: false, follow: false },
  };
}

export default async function CuentaActivadaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <CuentaShell locale={locale}>
      <ClubActivationHero locale={locale} />
      <CuentaTabs locale={locale} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ClubOnboarding locale={locale} />
        </div>
        <div className="lg:col-span-5">
          <ClubPerksSidebar locale={locale} />
        </div>
      </div>
    </CuentaShell>
  );
}
