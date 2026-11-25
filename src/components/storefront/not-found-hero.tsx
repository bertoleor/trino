import { ArrowRight, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function NotFoundHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'errors' });
  const suggestions = t.raw('notFoundPage.suggestions') as string[];

  return (
    <div className="col-span-full flex flex-col gap-4">
      <nav
        aria-label={t('notFoundPage.breadcrumbError')}
        className="col-span-full px-6 pt-2 text-xs font-semibold uppercase"
      >
        <ol className="text-ink flex flex-wrap items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="underline-offset-2 hover:underline">
              {t('notFoundPage.breadcrumbHome')}
            </Link>
          </li>
          <li aria-hidden="true">✦</li>
          <li>{t('notFoundPage.breadcrumbError')}</li>
          <li aria-hidden="true">✦</li>
          <li className="border-ink bg-lemon shadow-pop-sm border-2 px-2 py-0.5 font-bold">
            {t('notFoundPage.breadcrumbCurrent')}
          </li>
        </ol>
      </nav>

      <section
        aria-labelledby="not-found-title"
        className="border-ink bg-cream shadow-pop-lg col-span-full border-[3px] p-6 sm:p-10"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="font-label border-ink bg-lemon shadow-pop-sm mb-4 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
            ✦ {t('notFoundPage.sticker')} ✦
          </p>
          <p className="font-label border-ink bg-lilac shadow-pop-sm mb-6 inline-flex items-center gap-2 border-2 px-4 py-1 text-xs font-bold uppercase">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('notFoundPage.badge')}
          </p>
          <p
            aria-hidden="true"
            className="font-display text-cobalt -mt-2 text-[7rem] leading-none font-black tracking-tight sm:text-[11rem]"
          >
            404
          </p>
          <h1 id="not-found-title" className="font-display mt-4 text-3xl font-semibold sm:text-5xl">
            {t('notFoundPage.title')}
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base sm:text-lg">
            {t('notFoundPage.description')}
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}`}
              className="font-label border-ink bg-ink text-cream shadow-pop inline-flex min-h-11 items-center justify-center gap-2 border-2 px-6 text-xs font-bold uppercase"
            >
              {t('notFoundPage.backHome')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/tienda`}
              className="font-label border-ink bg-lemon text-ink shadow-pop inline-flex min-h-11 items-center justify-center gap-2 border-2 px-6 text-xs font-bold uppercase"
            >
              {t('notFoundPage.explore')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-ink bg-cream shadow-pop-sm mt-10 w-full max-w-xl border-2 p-5 text-left">
            <label
              htmlFor="not-found-search"
              className="font-label mb-2 flex items-center gap-2 text-xs font-bold uppercase"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              {t('notFoundPage.searchLabel')}
            </label>
            <form
              action={`/${locale}/tienda`}
              method="get"
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="text-ink absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                />
                <input
                  id="not-found-search"
                  name="q"
                  type="search"
                  placeholder={t('notFoundPage.searchPlaceholder')}
                  className="border-ink bg-cream text-ink min-h-11 w-full border-2 py-2 pr-3 pl-10 text-sm font-semibold"
                />
              </div>
              <button
                type="submit"
                className="font-label border-ink bg-ink text-cream shadow-pop-sm min-h-11 border-2 px-6 text-xs font-bold uppercase"
              >
                {t('notFoundPage.searchAction')}
              </button>
            </form>
            <p className="font-label mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {t('notFoundPage.suggestionsLabel')}
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/${locale}/tienda?q=${encodeURIComponent(suggestion)}`}
                  className="decoration-ink/40 hover:decoration-cobalt underline underline-offset-2"
                >
                  {suggestion}
                </Link>
              ))}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
