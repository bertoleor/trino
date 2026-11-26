import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ManifestoCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto' });

  return (
    <>
      <section
        data-purpose="manifiesto-cta"
        aria-labelledby="manifiesto-cta-title"
        className="border-ink bg-cobalt text-cream col-span-12 border-b-[3px] px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-block border-2 px-5 py-2 text-[10px] font-bold tracking-widest uppercase">
            {t('cta.eyebrow')}
          </span>
          <h2
            id="manifiesto-cta-title"
            className="font-display mt-8 text-4xl leading-none font-semibold sm:text-5xl"
          >
            {t('cta.title')}
          </h2>
          <p className="font-body mx-auto mt-5 max-w-xl text-base">{t('cta.body')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tienda`}
              className="font-label border-ink bg-pink text-ink shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-8 text-xs font-bold uppercase"
            >
              {t('cta.primary')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="#principios"
              className="font-label border-ink bg-cream text-ink shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-8 text-xs font-bold uppercase"
            >
              {t('cta.secondary')}
            </Link>
          </div>
          <p className="font-label mt-10 text-[10px] font-bold tracking-widest uppercase">
            {t('cta.note')}
          </p>
        </div>
      </section>

      <section
        data-purpose="manifiesto-club"
        aria-labelledby="manifiesto-club-title"
        className="border-ink bg-lemon col-span-12 border-b-[3px] px-4 py-10 sm:px-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="font-label text-[10px] font-bold tracking-widest uppercase">
              {t('club.eyebrow')}
            </span>
            <h2 id="manifiesto-club-title" className="font-display mt-2 text-2xl font-semibold">
              {t('club.title')}
            </h2>
            <p className="font-body mt-2 text-sm">{t('club.body')}</p>
          </div>
          <Link
            href={`/${locale}/tienda`}
            className="font-label border-ink bg-ink text-cream shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-xs font-bold uppercase"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            {t('club.action')}
          </Link>
        </div>
      </section>
    </>
  );
}
