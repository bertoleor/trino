import type { Metadata } from 'next';
import { ProductoAgotado } from '@/components/storefront/producto-agotado';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.meta.agotado' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, `producto/${slug}/agotado`) },
  };
}

export default async function ProductoAgotadoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="product" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-12 px-6 py-10"
    >
      <ProductoAgotado locale={locale} slug={slug} />
    </StitchShell>
  );
}
