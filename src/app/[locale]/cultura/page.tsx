import { ManifestoCta } from '@/components/storefront/manifiesto-cta';
import { ManifestoHero } from '@/components/storefront/manifiesto-hero';
import { ManifestoIdentity } from '@/components/storefront/manifiesto-identity';
import { ManifestoPrinciples } from '@/components/storefront/manifiesto-principles';
import { ManifestoStories } from '@/components/storefront/manifiesto-stories';
import { ManifestoTeam } from '@/components/storefront/manifiesto-team';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto.stories' });
  return { title: `${t('title')} | trino.` };
}

export default async function CulturaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('cultura_posts')
    .select('id, slug, title, excerpt, cover_image, published_at')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(12);

  const items = posts ?? [];
  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="grid grid-cols-12 gap-6 px-6 py-8"
    >
      <ManifestoHero locale={locale} />
      <ManifestoPrinciples locale={locale} />
      <ManifestoIdentity locale={locale} />
      <ManifestoTeam locale={locale} />
      <ManifestoCta locale={locale} />
      <ManifestoStories locale={locale} posts={items} />
    </StitchShell>
  );
}
