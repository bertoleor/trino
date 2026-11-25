import { CATEGORY, FINISH, SUBCATEGORY, parseFacets } from '@/lib/db/facets';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import { LegacyProductList } from '@/components/storefront/legacy-product-list';
import { SearchEmptyState } from '@/components/storefront/search-empty-state';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { getSearchFallback } from '@/lib/db/search-fallback';
import { getTranslations } from 'next-intl/server';
import { paginate } from '@/lib/db/pagination';

export const revalidate = 300;

type Supabase = Awaited<ReturnType<typeof createClient>>;
type ProductFacets = ReturnType<typeof parseFacets>;

function selectProducts(supabase: Supabase, offset: number, limit: number) {
  return supabase
    .from('products')
    .select('id, name, slug, description, price_cents, image_url', { count: 'exact' })
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

type ProductsQuery = ReturnType<typeof selectProducts>;

function applyBeautyFilters(query: ProductsQuery, q: string, facets: ProductFacets): ProductsQuery {
  let next = query;
  if (q) next = next.textSearch('search_vector', q, { type: 'plain', config: 'spanish' });
  if (facets.category.length) next = next.in('category', facets.category);
  if (facets.subcategory.length) next = next.in('subcategory', facets.subcategory);
  if (facets.finish.length) next = next.in('finish', facets.finish);
  if (facets.brand.length) next = next.in('brand', facets.brand);
  if (facets.shade.length) next = next.in('shade', facets.shade);
  return next;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const hasQuery = typeof sp.q === 'string' && sp.q.trim().length > 0;
  const t = await getTranslations({ locale, namespace: 'search' });
  const url = localizedUrl(locale, 'tienda');
  return {
    title: hasQuery ? t('meta.title') : t('meta.catalogTitle'),
    description: hasQuery ? t('meta.description') : t('meta.catalogDescription'),
    alternates: { canonical: url, languages: languageAlternates('tienda') },
    openGraph: { type: 'website', url, locale },
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function TiendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const facets = parseFacets(sp);
  const { page, perPage, limit, offset } = paginate({
    page: Number(sp.page ?? 1),
    perPage: Number(sp.per_page ?? 25),
  });
  const supabase = await createClient();
  const { data: products } = await applyBeautyFilters(
    selectProducts(supabase, offset, limit),
    q,
    facets
  );
  const items = products ?? [];
  const isEmptySearch = items.length === 0 && Boolean(q);
  const fallback = isEmptySearch ? await getSearchFallback(supabase) : null;
  const filterCount =
    facets.category.length +
    facets.subcategory.length +
    facets.finish.length +
    facets.brand.length +
    facets.shade.length;

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-12 py-8"
    >
      {fallback ? (
        <SearchEmptyState
          locale={locale}
          query={q}
          suggestions={fallback.suggestions}
          products={fallback.recommendations}
        />
      ) : (
        <LegacyProductList
          locale={locale}
          items={items}
          page={page}
          perPage={perPage}
          filterCount={filterCount}
          query={q}
          categories={CATEGORY}
          subcategories={SUBCATEGORY}
          finishes={FINISH}
        />
      )}
    </StitchShell>
  );
}
