import { Search, Sparkles } from 'lucide-react';
import {
  SearchBreadcrumb,
  SearchRecommendations,
  SearchRequest,
} from '@/components/storefront/search-panels';
import { HomeTrust } from '@/components/storefront/home-sections';
import Link from 'next/link';
import type { StorefrontProductCardData } from '@/components/storefront/storefront-product';
import { getTranslations } from 'next-intl/server';

export interface SearchEmptyStateProps {
  locale: string;
  query: string;
  suggestions: string[];
  products: StorefrontProductCardData[];
}

export async function SearchEmptyState({
  locale,
  query,
  suggestions,
  products,
}: SearchEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'search' });

  return (
    <>
      <SearchBreadcrumb locale={locale} />
      <section
        aria-labelledby="search-empty-title"
        className="border-ink bg-cream shadow-pop-lg col-span-full border-[3px] p-6 sm:p-10"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6">
          <p className="font-label border-ink bg-orange text-ink shadow-pop-sm inline-flex flex-wrap items-center gap-2 border-2 px-4 py-1 text-xs font-bold uppercase">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('hero.badge', { query })}
          </p>
          <div className="max-w-3xl">
            <h1 id="search-empty-title" className="font-display text-3xl font-semibold sm:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="font-body mt-4 text-base sm:text-lg">{t('hero.description')}</p>
          </div>

          <div className="border-ink bg-cream shadow-pop w-full max-w-3xl border-[3px] p-4">
            <form
              action={`/${locale}/tienda`}
              method="get"
              className="flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="search-empty-query" className="sr-only">
                {t('form.label')}
              </label>
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="text-ink absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
                />
                <input
                  id="search-empty-query"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder={t('form.placeholder')}
                  className="border-ink bg-cream text-ink min-h-11 w-full border-2 py-2 pr-3 pl-11 text-sm font-semibold"
                />
              </div>
              <button
                type="submit"
                className="font-label border-ink bg-ink text-cream shadow-pop-sm min-h-11 border-2 px-6 text-xs font-bold uppercase"
              >
                {t('form.action')}
              </button>
            </form>
            {suggestions.length > 0 ? (
              <p className="font-label mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
                {t('suggestions.label')}
                {suggestions.map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/${locale}/tienda?q=${encodeURIComponent(suggestion)}`}
                    className="border-ink bg-cream shadow-pop-sm border-2 px-3 py-1 transition-transform hover:-translate-y-0.5 hover:underline"
                  >
                    {suggestion}
                  </Link>
                ))}
              </p>
            ) : null}
          </div>

          <SearchRequest locale={locale} />
        </div>
      </section>

      <SearchRecommendations locale={locale} products={products} />
      <HomeTrust locale={locale} />
    </>
  );
}
