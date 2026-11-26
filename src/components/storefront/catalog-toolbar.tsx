import { CATALOG_SORTS, catalogHref } from '@/lib/catalog/catalog-query';
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3 } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type ToolbarParams = Record<string, string | string[] | undefined>;

export async function CatalogToolbar({
  locale,
  sp,
  sort,
  view,
  shown,
  total,
}: {
  locale: string;
  sp: ToolbarParams;
  sort: string;
  view: string;
  shown: number;
  total: number;
}) {
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <section className="border-ink bg-cream col-span-full flex flex-wrap items-center justify-between gap-4 border-y-[3px] py-3">
      <p className="font-label text-ink text-xs font-bold uppercase">
        {t('catalog.toolbar.summary', { shown, total })}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label={t('catalog.sort.label')} className="flex flex-wrap gap-2">
          {CATALOG_SORTS.map((option) => (
            <Link
              key={option}
              href={catalogHref(locale, sp, { sort: option })}
              aria-current={sort === option ? 'true' : undefined}
              className={`font-label border-ink min-h-9 items-center border-2 px-3 py-1 text-[10px] font-bold uppercase ${
                sort === option
                  ? 'bg-ink text-cream shadow-pop-sm inline-flex'
                  : 'bg-cream text-ink inline-flex'
              }`}
            >
              {t(`catalog.sort.${option}`)}
            </Link>
          ))}
        </nav>
        <nav
          aria-label={t('catalog.view.label')}
          className="border-ink bg-cream flex gap-1 border-2 p-0.5"
        >
          <Link
            href={catalogHref(locale, sp, { view: 'grid' })}
            aria-label={t('catalog.view.grid')}
            aria-current={view === 'grid' ? 'true' : undefined}
            className={`border-ink inline-flex h-9 w-9 items-center justify-center ${view === 'grid' ? 'bg-lemon' : 'bg-cream'}`}
          >
            <LayoutGrid aria-hidden="true" className="text-ink h-4 w-4" />
          </Link>
          <Link
            href={catalogHref(locale, sp, { view: 'compact' })}
            aria-label={t('catalog.view.compact')}
            aria-current={view === 'compact' ? 'true' : undefined}
            className={`border-ink inline-flex h-9 w-9 items-center justify-center ${view === 'compact' ? 'bg-lemon' : 'bg-cream'}`}
          >
            <Rows3 aria-hidden="true" className="text-ink h-4 w-4" />
          </Link>
        </nav>
      </div>
    </section>
  );
}

export async function CatalogPagination({
  locale,
  sp,
  page,
  perPage,
  total,
}: {
  locale: string;
  sp: ToolbarParams;
  page: number;
  perPage: number;
  total: number;
}) {
  const t = await getTranslations({ locale, namespace: 'search' });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t('catalog.pagination.label')}
      className="font-label col-span-full flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase"
    >
      <Link
        href={catalogHref(locale, sp, { page: Math.max(1, page - 1) })}
        aria-disabled={page <= 1}
        className="border-ink bg-cream shadow-pop-sm text-ink inline-flex h-10 w-10 items-center justify-center border-2"
      >
        <ChevronLeft aria-hidden="true" />
        <span className="sr-only">{t('catalog.pagination.previous')}</span>
      </Link>
      <span className="text-ink">{t('catalog.pagination.page', { page, total: totalPages })}</span>
      <Link
        href={catalogHref(locale, sp, { page: Math.min(totalPages, page + 1) })}
        aria-disabled={page >= totalPages}
        className="border-ink bg-cream shadow-pop-sm text-ink inline-flex h-10 w-10 items-center justify-center border-2"
      >
        <ChevronRight aria-hidden="true" />
        <span className="sr-only">{t('catalog.pagination.next')}</span>
      </Link>
    </nav>
  );
}
