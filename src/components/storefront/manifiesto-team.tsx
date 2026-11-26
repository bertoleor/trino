import { Palette, Quote, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function ManifestoTeam({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto.team' });

  return (
    <section
      data-purpose="manifiesto-team"
      aria-labelledby="manifiesto-team-title"
      className="border-ink bg-cream col-span-12 border-b-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="border-ink flex flex-col gap-6 border-b-2 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-xs font-bold tracking-widest uppercase">
              {t('eyebrow')}
            </span>
            <h2
              id="manifiesto-team-title"
              className="font-display mt-2 text-3xl font-semibold sm:text-4xl"
            >
              {t('title')}
            </h2>
          </div>
          <p className="font-body max-w-md text-sm">{t('description')}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <article
            data-purpose="manifiesto-team-quote"
            className="border-ink bg-lemon shadow-pop rounded-card flex flex-col justify-between border-[3px] p-8 lg:col-span-5"
          >
            <div>
              <div className="flex items-center gap-3">
                <Quote aria-hidden="true" className="h-8 w-8" />
                <span className="font-label text-[10px] font-bold tracking-widest uppercase">
                  {t('quoteLabel')}
                </span>
              </div>
              <p className="font-display mt-6 text-xl leading-relaxed font-semibold">
                {t('quote')}
              </p>
              <div className="border-ink mt-6 border-t-2 pt-4">
                <p className="font-display font-semibold">{t('author')}</p>
                <p className="font-body text-sm">{t('role')}</p>
              </div>
            </div>
            <div className="border-ink bg-cream shadow-pop-sm rounded-card mt-8 flex items-center gap-4 border-2 p-4">
              <span className="border-ink bg-cobalt text-cream rounded-card flex h-12 w-12 items-center justify-center border-2">
                <Users aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="font-label text-[10px] font-bold uppercase">{t('community')}</span>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            <article
              data-purpose="manifiesto-team-tile-a"
              className="border-ink bg-pink shadow-pop rounded-card flex aspect-square flex-col justify-between border-[3px] p-6"
            >
              <span className="font-label border-ink bg-cream text-ink rounded-control inline-flex items-center gap-2 self-start border-2 px-3 py-2 text-[10px] font-bold uppercase">
                <Palette aria-hidden="true" className="h-4 w-4" />
                {t('tile1')}
              </span>
              <p className="font-body text-sm">{t('tile1Body')}</p>
            </article>
            <article
              data-purpose="manifiesto-team-tile-b"
              className="border-ink bg-aqua shadow-pop rounded-card flex aspect-square flex-col justify-between border-[3px] p-6"
            >
              <span className="font-label border-ink bg-cream text-ink rounded-control inline-flex items-center gap-2 self-start border-2 px-3 py-2 text-[10px] font-bold uppercase">
                <Users aria-hidden="true" className="h-4 w-4" />
                {t('tile2')}
              </span>
              <p className="font-body text-sm">{t('tile2Body')}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
