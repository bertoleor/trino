import { ArrowDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const TICKER_KEYS = ['a', 'b', 'c', 'd'] as const;

export async function ManifestoHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto' });

  return (
    <>
      <section
        data-purpose="manifiesto-ticker"
        className="border-ink bg-ink text-cream col-span-12 border-b-[3px] py-2"
      >
        <div className="font-label flex flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 text-[10px] font-bold tracking-widest uppercase">
          {TICKER_KEYS.map((key) => (
            <span key={key}>{t(`ticker.${key}`)}</span>
          ))}
        </div>
      </section>

      <section
        data-purpose="manifiesto-hero"
        aria-labelledby="manifiesto-hero-title"
        className="bg-cream col-span-12 px-4 py-10 sm:px-6 lg:py-16"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control border-[3px] px-4 py-2 text-xs font-bold tracking-wider uppercase">
                {t('eyebrow')}
              </span>
              <span className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control border-2 px-3 py-2 text-[10px] font-bold tracking-widest uppercase">
                {t('edition')} / {t('editionDetail')}
              </span>
            </div>
            <h1
              id="manifiesto-hero-title"
              className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {t('hero.line1')}{' '}
              <span className="border-ink bg-pink shadow-pop-sm rounded-card inline-block border-[3px] px-3 py-1">
                {t('hero.highlight1')}
              </span>
              <br />
              {t('hero.line2')}{' '}
              <span className="border-ink bg-lemon shadow-pop-sm rounded-card inline-block border-[3px] px-3 py-1">
                {t('hero.highlight2')}
              </span>
            </h1>
            <p className="font-body max-w-2xl text-base leading-relaxed">{t('hero.body')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#principios"
                className="font-label border-ink bg-ink text-cream shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-xs font-bold uppercase"
              >
                {t('hero.cta')}
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </Link>
              <span className="font-label border-ink bg-cream shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-[10px] font-bold uppercase">
                <span aria-hidden="true" className="bg-aqua border-ink h-2.5 w-2.5 border-2" />
                {t('hero.note')}
              </span>
            </div>
          </div>
          <div
            aria-label={t('craft.stamp')}
            className="border-ink bg-lilac shadow-pop rounded-card col-span-full flex aspect-[4/5] w-full flex-col justify-between border-[3px] p-5 lg:col-span-5"
          >
            <span className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex items-center gap-2 self-start border-2 px-3 py-2 text-[10px] font-bold uppercase">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t('craft.eyebrow')}
            </span>
            <p className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
              {t('craft.title')}
            </p>
            <div className="border-ink bg-lemon text-ink shadow-pop-sm rounded-card border-[3px] p-4">
              <p className="font-label text-[10px] font-bold tracking-widest uppercase">
                {t('craft.stamp')}
              </p>
              <p className="font-body mt-1 text-sm">{t('craft.body')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
