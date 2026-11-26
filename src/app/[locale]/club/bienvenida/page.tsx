import { ClubWelcome } from '@/components/storefront/club-welcome';
import { CuentaShell } from '@/components/storefront/cuenta-shell';
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
    title: t('meta.bienvenida.title'),
    description: t('meta.bienvenida.description'),
    alternates: { canonical: localizedUrl(locale, 'club/bienvenida') },
    robots: { index: false, follow: false },
  };
}

export default async function ClubBienvenidaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <CuentaShell locale={locale}>
      <ClubWelcome locale={locale} />
    </CuentaShell>
  );
}
