'use client';

import { ArrowLeft, ArrowUpRight, Check, CircleHelp } from 'lucide-react';
import { TestTonoPanel, TestTonoTag } from './test-tono-primitives';
import Link from 'next/link';
import { TestTonoBundle } from './test-tono-bundle';
import { TestTonoProductCard } from './test-tono-product-card';
import { TestTonoResultPanel } from './test-tono-result-panel';
import { TestTonoStepper } from './test-tono-paso-1';
import { useTranslations } from 'next-intl';

export function TestTonoPaso3({ locale }: { locale: string }) {
  const t = useTranslations('testTono');

  return (
    <div data-purpose="test-tono-paso-3" className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <TestTonoPanel purpose="step3-hero" className="flex flex-col">
        <div className="border-ink bg-cobalt text-cream -mx-5 -mt-5 mb-5 flex flex-wrap items-center justify-between gap-2 border-b-2 px-5 py-3">
          <span className="font-label text-xs font-black uppercase">{t('step3.eyebrow')}</span>
          <TestTonoTag tone="ink">{t('step3.badge')}</TestTonoTag>
        </div>
        <h1 className="font-display text-ink text-2xl leading-none font-black uppercase md:text-4xl">
          {t('hero.step3Title')}
        </h1>
        <p className="font-body text-ink mt-2 max-w-3xl text-sm leading-relaxed font-semibold opacity-80">
          {t('hero.step3Description')}
        </p>
        <TestTonoStepper active={3} locale={locale} />
      </TestTonoPanel>

      <section data-purpose="step3-headline" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-ink text-3xl leading-none font-black uppercase md:text-4xl">
            {t('step3.title')}
          </h2>
          <TestTonoTag tone="lemon">{t('step3.ribbon')}</TestTonoTag>
        </div>
        <p className="font-body text-ink max-w-3xl text-sm leading-snug font-semibold opacity-80">
          {t('step3.description')}
        </p>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TestTonoResultPanel />
        </div>
        <div className="lg:col-span-7">
          <TestTonoPanel purpose="curation-panel" className="flex h-full flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CircleHelp aria-hidden="true" className="text-ink size-6" />
                <h2 className="font-display text-ink text-base leading-none font-black uppercase">
                  {t('step3.curationCardTitle')}
                </h2>
              </div>
              <TestTonoTag tone="aqua">{t('step3.curationBadge')}</TestTonoTag>
            </div>
            <p className="font-body text-ink text-xs leading-relaxed font-semibold opacity-80">
              {t('step3.curationCardText')}
            </p>
            <div className="border-ink bg-cream shadow-pop mt-auto flex flex-col gap-2 border-2 p-4">
              <span className="font-label text-ink text-xs font-black uppercase">
                {t('step3.curationAdviceTitle')}
              </span>
              <p className="font-body text-ink text-sm leading-snug font-bold">
                {t('step3.curationAdvice')}
              </p>
            </div>
          </TestTonoPanel>
        </div>
      </div>

      <section data-purpose="product-grid-section" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-ink text-xl leading-none font-black uppercase">
            {t('step3.productsTitle')}
          </h2>
          <TestTonoTag tone="pink">{t('step3.productsBadge')}</TestTonoTag>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TestTonoProductCard index="01" productKey="base" tone="lemon" locale={locale} />
          <TestTonoProductCard index="02" productKey="lips" tone="pink" locale={locale} />
          <TestTonoProductCard index="03" productKey="blush" tone="lilac" locale={locale} />
        </div>
      </section>

      <TestTonoBundle locale={locale} />

      <TestTonoPanel
        purpose="step3-actions"
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-start gap-3">
          <Check aria-hidden="true" className="text-ink size-6 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-label text-ink text-xs font-black uppercase">
              {t('step3.helpTitle')}
            </span>
            <p className="font-body text-ink text-xs leading-snug font-semibold opacity-80">
              {t('step3.helpText')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/test-de-tono/paso-1`}
            className="font-label border-ink bg-cream text-ink inline-flex min-h-11 items-center gap-2 border-2 px-4 text-[11px] font-black uppercase"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t('step3.restart')}
          </Link>
          <Link
            href={`/${locale}/tienda`}
            className="font-label border-ink bg-aqua text-ink inline-flex min-h-11 items-center gap-2 border-2 px-4 text-[11px] font-black uppercase"
          >
            {t('step3.catalog')}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </TestTonoPanel>
    </div>
  );
}
