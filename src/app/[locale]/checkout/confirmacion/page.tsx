import { CheckoutShell } from '@/components/storefront/checkout-shell';
import { ConfirmacionCommitment } from '@/components/storefront/confirmacion-commitment';
import { ConfirmacionCta } from '@/components/storefront/confirmacion-cta';
import { ConfirmacionHero } from '@/components/storefront/confirmacion-hero';
import { ConfirmacionProducts } from '@/components/storefront/confirmacion-products';
import { ConfirmacionShare } from '@/components/storefront/confirmacion-share';
import { ConfirmacionStatus } from '@/components/storefront/confirmacion-status';
import { ConfirmacionSupport } from '@/components/storefront/confirmacion-support';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'checkout/confirmacion') },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutConfirmacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <CheckoutShell
      locale={locale}
      state="payment"
      activeStep={3}
      summary={
        <div className="flex flex-col gap-6">
          <ConfirmacionShare locale={locale} />
          <ConfirmacionSupport locale={locale} />
          <ConfirmacionCommitment locale={locale} />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <ConfirmacionHero locale={locale} />
        <ConfirmacionStatus locale={locale} />
        <ConfirmacionProducts locale={locale} />
        <ConfirmacionCta locale={locale} />
      </div>
    </CheckoutShell>
  );
}
