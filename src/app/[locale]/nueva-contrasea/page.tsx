import type { Metadata } from 'next';
import { PasswordScreen } from '@/components/storefront/auth-screen-password';
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
    title: t('passwordTitle'),
    description: t('passwordDescription'),
    alternates: { canonical: localizedUrl(locale, 'nueva-contrasea') },
    robots: { index: false, follow: false },
  };
}

export default async function NewPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PasswordScreen locale={locale} />;
}
