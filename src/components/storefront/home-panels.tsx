import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function HomeGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const steps = t.raw('guide.steps') as string[];
  return (
    <section className="border-ink bg-cobalt text-cream shadow-pop-lg col-span-full border-2 p-8 sm:p-12">
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('guide.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{t('guide.title')}</h2>
      <p className="font-body mt-4 max-w-2xl">{t('guide.body')}</p>
      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step} className="border-ink bg-cream text-ink shadow-pop p-6">
            <span className="font-display text-pink text-3xl font-semibold">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="font-display mt-3 text-xl font-semibold">{step}</p>
          </li>
        ))}
      </ol>
      <Link
        href={`/${locale}/tienda`}
        className="border-ink bg-lemon text-ink font-body shadow-pop-sm mt-8 inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
      >
        {t('guide.cta')}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

export async function HomeCommunity({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <section
      className="border-ink bg-cream shadow-pop-lg col-span-full border-2 p-8 sm:p-12"
      style={{
        backgroundImage: 'url(/brand/trino-pattern-waves.svg)',
        backgroundRepeat: 'repeat-x',
      }}
    >
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('community.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
        {t('community.title')}
      </h2>
      <p className="font-body mt-4 max-w-2xl">{t('community.body')}</p>
      <Link
        href={`/${locale}/tienda`}
        className="border-ink bg-pink text-ink font-body shadow-pop-sm mt-8 inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
      >
        {t('community.cta')}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

export async function HomeClub({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <section className="border-ink bg-lemon shadow-pop-lg col-span-full border-2 p-8 sm:p-12">
      <p className="font-display text-sm font-semibold tracking-wide uppercase">
        {t('club.eyebrow')}
      </p>
      <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{t('club.title')}</h2>
      <p className="font-body mt-4 max-w-2xl">{t('club.body')}</p>
      <Link
        href={`/${locale}/tienda`}
        className="border-ink bg-ink text-cream font-body shadow-pop-sm mt-8 inline-flex min-h-11 items-center gap-2 border-2 px-6 font-semibold"
      >
        {t('club.cta')}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
