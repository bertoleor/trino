import type { Facets } from '@/lib/db/facets';

export const CATALOG_SORTS = ['newest', 'price_asc', 'price_desc', 'name'] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const CATALOG_VIEWS = ['grid', 'compact'] as const;
export type CatalogView = (typeof CATALOG_VIEWS)[number];

export type RawParams = Record<string, string | string[] | undefined>;
export type FacetKey = keyof Facets;

function first(sp: RawParams, key: string): string {
  const raw = sp[key];
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
}

export function parseCatalogSort(sp: RawParams): CatalogSort {
  const value = first(sp, 'sort');
  return CATALOG_SORTS.find((item) => item === value) ?? 'newest';
}

export function parseCatalogView(sp: RawParams): CatalogView {
  const value = first(sp, 'view');
  return CATALOG_VIEWS.find((item) => item === value) ?? 'grid';
}

function splitFacet(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function withoutFacet(values: readonly string[], value: string): string | null {
  const next = values.filter((item) => item !== value);
  return next.length ? next.join(',') : null;
}

export function catalogHref(
  locale: string,
  sp: RawParams,
  patch: Record<string, string | number | null | undefined> = {}
): string {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(sp)) {
    if (raw === undefined) continue;
    for (const value of Array.isArray(raw) ? raw : [raw]) params.append(key, value);
  }
  for (const [key, value] of Object.entries(patch)) {
    params.delete(key);
    if (value !== null && value !== undefined) params.append(key, String(value));
  }
  if (!Object.hasOwn(patch, 'page')) params.delete('page');
  const query = params.toString();
  return `/${locale}/tienda${query ? `?${query}` : ''}`;
}

export function facetHref(locale: string, sp: RawParams, key: FacetKey, value: string): string {
  const current = splitFacet(first(sp, key));
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return catalogHref(locale, sp, { [key]: next.length ? next.join(',') : null });
}

export interface SortableProduct {
  name: string;
  price: number | null;
  price_cents: number | null;
}

function priceCents(product: SortableProduct): number {
  return product.price_cents ?? Math.round(Number(product.price ?? 0) * 100);
}

export function sortProducts<T extends SortableProduct>(items: T[], sort: CatalogSort): T[] {
  const sorted = [...items];
  if (sort === 'price_asc') return sorted.sort((a, b) => priceCents(a) - priceCents(b));
  if (sort === 'price_desc') return sorted.sort((a, b) => priceCents(b) - priceCents(a));
  if (sort === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}
