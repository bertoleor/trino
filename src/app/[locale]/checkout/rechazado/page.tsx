import { CheckoutShell } from '@/components/storefront/checkout-shell';
import { CheckoutSummary } from '@/components/storefront/checkout-summary';
import type { Metadata } from 'next';
import { PaymentRejected } from '@/components/storefront/payment-rejected';
import { getCartView } from '@/lib/db/cart-view';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout.rejected.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'checkout/rechazado') },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutRejectedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const view = await getCartView();

  return (
    <CheckoutShell
      locale={locale}
      state="rejected"
      activeStep={3}
      summary={<CheckoutSummary locale={locale} view={view} />}
    >
      <PaymentRejected locale={locale} />
    </CheckoutShell>
  );
}
