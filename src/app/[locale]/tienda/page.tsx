import { CATEGORY, FINISH, SUBCATEGORY, parseFacets } from '@/lib/db/facets';
import { CatalogPagination, CatalogToolbar } from '@/components/storefront/catalog-toolbar';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import { parseCatalogSort, parseCatalogView, sortProducts } from '@/lib/catalog/catalog-query';
import { CatalogFilters } from '@/components/storefront/catalog-filters';
import { CatalogHero } from '@/components/storefront/catalog-hero';
import { CatalogProductCard } from '@/components/storefront/catalog-product-card';
import { EmptyState } from '@/components/storefront/empty-state';
import { SearchEmptyState } from '@/components/storefront/search-empty-state';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { getSearchFallback } from '@/lib/db/search-fallback';
import { getTranslations } from 'next-intl/server';
import { loadCatalog } from '@/lib/catalog/catalog-data';
import { paginate } from '@/lib/db/pagination';

export const revalidate = 300;

type RawParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawParams>;
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
  searchParams: Promise<RawParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const facets = parseFacets(sp);
  const sort = parseCatalogSort(sp);
  const view = parseCatalogView(sp);
  const { page, perPage, limit, offset } = paginate({
    page: Number(sp.page ?? 1),
    perPage: Number(sp.per_page ?? 25),
  });
  const supabase = await createClient();
  const { products, total } = await loadCatalog({ supabase, offset, limit, q, facets });
  const items = sortProducts(
    products.map((product) => ({ ...product, price: product.price ?? 0 })),
    sort
  );
  const fallback = items.length === 0 && q ? await getSearchFallback(supabase) : null;
  const t = await getTranslations({ locale, namespace: 'search' });

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-8 py-0"
    >
      <CatalogHero locale={locale} sp={sp} shown={items.length} total={total} />
      <CatalogToolbar
        locale={locale}
        sp={sp}
        sort={sort}
        view={view}
        shown={items.length}
        total={total}
      />
      {fallback ? (
        <SearchEmptyState
          locale={locale}
          query={q}
          suggestions={fallback.suggestions}
          products={fallback.recommendations}
        />
      ) : (
        <>
          <CatalogFilters
            locale={locale}
            sp={sp}
            facets={facets}
            categories={CATEGORY}
            subcategories={SUBCATEGORY}
            finishes={FINISH}
          />
          <section className="col-span-full lg:col-span-9">
            {items.length === 0 ? (
              <EmptyState
                title={t('catalog.empty.title')}
                description={t('catalog.empty.description')}
              />
            ) : (
              <div
                className={cn(
                  'grid gap-6 sm:grid-cols-2',
                  view === 'compact' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                )}
              >
                {items.map((product, index) => (
                  <CatalogProductCard
                    key={product.id}
                    locale={locale}
                    product={product}
                    badge={t('catalog.card.badge')}
                    viewLabel={t('catalog.card.view')}
                    priority={index < 3}
                    compact={view === 'compact'}
                  />
                ))}
              </div>
            )}
          </section>
          <CatalogPagination locale={locale} sp={sp} page={page} perPage={perPage} total={total} />
        </>
      )}
    </StitchShell>
  );
}
