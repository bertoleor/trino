import { CheckoutShell } from '@/components/storefront/checkout-shell';
import { CheckoutSummary } from '@/components/storefront/checkout-summary';
import { DeliveryOptions } from '@/components/storefront/delivery-options';
import type { Metadata } from 'next';
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
  const t = await getTranslations({ locale, namespace: 'checkout.delivery.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'checkout/entrega') },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutDeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const view = await getCartView();

  return (
    <CheckoutShell
      locale={locale}
      state="payment"
      activeStep={2}
      summary={<CheckoutSummary locale={locale} view={view} />}
    >
      <DeliveryOptions locale={locale} />
    </CheckoutShell>
  );
}
