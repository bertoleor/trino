import { type RawParams, parseCatalogSort, sortProducts } from '@/lib/catalog/catalog-query';
import { FiltroMarcasPanel } from '@/components/storefront/filtro-marcas-panel';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { getSearchFallback } from '@/lib/db/search-fallback';
import { getTranslations } from 'next-intl/server';
import { loadCatalog } from '@/lib/catalog/catalog-data';
import { localizedUrl } from '@/lib/seo/site';
import { parseFacets } from '@/lib/db/facets';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.meta.filtrosMarcas' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'tienda/filtros-marcas') },
  };
}

export default async function FiltrosMarcasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const facets = parseFacets(sp);
  const sort = parseCatalogSort(sp);
  const supabase = await createClient();
  const [{ products, total }, fallback] = await Promise.all([
    loadCatalog({ supabase, offset: 0, limit: 60, q: '', facets }),
    getSearchFallback(supabase),
  ]);
  const items = sortProducts(
    products.map((product) => ({ ...product, price: product.price ?? 0 })),
    sort
  );

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="grid grid-cols-12 gap-6 px-6 py-10"
    >
      <FiltroMarcasPanel
        locale={locale}
        sp={sp}
        brands={fallback.suggestions}
        facets={facets}
        products={items}
        total={total}
      />
    </StitchShell>
  );
}
