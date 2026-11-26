'use client';

import { Check, Palette, Sparkles } from 'lucide-react';
import { TONE_CLASS, TestTonoPanel, TestTonoSwatch, TestTonoTag } from './test-tono-primitives';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const SUBTONES = [
  { id: 'warm', key: 'warm', tone: 'lemon' as const },
  { id: 'neutral', key: 'neutral', tone: 'aqua' as const },
  { id: 'cool', key: 'cool', tone: 'lilac' as const },
];

const SHADES = [
  { id: 'very-light', key: 'veryLight', tone: 'cream' as const },
  { id: 'light', key: 'light', tone: 'lemon' as const },
  { id: 'medium', key: 'medium', tone: 'cobalt' as const },
  { id: 'bronzed', key: 'bronzed', tone: 'pink' as const },
  { id: 'deep', key: 'deep', tone: 'ink' as const },
];

export function TestTonoSubtones({
  subtone,
  onSubtoneChange,
  depth,
  onDepthChange,
}: {
  subtone: string;
  onSubtoneChange: (value: string) => void;
  depth: string;
  onDepthChange: (value: string) => void;
}) {
  const t = useTranslations('testTono');
  const [showDepth, setShowDepth] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      <TestTonoPanel purpose="subtone-selector" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Palette aria-hidden="true" className="text-ink size-6" />
            <h2 className="font-display text-ink text-lg leading-none font-black uppercase">
              {t('step1.selectorTitle')}
            </h2>
          </div>
          <TestTonoTag>{t('step1.orientativeTag')}</TestTonoTag>
        </div>
        <p className="font-body text-ink text-xs leading-snug font-semibold opacity-80">
          {t('step1.selectorHint')}
        </p>
        <div className="flex flex-col gap-3" data-purpose="subtone-options">
          {SUBTONES.map((item) => {
            const label = t(`step1.subtones.${item.key}.label`);
            const selected = subtone === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                aria-label={t('step1.subtoneAria', { tone: label })}
                onClick={() => onSubtoneChange(item.id)}
                className={cn(
                  'border-ink text-ink flex min-h-11 items-center justify-between gap-2 border-2 p-3 text-left',
                  selected ? 'bg-lemon shadow-pop' : 'bg-cream'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn('border-ink size-5 border-2', TONE_CLASS[item.tone])} />
                  <span className="font-label text-xs leading-tight font-black uppercase">
                    {label}
                  </span>
                </span>
                {selected ? <Check aria-hidden="true" className="size-5" /> : null}
              </button>
            );
          })}
        </div>
        <p className="font-body text-ink text-[11px] leading-snug font-semibold opacity-80">
          {t(`step1.subtones.${subtone}.hint`)}
        </p>
      </TestTonoPanel>

      <TestTonoPanel purpose="shade-selector" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            aria-pressed={showDepth}
            aria-label={t('common.optionAria', { option: t('step1.shadeTitle') })}
            onClick={() => setShowDepth((current) => !current)}
            className="font-label border-ink text-ink flex min-h-11 items-center border-2 px-3 text-xs font-black uppercase"
          >
            {t('step1.shadeTitle')}
          </button>
          <TestTonoTag tone="pink">{t('step1.shadeTag')}</TestTonoTag>
        </div>
        {showDepth ? (
          <>
            <p className="font-body text-ink text-[11px] leading-snug font-semibold opacity-80">
              {t('step1.shadeHint')}
            </p>
            <div className="grid grid-cols-5 gap-2" data-purpose="shade-options">
              {SHADES.map((item) => (
                <TestTonoSwatch
                  key={item.id}
                  label={t(`step1.shades.${item.key}.label`)}
                  tone={item.tone}
                  selected={depth === item.id}
                  onSelect={() => onDepthChange(item.id)}
                />
              ))}
            </div>
          </>
        ) : null}
      </TestTonoPanel>

      <section data-purpose="subtone-summary" className="border-ink bg-aqua shadow-pop p-4">
        <div className="flex items-start gap-3">
          <Sparkles aria-hidden="true" className="text-ink size-6 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-label text-ink text-xs leading-tight font-black uppercase">
              {t('step1.summaryTitle')}: {t(`step1.subtones.${subtone}.label`)} /{' '}
              {t(`step1.shades.${depth}.label`)}
            </span>
            <p className="font-body text-ink text-xs leading-snug font-semibold">
              {t('step1.summaryText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
