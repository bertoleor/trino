import type { Metadata } from 'next';
import { RecoveryScreen } from '@/components/storefront/auth-screen-recovery';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'authScreens.meta' });
  return {
    title: t('recoveryTitle'),
    description: t('recoveryDescription'),
    alternates: { canonical: localizedUrl(locale, 'recuperar-contrasea') },
    robots: { index: false, follow: false },
  };
}

export default async function RecoveryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <RecoveryScreen locale={locale} />;
}
