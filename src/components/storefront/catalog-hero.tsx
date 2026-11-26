import { CATEGORY } from '@/lib/db/facets';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { catalogHref } from '@/lib/catalog/catalog-query';
import { getTranslations } from 'next-intl/server';

export async function CatalogHero({
  locale,
  sp,
  shown,
  total,
}: {
  locale: string;
  sp: Record<string, string | string[] | undefined>;
  shown: number;
  total: number;
}) {
  const t = await getTranslations({ locale, namespace: 'search' });
  const pills = [
    { label: t('catalog.filters.all'), href: catalogHref(locale, sp, { category: null }) },
    ...CATEGORY.map((category) => ({
      label: t(`catalog.categories.${category}`),
      href: catalogHref(locale, sp, { category }),
    })),
  ];

  return (
    <section
      aria-labelledby="catalog-title"
      className="border-ink bg-cream col-span-full border-b-[3px] px-6 pb-10"
    >
      <nav
        aria-label={t('breadcrumb.catalog')}
        className="font-label text-ink mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase"
      >
        <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
        <span aria-hidden="true">/</span>
        <span>{t('breadcrumb.catalog')}</span>
        <span aria-hidden="true">/</span>
        <span className="text-orange">{t('catalog.breadcrumb.current')}</span>
      </nav>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-label border-ink bg-lemon shadow-pop-sm text-ink inline-flex items-center gap-2 border-2 px-3 py-1 text-xs font-bold uppercase">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('catalog.hero.badge')}
          </p>
          <h1 id="catalog-title" className="font-display mt-4 text-3xl font-semibold sm:text-5xl">
            {t('catalog.hero.title')}{' '}
            <span className="text-orange decoration-cobalt underline decoration-4">
              {t('catalog.hero.titleAccent')}
            </span>
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base sm:text-lg">
            {t('catalog.hero.description')}
          </p>
        </div>
        <div className="border-ink bg-cream shadow-pop border-[3px] p-4">
          <p className="font-display text-2xl font-semibold">
            {t('catalog.toolbar.summary', { shown, total })}
          </p>
          <p className="font-label mt-1 text-[10px] font-bold uppercase">
            {t('catalog.hero.summaryLabel')}
          </p>
        </div>
      </div>
      <ul className="mt-8 flex gap-2 overflow-x-auto">
        {pills.map((pill) => (
          <li key={pill.href}>
            <Link
              href={pill.href}
              className="font-label border-ink bg-cream shadow-pop-sm text-ink inline-flex min-h-11 items-center px-4 text-[11px] font-bold uppercase"
            >
              {pill.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
