import { CheckoutShell } from '@/components/storefront/checkout-shell';
import type { Metadata } from 'next';
import { TransferenciaContact } from '@/components/storefront/transferencia-contact';
import { TransferenciaData } from '@/components/storefront/transferencia-data';
import { TransferenciaGuide } from '@/components/storefront/transferencia-guide';
import { TransferenciaIntro } from '@/components/storefront/transferencia-intro';
import { TransferenciaSummary } from '@/components/storefront/transferencia-summary';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'transferencia.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'checkout/transferencia') },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutTransferenciaPage({
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
          <TransferenciaSummary locale={locale} />
          <TransferenciaContact locale={locale} />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <TransferenciaIntro locale={locale} />
        <TransferenciaData locale={locale} />
        <TransferenciaGuide locale={locale} />
      </div>
    </CheckoutShell>
  );
}
