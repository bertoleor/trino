import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { routing } from '@/i18n/routing';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://trino.com.ar';
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: now,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}`])),
      },
    } as unknown as MetadataRoute.Sitemap[number]);
    entries.push({ url: `${base}/${locale}/tienda`, lastModified: now });
    entries.push({ url: `${base}/${locale}/cultura`, lastModified: now });
    entries.push({ url: `${base}/${locale}/cambios-devoluciones`, lastModified: now });
    entries.push({ url: `${base}/${locale}/envios`, lastModified: now });
    entries.push({ url: `${base}/${locale}/garantia`, lastModified: now });
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
        const url = `${base}/${locale}/producto/${p.slug}`;
        const languages: Record<string, string> = {};
        for (const l of routing.locales) languages[l] = `${base}/${l}/producto/${p.slug}`;
        entries.push({
          url,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          alternates: { languages },
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
