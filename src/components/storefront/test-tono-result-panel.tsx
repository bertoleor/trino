'use client';

import { ArrowRight, Lightbulb, Palette, Sparkles } from 'lucide-react';
import { TestTonoPanel, TestTonoTag } from './test-tono-primitives';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function TestTonoResultPanel() {
  const t = useTranslations('testTono');

  return (
    <TestTonoPanel purpose="result-panel" className="flex h-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TestTonoTag tone="ink">{t('step3.resultBadge')}</TestTonoTag>
        <Palette aria-hidden="true" className="text-ink size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-display text-ink text-2xl leading-none font-black uppercase">
          {t('step3.resultSubtone')}
        </span>
        <span className="font-label text-cobalt text-xs font-black uppercase">
          {t('step3.resultShade')}
        </span>
      </div>

      <section
        data-purpose="reference-swatch"
        className="border-ink shadow-pop flex items-center gap-4 border-2 p-3"
      >
        <span className="border-ink bg-lemon text-ink rounded-control flex size-16 shrink-0 items-center justify-center border-2">
          <span className="font-label text-[10px] font-black uppercase">
            {t('step3.swatchText')}
          </span>
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-label text-ink text-[10px] font-black uppercase opacity-75">
            {t('step3.swatchLabel')}
          </span>
          <span className="font-display text-ink text-base leading-none font-black uppercase">
            {t('step3.swatchValue')}
          </span>
          <span className="font-body text-ink flex items-center gap-1 text-[11px] font-bold">
            <span className="bg-aqua border-ink rounded-control size-3 border" />
            {t('step3.swatchHint')}
          </span>
        </div>
      </section>

      <section
        data-purpose="orientative-tip"
        className="border-ink bg-lemon flex items-start gap-3 border-2 p-3"
      >
        <Lightbulb aria-hidden="true" className="text-ink size-6 shrink-0" />
        <p className="font-body text-ink text-xs leading-snug font-semibold">
          <strong className="font-black uppercase">{t('step3.tipTitle')}: </strong>
          {t('step3.tipText')}
        </p>
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="border-ink bg-lemon rounded-control flex size-8 items-center justify-center border-2">
            <Sparkles aria-hidden="true" className="text-ink size-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-ink text-base leading-none font-black uppercase">
              {t('step3.curationTitle')}
            </span>
            <span className="font-label text-ink text-[10px] font-black uppercase opacity-75">
              {t('step3.curationSubtitle')}
            </span>
          </div>
        </div>
        <blockquote className="font-body text-ink border-ink bg-cream shadow-pop border-2 p-3 text-sm leading-snug font-bold italic">
          {t('step3.curationQuote')}
        </blockquote>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-purpose="result-facts">
          {[
            { label: t('step3.factCoverageLabel'), value: t('step3.factCoverageValue') },
            { label: t('step3.factFinishLabel'), value: t('step3.factFinishValue') },
            { label: t('step3.factFocusLabel'), value: t('step3.factFocusValue') },
            { label: t('step3.factTextureLabel'), value: t('step3.factTextureValue') },
          ].map((fact) => (
            <div
              key={fact.label}
              className="border-ink bg-cream flex flex-col gap-1 border-2 p-2 text-center"
            >
              <span className="font-label text-[9px] font-black uppercase opacity-75">
                {fact.label}
              </span>
              <span className="font-label text-[11px] leading-tight font-black uppercase">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TestTonoPanel>
  );
}

export function TestTonoPreferencesSummary({
  locale,
  rows,
}: {
  locale: string;
  rows: readonly { label: string; value: string }[];
}) {
  const t = useTranslations('testTono');

  return (
    <TestTonoPanel purpose="preferences-summary" className="flex flex-col gap-4">
      <div className="border-ink flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3">
        <div className="flex items-center gap-2">
          <Palette aria-hidden="true" className="text-ink size-6" />
          <h2 className="font-display text-ink text-sm leading-none font-black uppercase">
            {t('step2.summaryTitle')}
          </h2>
        </div>
        <TestTonoTag tone="aqua">{t('step2.summaryTag')}</TestTonoTag>
      </div>
      <dl className="flex flex-col gap-2" data-purpose="summary-rows">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-ink flex items-center justify-between gap-2 border-b-2 pb-2"
          >
            <dt className="font-label text-ink text-[10px] font-black uppercase opacity-75">
              {row.label}
            </dt>
            <dd className="font-label bg-lemon border-ink border-2 px-2 text-[10px] font-black uppercase">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <section
        data-purpose="summary-note"
        className="border-ink bg-lilac flex items-start gap-2 border-2 p-3"
      >
        <Sparkles aria-hidden="true" className="text-ink size-5 shrink-0" />
        <p className="font-body text-ink text-[11px] leading-snug font-semibold">
          {t('step2.summaryText')}
        </p>
      </section>
      <Link
        href={`/${locale}/test-de-tono/paso-3`}
        className="font-label border-ink bg-pink text-ink shadow-pop inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-xs font-black uppercase"
      >
        {t('step2.cta')}
        <ArrowRight aria-hidden="true" className="size-5" />
      </Link>
      <p className="font-body text-ink text-[11px] leading-snug font-semibold opacity-80">
        {t('step2.disclaimer')}
      </p>
    </TestTonoPanel>
  );
}
