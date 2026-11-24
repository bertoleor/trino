import { ArrowRight, Sparkles } from 'lucide-react';
import { HOME_BRANDS } from '@/components/storefront/home-brands';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function HomeHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tStore = await getTranslations({ locale, namespace: 'storefront' });
  return (
    <section className="border-ink col-span-full grid items-center gap-10 border-b-2 pb-12 lg:grid-cols-2">
      <div>
        <p className="font-display border-ink bg-lemon shadow-pop-sm inline-block border-2 px-3 py-1 text-sm font-semibold uppercase">
          {t('hero.eyebrow')}
        </p>
        <h1 className="font-display mt-6 text-5xl leading-[0.95] font-semibold sm:text-6xl lg:text-7xl">
          {t('hero.titleLine1')}
          <br />
          <span className="text-pink">{t('hero.titleLine2')}</span>
        </h1>
        <p className="font-body mt-6 max-w-xl text-base">{t('hero.body')}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/tienda`}
            className="border-ink bg-ink text-cream shadow-pop inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
          >
            {t('hero.primaryCta')}
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/tienda`}
            className="border-ink bg-cream text-ink shadow-pop inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
          >
            {t('hero.secondaryCta')}
          </Link>
        </div>
      </div>
      <div className="border-ink bg-lilac shadow-pop-xl relative min-h-80 border-2 p-8">
        <div
          aria-hidden="true"
          className="border-ink bg-lemon absolute -top-4 -right-3 h-24 w-24 rotate-6 border-2"
        />
        <div
          aria-hidden="true"
          className="border-ink bg-pink absolute -right-6 -bottom-4 h-32 w-32 -rotate-3 border-2"
        />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <span className="font-display border-ink bg-cream shadow-pop-sm inline-flex w-fit items-center gap-2 border-2 px-3 py-1 text-sm font-semibold">
            <Sparkles aria-hidden="true" />
            {t('hero.badge')}
          </span>
          <div className="border-ink bg-cream shadow-pop border-2 p-6">
            <p className="font-display text-2xl font-semibold">{HOME_BRANDS[0].name}</p>
            <p className="font-body mt-2 text-sm">{tStore('trust.pickup.label')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
