import { CarritoDrawerGlow } from '@/components/storefront/carrito-drawer-glow';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
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
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.meta.carritoDrawer' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'carrito/drawer') },
  };
}

export default async function CarritoDrawerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const view = await getCartView();

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="grid grid-cols-12 gap-6 px-6 py-10"
    >
      <CarritoDrawerGlow locale={locale} view={view} />
    </StitchShell>
  );
}
