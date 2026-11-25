'use client';

import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    logger.error('locale/error', {
      error: String(error),
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main role="alert" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <section
        aria-labelledby="error-title"
        className="border-ink bg-cream shadow-pop-lg border-[3px] p-6 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <p className="font-label border-ink bg-lemon text-ink shadow-pop-sm mb-4 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
            ✦ {t('errorPage.sticker')} ✦
          </p>
          <p className="font-label border-ink bg-lilac text-ink shadow-pop-sm mb-6 inline-flex items-center gap-2 border-2 px-4 py-1 text-xs font-bold uppercase">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('errorPage.badge')}
          </p>
          <p
            aria-hidden="true"
            className="font-display text-cobalt -mt-2 text-[7rem] leading-none font-black tracking-tight sm:text-[11rem]"
          >
            500
          </p>
          <h1 id="error-title" className="font-display mt-4 text-3xl font-semibold sm:text-5xl">
            {t('errorPage.title')}
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base sm:text-lg">
            {t('errorPage.description')}
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="font-label border-ink bg-ink text-cream shadow-pop inline-flex min-h-11 items-center justify-center gap-2 border-2 px-6 text-xs font-bold uppercase"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {t('errorPage.retry')}
            </button>
            <Link
              href={`/${locale}`}
              className="font-label border-ink bg-lemon text-ink shadow-pop inline-flex min-h-11 items-center justify-center gap-2 border-2 px-6 text-xs font-bold uppercase"
            >
              {t('errorPage.backHome')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <Link
            href={`/${locale}/tienda`}
            className="decoration-ink/40 hover:decoration-cobalt font-label mt-6 text-sm font-bold underline underline-offset-4"
          >
            {t('errorPage.explore')}
          </Link>
        </div>
      </section>
    </main>
  );
}
