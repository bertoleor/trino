import { HomeBrands, HomeFeatured, HomeTrust } from '@/components/storefront/home-sections';
import { HomeClub, HomeCommunity, HomeGuide } from '@/components/storefront/home-panels';
import { HomeHero } from '@/components/storefront/home-hero';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: t('meta.title'), description: t('meta.description') };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, price_cents, sale_price_cents, image_url')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="home" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-16 px-6 py-10"
    >
      <HomeHero locale={locale} />
      <HomeTrust locale={locale} />
      <HomeBrands locale={locale} />
      <HomeFeatured locale={locale} products={products ?? []} />
      <HomeGuide locale={locale} />
      <HomeCommunity locale={locale} />
      <HomeClub locale={locale} />
    </StitchShell>
  );
}
