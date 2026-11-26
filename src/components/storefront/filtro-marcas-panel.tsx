import { CATEGORY, type Facets } from '@/lib/db/facets';
import { type FacetKey, type RawParams, catalogHref, facetHref } from '@/lib/catalog/catalog-query';
import { ArrowRight } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog/catalog-data';
import { CatalogProductCard } from '@/components/storefront/catalog-product-card';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type Product = CatalogProduct & { price: number };
type PanelProps = {
  locale: string;
  sp: RawParams;
  brands: string[];
  facets: Facets;
  products: Product[];
  total: number;
};
type FacetProps = {
  locale: string;
  sp: RawParams;
  title: string;
  facet: FacetKey;
  values: readonly string[];
  selected: readonly string[];
  empty: string;
};
const SORTS = [
  { key: 'newest', label: 'sortNewest' },
  { key: 'price_asc', label: 'sortPriceAsc' },
  { key: 'price_desc', label: 'sortPriceDesc' },
  { key: 'name', label: 'sortName' },
] as const;
const CARD = 'border-ink bg-cream shadow-pop border-[3px]';
const PILL =
  'font-label border-ink bg-cream shadow-pop-sm inline-flex min-h-10 items-center border-2 px-3 text-[11px] font-bold uppercase';
const CRUMB =
  'font-label text-cobalt text-xs font-bold uppercase underline-offset-2 hover:underline';

function FacetBox({ locale, sp, title, facet, values, selected, empty }: FacetProps) {
  // prettier-ignore
  return (
    <div className={`${CARD} p-4`}>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {values.length === 0 ? <p className="font-body mt-3 text-sm">{empty}</p> :
        <ul className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => <li key={value}>
            <Link href={facetHref(locale, sp, facet, value)} aria-pressed={selected.includes(value)}
              className={`${PILL} ${selected.includes(value) ? 'bg-cobalt text-cream' : 'text-ink'}`}>{value}</Link>
          </li>)}
        </ul>}
    </div>
  );
}

export async function FiltroMarcasPanel({
  locale,
  sp,
  brands,
  facets,
  products,
  total,
}: PanelProps) {
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.filtrosMarcas' });
  const selected = facets.brand;
  const activeBrand = selected[0] ?? null;
  // prettier-ignore
  return (
    <>
      <nav data-purpose="filtros-marcas-breadcrumb" aria-label="Breadcrumb" className="col-span-12">
        <Link href={`/${locale}`} className={CRUMB}>{t('breadcrumbHome')}</Link>{' / '}
        <Link href={`/${locale}/tienda`} className={CRUMB}>{t('breadcrumbCatalog')}</Link>
      </nav>
      <section data-purpose="filtros-marcas-hero" className={`${CARD} bg-lemon col-span-12 p-6 md:p-10`}>
        <span className="font-label border-ink bg-cream text-ink shadow-pop-sm inline-block border-2 px-3 py-1 text-[10px] font-black uppercase">{t('badge')}</span>
        <h1 className="font-display mt-4 text-3xl font-semibold sm:text-5xl">{t('title')}</h1>
        <p className="font-body mt-3 max-w-2xl text-sm">{t('description')}</p>
        <p className="font-label mt-5 text-xs font-bold uppercase">{t('results', { count: total })}</p>
        {activeBrand ? <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-label text-xs font-bold uppercase">{t('activeLabel')}: {activeBrand}</span>
          <Link href={catalogHref(locale, sp, { brand: null })} className={`${PILL} gap-2`}>{t('clear')}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div> : null}
      </section>
      <aside data-purpose="filtros-marcas-controles" aria-label={t('brandsTitle')} className="col-span-12 flex flex-col gap-5 lg:col-span-3">
        <FacetBox locale={locale} sp={sp} title={t('brandsTitle')} facet="brand" values={brands} selected={selected} empty={t('empty')} />
        <FacetBox locale={locale} sp={sp} title={t('categoryTitle')} facet="category" values={CATEGORY} selected={selected} empty={t('empty')} />
      </aside>
      <section data-purpose="filtros-marcas-orden" className={`${CARD} col-span-12 p-4 lg:col-span-3`}>
        <h2 className="font-display text-lg font-semibold">{t('sortTitle')}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {SORTS.map(({ key, label }) => <li key={key}>
            <Link href={catalogHref(locale, sp, { sort: key })} className={`${PILL} w-full`}>{t(label)}</Link>
          </li>)}
        </ul>
        <div className="border-ink bg-pink mt-4 border-2 p-4">
          <h3 className="font-display text-base font-semibold">{t('requestTitle')}</h3>
          <p className="font-body mt-1 text-xs">{t('requestBody')}</p>
          <Link href={`/${locale}/contacto#consulta`} className={`${PILL} mt-3 gap-2`}>{t('requestAction')}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>
      <section data-purpose="filtros-marcas-resultados" aria-label={t('results', { count: total })} className="col-span-12 lg:col-span-9">
        {products.length === 0 ? <div className={`${CARD} p-6`}>
          <p className="font-body text-sm">{t('empty')}</p>
          <Link href={catalogHref(locale, sp, { brand: null })} className="font-label border-ink bg-lemon shadow-pop-sm mt-4 inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase">{t('catalogAction')}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => <CatalogProductCard key={product.id} locale={locale} product={product} badge={t('badge')} viewLabel={t('catalogAction')} priority={index < 3} />)}
        </div>}
      </section>
    </>
  );
}
