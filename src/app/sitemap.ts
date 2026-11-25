import { languageAlternates, siteUrl } from '@/lib/seo/site';
import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { routing } from '@/i18n/routing';

const STATIC_PATHS = [
  '',
  'tienda',
  'marcas',
  'cultura',
  'cambios-devoluciones',
  'envios',
  'garantia',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: siteUrl(`${locale}${path ? `/${path}` : ''}`),
        lastModified: now,
        alternates: { languages: languageAlternates(path) },
      } as unknown as MetadataRoute.Sitemap[number]);
    }
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .limit(500);
    const products = (data ?? []) as { slug: string; updated_at?: string }[];
    for (const p of products) {
      for (const locale of routing.locales) {
        entries.push({
          url: siteUrl(`${locale}/producto/${p.slug}`),
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          alternates: { languages: languageAlternates(`producto/${p.slug}`) },
        } as unknown as MetadataRoute.Sitemap[number]);
      }
    }
  } catch (e) {
    logger.warn('sitemap products fetch failed, static entries only', {
      route: 'sitemap',
      error: String(e),
    });
  }
  return entries.slice(0, 2000);
}
