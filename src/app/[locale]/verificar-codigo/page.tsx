import type { Metadata } from 'next';
import { OtpScreen } from '@/components/storefront/auth-screen-otp';
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
    title: t('otpTitle'),
    description: t('otpDescription'),
    alternates: { canonical: localizedUrl(locale, 'verificar-codigo') },
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCodePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <OtpScreen locale={locale} />;
}
