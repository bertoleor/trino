import { HomeNeopopBrands, HomeNeopopFeatured } from '@/components/storefront/home-neopop-featured';
import {
  HomeNeopopCommunity,
  HomeNeopopQuality,
  HomeNeopopReviews,
} from '@/components/storefront/home-neopop-community';
import { HomeNeopopHero, HomeNeopopTicker } from '@/components/storefront/home-neopop-sections';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import { HomeNeopopGuide } from '@/components/storefront/home-neopop-guide';
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
  const url = localizedUrl(locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: { canonical: url, languages: languageAlternates() },
    openGraph: { type: 'website', url, locale },
  };
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
      contentClassName="flex flex-col gap-12 py-0"
    >
      <HomeNeopopHero locale={locale} />
      <HomeNeopopTicker locale={locale} />
      <HomeNeopopBrands locale={locale} />
      <HomeNeopopFeatured locale={locale} products={products ?? []} />
      <HomeNeopopGuide locale={locale} />
      <HomeNeopopCommunity locale={locale} />
      <HomeNeopopReviews locale={locale} />
      <HomeNeopopQuality locale={locale} />
    </StitchShell>
  );
}
