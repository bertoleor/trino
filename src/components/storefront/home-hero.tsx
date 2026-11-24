import { ArrowRight, CreditCard, MapPin, Sparkles, Truck } from 'lucide-react';
import { HOME_BRANDS } from '@/components/storefront/home-brands';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function HomeHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tStore = await getTranslations({ locale, namespace: 'storefront' });

  const highlights = [
    { label: tStore('trust.shipping.label'), icon: <Truck aria-hidden="true" /> },
    { label: tStore('trust.pickup.label'), icon: <MapPin aria-hidden="true" /> },
    { label: tStore('trust.installments.label'), icon: <CreditCard aria-hidden="true" /> },
  ];

  return (
    <section className="border-ink col-span-full grid grid-cols-1 items-center gap-10 border-b-[3px] px-6 pb-12 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col items-start gap-6 lg:col-span-7">
        <p className="font-display border-ink bg-lemon shadow-pop-sm inline-flex items-center gap-2 border-[3px] px-4 py-2 text-xs font-bold tracking-wider uppercase">
          <span aria-hidden="true" className="bg-orange h-2.5 w-2.5 rounded-full" />
          {t('hero.eyebrow')}
        </p>
        <h1 className="font-display text-5xl leading-[0.95] font-semibold sm:text-6xl lg:text-7xl">
          {t('hero.titleLine1')}
          {' '}
          <br />
          <span className="text-cobalt">{t('hero.titleLine2')}</span>
          <span className="bg-pink text-ink border-ink shadow-pop-lg mt-6 block w-fit -rotate-1 border-4 px-6 py-3 text-4xl leading-none font-semibold sm:text-5xl xl:text-6xl">
            {t('hero.highlight')}
          </span>
        </h1>
        <p className="font-body max-w-xl text-base">{t('hero.body')}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/${locale}/tienda`}
            className="border-ink bg-ink text-cream shadow-pop inline-flex min-h-11 items-center gap-2 border-[3px] px-6 font-semibold"
          >
            {t('hero.primaryCta')}
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="#test-de-tono"
            className="border-ink bg-cream text-ink shadow-pop inline-flex min-h-11 items-center gap-2 border-[3px] px-6 font-semibold"
          >
            {t('hero.secondaryCta')}
          </Link>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {highlights.map((item) => (
            <li key={item.label} className="font-display flex items-center gap-1 text-xs font-bold uppercase">
              <span className="text-cobalt">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-5">
        <div className="border-ink bg-lilac shadow-pop-xl relative border-4 p-4 pb-6">
          <span className="font-display border-ink bg-pink text-ink shadow-pop-sm absolute -top-4 -left-4 z-10 inline-flex -rotate-3 items-center gap-2 border-[3px] px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
            <Sparkles aria-hidden="true" />
            {t('hero.badge')}
          </span>
          <span
            aria-hidden="true"
            className="font-display border-ink bg-lemon text-ink shadow-pop-sm absolute -top-3 -right-3 z-10 flex h-16 w-16 rotate-6 items-center justify-center border-[3px] text-3xl"
          >
            ✦
          </span>
          <div
            aria-hidden="true"
            className="border-ink bg-lemon relative aspect-[3/4] overflow-hidden border-[3px]"
          >
            <span className="border-ink bg-pink absolute -top-6 -left-6 h-28 w-28 rotate-12 border-[3px]" />
            <span className="border-ink bg-aqua absolute -right-8 bottom-10 h-36 w-36 -rotate-6 border-[3px]" />
            <span className="font-display text-ink border-ink bg-cream shadow-pop absolute top-1/2 left-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 -rotate-3 items-center justify-center border-[3px] text-5xl font-semibold">
              trino<span className="text-cobalt">.</span>
            </span>
            <span className="border-ink bg-orange absolute right-4 bottom-4 h-12 w-12 rounded-full border-[3px]" />
          </div>
          <div className="border-ink bg-cream shadow-pop mt-4 flex items-center justify-between gap-3 border-[3px] p-3">
            <div className="flex flex-col">
              <span className="font-display text-ink text-xs font-bold uppercase tracking-wide">
                {HOME_BRANDS[0].name}
              </span>
              <span className="font-display text-xl font-semibold">{tStore('trust.pickup.label')}</span>
            </div>
            <span className="font-display border-ink bg-cobalt text-cream border-2 px-3 py-1 text-xs font-bold uppercase">
              {tStore('trust.installments.label')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
