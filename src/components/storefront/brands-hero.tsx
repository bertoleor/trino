import { Sparkles, Store, Truck } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const CATEGORY_KEYS = ['labios', 'rostro', 'ojos'] as const;

export async function BrandsHero({ locale, letters }: { locale: string; letters: string[] }) {
  const t = await getTranslations({ locale, namespace: 'brands' });
  const badges = [
    {
      icon: <Store aria-hidden="true" />,
      label: t('hero.badges.0.title'),
      body: t('hero.badges.0.body'),
    },
    {
      icon: <Truck aria-hidden="true" />,
      label: t('hero.badges.1.title'),
      body: t('hero.badges.1.body'),
    },
    {
      icon: <Sparkles aria-hidden="true" />,
      label: t('hero.badges.2.title'),
      body: t('hero.badges.2.body'),
    },
  ];
  const categories = t.raw('filters.categories') as string[];

  return (
    <>
      <section
        aria-labelledby="brands-title"
        className="border-ink bg-cream shadow-pop-lg col-span-full border-[3px] p-6 sm:p-10"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <p className="font-label border-ink bg-lemon shadow-pop-sm mb-6 inline-flex items-center gap-2 border-2 px-4 py-1 text-xs font-bold uppercase">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('hero.eyebrow')}
          </p>
          <h1 id="brands-title" className="font-display text-4xl font-semibold sm:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base sm:text-lg">{t('hero.description')}</p>
          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="border-ink bg-cream shadow-pop-sm flex items-center gap-3 border-2 p-4 text-left"
              >
                <span className="border-ink bg-pink flex h-10 w-10 shrink-0 items-center justify-center border-2">
                  {badge.icon}
                </span>
                <span>
                  <span className="font-label block text-xs font-bold uppercase">
                    {badge.label}
                  </span>
                  <span className="font-body mt-1 block text-sm">{badge.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label={t('filters.label')}
        className="border-ink bg-lilac shadow-pop col-span-full border-[3px] p-5 sm:p-6"
      >
        <form action={`/${locale}/tienda`} method="get" className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="brand-search" className="sr-only">
            {t('filters.label')}
          </label>
          <input
            id="brand-search"
            name="q"
            type="search"
            placeholder={t('filters.placeholder')}
            className="border-ink bg-cream text-ink min-h-11 w-full border-2 px-4 text-sm font-semibold"
          />
          <button
            type="submit"
            className="font-label border-ink bg-ink text-cream shadow-pop-sm min-h-11 border-2 px-6 text-xs font-bold uppercase"
          >
            {t('filters.action')}
          </button>
        </form>
        <p className="font-label mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
          {t('filters.categoriesLabel')}
          {categories.map((category, index) => (
            <Link
              key={category}
              href={`/${locale}/tienda?category=${CATEGORY_KEYS[index]}`}
              className="border-ink bg-cream shadow-pop-sm border-2 px-3 py-1 hover:underline"
            >
              {category}
            </Link>
          ))}
        </p>
        {letters.length > 0 ? (
          <p className="font-label mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
            {t('filters.alphabetLabel')}
            <Link href="#marcas-directorio" className="underline underline-offset-2">
              {t('filters.all')}
            </Link>
            {letters.map((letter) => (
              <Link
                key={letter}
                href={`#marca-${letter}`}
                className="hover:decoration-cobalt underline underline-offset-2"
              >
                {letter}
              </Link>
            ))}
          </p>
        ) : null}
      </section>
    </>
  );
}
