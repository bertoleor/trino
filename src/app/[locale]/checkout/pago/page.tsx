import { CheckoutShell } from '@/components/storefront/checkout-shell';
import { CheckoutSummary } from '@/components/storefront/checkout-summary';
import type { Metadata } from 'next';
import { PaymentMethods } from '@/components/storefront/payment-methods';
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
  const t = await getTranslations({ locale, namespace: 'checkout.payment' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: { canonical: localizedUrl(locale, 'checkout/pago') },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPaymentPage({
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
      summary={<CheckoutSummary locale={locale} view={view} />}
    >
      <PaymentMethods />
    </CheckoutShell>
  );
}
