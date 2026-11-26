import { Box, Check, Layers3, Sparkles, X } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const YES_KEYS = ['a', 'b', 'c', 'd'] as const;
const NO_KEYS = ['a', 'b', 'c'] as const;
const CRAFT_CARDS = [
  { key: 'a', Icon: Layers3, tone: 'bg-cream' },
  { key: 'b', Icon: Box, tone: 'bg-lilac' },
  { key: 'c', Icon: Sparkles, tone: 'bg-aqua' },
] as const;

export async function ManifestoIdentity({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto' });

  return (
    <>
      <section
        data-purpose="manifiesto-identity"
        aria-labelledby="manifiesto-identity-title"
        className="border-ink bg-cream col-span-12 border-b-[3px] px-4 py-12 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-label text-xs font-bold tracking-widest uppercase">
              {t('identity.eyebrow')}
            </span>
            <h2
              id="manifiesto-identity-title"
              className="font-display mt-3 text-3xl font-semibold sm:text-4xl"
            >
              {t('identity.title')}
            </h2>
          </div>
          <div className="border-ink shadow-pop rounded-card mt-10 grid grid-cols-1 overflow-hidden border-[3px] md:grid-cols-2">
            <div className="border-ink bg-lemon p-6 md:border-r-[3px] md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-label border-ink bg-ink text-lemon rounded-control border-2 px-4 py-2 text-xs font-bold uppercase">
                  {t('identity.yesLabel')}
                </span>
                <Check aria-hidden="true" className="h-8 w-8" />
              </div>
              <ul className="space-y-5">
                {YES_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-4">
                    <span className="border-ink bg-ink text-cream rounded-control mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2">
                      <Check aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {t(`identity.yes.items.${key}.title`)}
                      </h3>
                      <p className="font-body text-sm">{t(`identity.yes.items.${key}.body`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-ink bg-ink text-cream p-6 md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-label border-ink bg-pink text-ink rounded-control border-2 px-4 py-2 text-xs font-bold uppercase">
                  {t('identity.noLabel')}
                </span>
                <X aria-hidden="true" className="h-8 w-8" />
              </div>
              <ul className="space-y-5">
                {NO_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-4">
                    <span className="border-ink bg-pink text-ink rounded-control mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2">
                      <X aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {t(`identity.no.items.${key}.title`)}
                      </h3>
                      <p className="font-body text-sm">{t(`identity.no.items.${key}.body`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        data-purpose="manifiesto-craft"
        aria-labelledby="manifiesto-craft-title"
        className="border-ink bg-lilac col-span-12 border-b-[3px] px-4 py-12 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <h2 id="manifiesto-craft-title" className="font-display text-3xl font-semibold">
            {t('craft.highlighted')}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CRAFT_CARDS.map(({ key, Icon, tone }) => (
              <article
                key={key}
                data-purpose={`manifiesto-craft-${key}`}
                className={`border-ink shadow-pop rounded-card border-[3px] p-6 ${tone}`}
              >
                <span className="border-ink bg-cream text-ink shadow-pop-sm rounded-card flex h-12 w-12 items-center justify-center border-2">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-4 text-xl font-semibold">
                  {t(`craft.cards.${key}.title`)}
                </h3>
                <p className="font-body mt-2 text-sm">{t(`craft.cards.${key}.body`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
