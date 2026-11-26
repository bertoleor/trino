import { SlidersHorizontal, X } from 'lucide-react';
import { catalogHref, facetHref, withoutFacet } from '@/lib/catalog/catalog-query';
import type { Facets } from '@/lib/db/facets';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type FacetGroupKey = 'category' | 'subcategory' | 'finish';
type ActiveKey = FacetGroupKey | 'brand' | 'shade';

export async function CatalogFilters({
  locale,
  sp,
  facets,
  categories,
  subcategories,
  finishes,
}: {
  locale: string;
  sp: Record<string, string | string[] | undefined>;
  facets: Facets;
  categories: readonly string[];
  subcategories: readonly string[];
  finishes: readonly string[];
}) {
  const t = await getTranslations({ locale, namespace: 'search' });
  const groups: {
    key: FacetGroupKey;
    title: string;
    values: readonly string[];
    options: readonly string[];
  }[] = [
    {
      key: 'category',
      title: t('catalog.filters.category'),
      values: facets.category,
      options: categories,
    },
    {
      key: 'subcategory',
      title: t('catalog.filters.subcategory'),
      values: facets.subcategory,
      options: subcategories,
    },
    { key: 'finish', title: t('catalog.filters.finish'), values: facets.finish, options: finishes },
  ];
  const active: { key: ActiveKey; value: string }[] = [
    ...facets.category.map((value) => ({ key: 'category' as const, value })),
    ...facets.subcategory.map((value) => ({ key: 'subcategory' as const, value })),
    ...facets.finish.map((value) => ({ key: 'finish' as const, value })),
    ...facets.brand.map((value) => ({ key: 'brand' as const, value })),
    ...facets.shade.map((value) => ({ key: 'shade' as const, value })),
  ];

  return (
    <aside
      aria-label={t('catalog.filters.title')}
      className="border-ink bg-cream shadow-pop col-span-full border-[3px] p-5 lg:col-span-3"
    >
      <div className="border-ink flex items-center justify-between border-b-2 pb-4">
        <h2 className="font-display text-ink flex items-center gap-2 text-lg font-semibold">
          <SlidersHorizontal aria-hidden="true" />
          {t('catalog.filters.title')}
        </h2>
        <Link
          href={catalogHref(locale, sp, {
            category: null,
            subcategory: null,
            finish: null,
            brand: null,
            shade: null,
            q: null,
          })}
          className="font-label text-orange text-[10px] font-bold uppercase hover:underline"
        >
          {t('catalog.filters.clear')}
        </Link>
      </div>
      {active.length > 0 ? (
        <div className="mt-4">
          <p className="font-label text-ink text-[10px] font-bold uppercase">
            {t('catalog.filters.active')}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {active.map(({ key, value }) => (
              <li key={`${key}-${value}`}>
                <Link
                  href={catalogHref(locale, sp, {
                    [key]: withoutFacet(
                      key === 'category'
                        ? facets.category
                        : key === 'subcategory'
                          ? facets.subcategory
                          : key === 'finish'
                            ? facets.finish
                            : key === 'brand'
                              ? facets.brand
                              : facets.shade,
                      value
                    ),
                  })}
                  className="font-label border-ink bg-lemon shadow-pop-sm text-ink inline-flex items-center gap-2 border-2 px-3 py-1 text-[10px] font-bold uppercase"
                >
                  {value}
                  <X aria-hidden="true" className="h-3 w-3" />
                  <span className="sr-only">{t('catalog.filters.remove', { label: value })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <fieldset key={group.key}>
            <legend className="font-label border-ink text-ink border-b-2 pb-2 text-[11px] font-bold uppercase">
              {group.title}
            </legend>
            <ul className="mt-3 space-y-2">
              {group.options.map((option) => {
                const selected = group.values.includes(option);
                return (
                  <li key={option}>
                    <Link
                      href={facetHref(locale, sp, group.key, option)}
                      aria-current={selected ? 'true' : undefined}
                      className={`font-label border-ink inline-flex min-h-9 w-full items-center justify-between border-2 px-3 py-1 text-[11px] font-bold uppercase ${
                        selected ? 'bg-pink text-ink shadow-pop-sm' : 'bg-cream text-ink'
                      }`}
                    >
                      {option}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </aside>
  );
}
