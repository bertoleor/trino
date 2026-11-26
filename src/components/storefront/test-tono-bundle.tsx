'use client';

import { ArrowUpRight, Check, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { TestTonoTag } from './test-tono-primitives';
import { useTranslations } from 'next-intl';

const BENEFITS = ['first', 'second', 'third'] as const;

export function TestTonoBundle({ locale }: { locale: string }) {
  const t = useTranslations('testTono');

  return (
    <section
      data-purpose="orientative-bundle"
      className="border-ink bg-lemon shadow-pop-lg flex flex-col gap-5 border-2 p-5 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TestTonoTag tone="ink">{t('step3.bundleBadge')}</TestTonoTag>
          <TestTonoTag tone="pink">{t('step3.bundleTag')}</TestTonoTag>
        </div>
        <h2 className="font-display text-ink text-2xl leading-none font-black uppercase md:text-3xl">
          {t('step3.bundleTitle')}
        </h2>
        <p className="font-body text-ink text-sm leading-snug font-bold">{t('step3.bundleText')}</p>
        <ul className="flex flex-col gap-2 sm:grid sm:grid-cols-2" data-purpose="bundle-benefits">
          {BENEFITS.map((key) => (
            <li key={key} className="font-body text-ink flex items-center gap-2 text-xs font-bold">
              <Check aria-hidden="true" className="size-5 shrink-0" />
              {t(`step3.benefits.${key}`)}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-ink bg-cream shadow-pop flex flex-col gap-3 border-2 p-4 md:w-80">
        <div className="flex items-center gap-2">
          <Gift aria-hidden="true" className="text-ink size-6" />
          <span className="font-display text-ink text-base leading-none font-black uppercase">
            {t('step3.bundleCardTitle')}
          </span>
        </div>
        <p className="font-body text-ink text-xs leading-snug font-semibold">
          {t('step3.bundleCardText')}
        </p>
        <Link
          href={`/${locale}/tienda`}
          className="font-label border-ink bg-pink text-ink inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-xs font-black uppercase"
        >
          {t('step3.bundleCta')}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
        <span className="font-body text-ink flex items-center justify-center gap-1 text-[10px] font-bold uppercase opacity-75">
          <Sparkles aria-hidden="true" className="size-4" />
          {t('step3.bundleDisclaimer')}
        </span>
      </div>
    </section>
  );
}
