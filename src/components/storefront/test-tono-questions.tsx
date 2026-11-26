'use client';

import { Droplets, Palette, Sparkles, Sun } from 'lucide-react';
import { TestTonoPanel, TestTonoTag } from './test-tono-primitives';
import { TestTonoOption } from './test-tono-product-card';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const SUN_OPTIONS = ['fast', 'golden', 'slow'] as const;
const FINISH_OPTIONS = [
  { key: 'dewy', icon: <Droplets className="size-5" /> },
  { key: 'glow', icon: <Sparkles className="size-5" /> },
  { key: 'satin', icon: <Palette className="size-5" /> },
  { key: 'soft', icon: <Sun className="size-5" /> },
] as const;
const JEWELRY_OPTIONS = ['gold', 'silver', 'both'] as const;
const SKIN_OPTIONS = ['dry', 'oily', 'balanced'] as const;

export function TestTonoQuestions() {
  const t = useTranslations('testTono');
  const [answers, setAnswers] = useState<Record<string, string>>({
    sun: 'golden',
    finish: 'dewy',
    jewelry: 'gold',
    skin: 'dry',
  });
  const [showTip, setShowTip] = useState(true);

  function pick(question: string, answer: string) {
    setAnswers((current) => ({ ...current, [question]: answer }));
  }

  return (
    <TestTonoPanel purpose="skin-questions" className="flex flex-col gap-5">
      <div className="border-ink flex flex-wrap items-start justify-between gap-3 border-b-2 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Palette aria-hidden="true" className="text-ink size-6" />
            <h2 className="font-display text-ink text-xl leading-none font-black uppercase">
              {t('step1.questionsTitle')}
            </h2>
          </div>
          <p className="font-body text-ink text-xs font-semibold opacity-80">
            {t('step1.questionsHint')}
          </p>
        </div>
        <TestTonoTag tone="pink">{t('step1.questionsTag')}</TestTonoTag>
      </div>

      <div className="flex flex-col gap-5" data-purpose="question-list">
        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="font-label text-ink text-sm font-black uppercase">
            {t('step1.question1')}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SUN_OPTIONS.map((key) => (
              <TestTonoOption
                key={key}
                label={t(`step1.sunOptions.${key}.label`)}
                description={t(`step1.sunOptions.${key}.hint`)}
                selected={answers.sun === key}
                onSelect={() => pick('sun', key)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="font-label text-ink text-sm font-black uppercase">
            {t('step1.question2')}
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FINISH_OPTIONS.map((item) => (
              <TestTonoOption
                key={item.key}
                label={t(`step1.finishOptions.${item.key}.label`)}
                description={t(`step1.finishOptions.${item.key}.hint`)}
                icon={item.icon}
                selected={answers.finish === item.key}
                onSelect={() => pick('finish', item.key)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="font-label text-ink text-sm font-black uppercase">
            {t('step1.question3')}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {JEWELRY_OPTIONS.map((key) => (
              <TestTonoOption
                key={key}
                label={t(`step1.jewelryOptions.${key}.label`)}
                description={t(`step1.jewelryOptions.${key}.hint`)}
                selected={answers.jewelry === key}
                onSelect={() => pick('jewelry', key)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="font-label text-ink text-sm font-black uppercase">
            {t('step1.question4')}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SKIN_OPTIONS.map((key) => (
              <TestTonoOption
                key={key}
                label={t(`step1.skinOptions.${key}.label`)}
                description={t(`step1.skinOptions.${key}.hint`)}
                selected={answers.skin === key}
                onSelect={() => pick('skin', key)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={showTip}
          aria-label={t('common.optionAria', { option: t('step1.tipTitle') })}
          onClick={() => setShowTip((current) => !current)}
          className="font-label border-ink text-ink flex min-h-11 items-center border-2 px-3 text-xs font-black uppercase"
        >
          {t('step1.tipTitle')}
        </button>
        <TestTonoTag tone="aqua">{t('common.guide')}</TestTonoTag>
      </div>
      {showTip ? (
        <section
          data-purpose="practical-tip"
          className="border-ink bg-lemon flex items-start gap-3 border-2 p-4"
        >
          <Sparkles aria-hidden="true" className="text-ink size-6 shrink-0" />
          <p className="font-body text-ink text-xs leading-snug font-semibold">
            <strong className="font-black uppercase">{t('step1.tipTitle')}: </strong>
            {t('step1.tipText')}
          </p>
        </section>
      ) : null}
    </TestTonoPanel>
  );
}
