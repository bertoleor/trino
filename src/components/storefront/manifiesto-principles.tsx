import { FlaskConical, Heart, Search, Smile, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const PRINCIPLES = [
  { key: 'complice', Icon: Heart, panel: 'bg-cream text-ink', badge: 'bg-pink' },
  { key: 'curiosa', Icon: FlaskConical, panel: 'bg-lemon text-ink', badge: 'bg-aqua' },
  { key: 'atrevida', Icon: Zap, panel: 'bg-pink text-ink', badge: 'bg-lemon' },
  { key: 'clara', Icon: Search, panel: 'bg-aqua text-ink', badge: 'bg-cream' },
  { key: 'optimista', Icon: Smile, panel: 'bg-cobalt text-cream', badge: 'bg-lemon' },
] as const;

export async function ManifestoPrinciples({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto.principles' });

  return (
    <section
      id="principios"
      data-purpose="manifiesto-principles"
      aria-labelledby="manifiesto-principles-title"
      className="border-ink bg-cream col-span-12 border-b-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="border-ink flex flex-col gap-6 border-b-2 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label border-ink bg-pink text-ink shadow-pop-sm rounded-control mb-3 inline-block border-2 px-3 py-1 text-[10px] font-bold uppercase">
              {t('eyebrow')}
            </span>
            <h2
              id="manifiesto-principles-title"
              className="font-display text-3xl font-semibold sm:text-4xl"
            >
              {t('title')}
            </h2>
          </div>
          <p className="font-body max-w-md text-sm">{t('description')}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(({ key, Icon, panel, badge }, index) => (
            <article
              key={key}
              data-purpose={`manifiesto-principle-${key}`}
              className={`border-ink shadow-pop rounded-card flex flex-col justify-between border-[3px] p-6 ${
                index === 4 ? 'sm:col-span-2' : ''
              } ${panel}`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`font-label border-ink text-ink shadow-pop-sm rounded-control flex h-12 w-12 items-center justify-center border-2 text-sm font-bold ${badge}`}
                  >
                    {t(`items.${key}.number`)}
                  </span>
                  <Icon aria-hidden="true" className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{t(`items.${key}.title`)}</h3>
                <p className="font-body mt-3 text-sm leading-relaxed">{t(`items.${key}.body`)}</p>
              </div>
              <div className="border-ink mt-6 flex items-center justify-between border-t-2 pt-4">
                <span className="font-label text-[10px] font-bold tracking-widest uppercase">
                  {t(`items.${key}.tag`)}
                </span>
                <span aria-hidden="true" className="bg-ink h-2.5 w-2.5" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
