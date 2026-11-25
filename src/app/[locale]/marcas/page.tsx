import type { BrandSummary } from '@/components/storefront/brands-directory';
import { BrandsDirectory } from '@/components/storefront/brands-directory';
import { BrandsHero } from '@/components/storefront/brands-hero';
import { HomeTrust } from '@/components/storefront/home-sections';
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
  const t = await getTranslations({ locale, namespace: 'brands' });
  return { title: t('meta.title'), description: t('meta.description') };
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('brand')
    .is('deleted_at', null)
    .eq('is_active', true)
    .not('brand', 'is', null)
    .limit(1000);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.brand) continue;
    const name = row.brand.trim();
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const brands: BrandSummary[] = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const letters = brands
    .map((brand) => brand.name.charAt(0).toLocaleUpperCase(locale))
    .filter((letter, index, all) => all.indexOf(letter) === index)
    .sort((a, b) => a.localeCompare(b));

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="brands" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-12 py-8"
    >
      <BrandsHero locale={locale} letters={letters} />
      <BrandsDirectory locale={locale} brands={brands} />
      <HomeTrust locale={locale} />
    </StitchShell>
  );
}
