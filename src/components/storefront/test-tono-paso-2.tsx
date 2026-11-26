'use client';

import { Droplets, Palette, ShieldCheck } from 'lucide-react';
import { TestTonoHeading, TestTonoPanel, TestTonoTag } from './test-tono-primitives';
import type { ReactNode } from 'react';
import { TestTonoOption } from './test-tono-product-card';
import { TestTonoPreferencesSummary } from './test-tono-result-panel';
import { TestTonoStepper } from './test-tono-paso-1';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type ChoiceOption = string | { key: string; icon?: ReactNode };
type ChoiceGroup = {
  id: 'coverage' | 'finish' | 'focus';
  index: string;
  purpose: string;
  title: string;
  step: string;
  layout: string;
  options: readonly ChoiceOption[];
};

const COVERAGE: ChoiceOption[] = [
  { key: 'light', icon: <Droplets className="size-5" /> },
  { key: 'medium', icon: <Palette className="size-5" /> },
  { key: 'full', icon: <ShieldCheck className="size-5" /> },
];

function ChoiceModule({
  group,
  value,
  onSelect,
}: {
  group: ChoiceGroup;
  value: string;
  onSelect: (value: string) => void;
}) {
  const t = useTranslations('testTono');
  return (
    <TestTonoPanel purpose={group.purpose} className="flex flex-col gap-4">
      <TestTonoHeading index={group.index} title={group.title} step={group.step} />
      <div className={group.layout} data-purpose={`${group.id}-options`}>
        {group.options.map((item) => {
          const key = typeof item === 'string' ? item : item.key;
          return (
            <TestTonoOption
              key={key}
              label={t(`step2.${group.id}.${key}.label`)}
              icon={typeof item === 'string' ? undefined : item.icon}
              selected={value === key}
              onSelect={() => onSelect(key)}
            />
          );
        })}
      </div>
    </TestTonoPanel>
  );
}

function RangeModule() {
  const t = useTranslations('testTono');
  return (
    <TestTonoPanel purpose="module-range" className="flex flex-col gap-4">
      <TestTonoHeading index="D" title={t('step2.rangeTitle')} step={t('step2.rangeStep')} />
      <div className="border-ink flex flex-wrap items-center justify-between gap-2 border-2 p-3">
        <span className="font-label text-xs font-black uppercase opacity-75">
          {t('step2.rangeLabel')}
        </span>
        <TestTonoTag tone="lemon">{t('step2.rangeValue')}</TestTonoTag>
      </div>
      <p className="font-body text-ink text-[11px] leading-snug font-semibold opacity-80">
        {t('step2.rangeText')}
      </p>
    </TestTonoPanel>
  );
}

export function TestTonoPaso2({ locale }: { locale: string }) {
  const t = useTranslations('testTono');
  const [coverage, setCoverage] = useState('light');
  const [finish, setFinish] = useState('dewy');
  const [focus, setFocus] = useState('redness');

  const groups: ChoiceGroup[] = [
    {
      id: 'coverage',
      index: 'A',
      purpose: 'module-coverage',
      title: t('step2.coverageTitle'),
      step: t('step2.coverageStep'),
      layout: 'flex flex-col gap-2',
      options: COVERAGE,
    },
    {
      id: 'finish',
      index: 'B',
      purpose: 'module-finish',
      title: t('step2.finishTitle'),
      step: t('step2.finishStep'),
      layout: 'grid grid-cols-1 gap-2 sm:grid-cols-3',
      options: ['dewy', 'satin', 'matte'],
    },
    {
      id: 'focus',
      index: 'C',
      purpose: 'module-focus',
      title: t('step2.focusTitle'),
      step: t('step2.focusStep'),
      layout: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
      options: ['redness', 'dull', 'underEyes', 'texture'],
    },
  ];
  const values = { coverage, finish, focus };
  const handlers = { coverage: setCoverage, finish: setFinish, focus: setFocus };
  const rows = [
    { label: t('step2.rowSubtone'), value: t('step2.rowSubtoneValue') },
    { label: t('step2.rowCoverage'), value: t(`step2.coverage.${coverage}.label`) },
    { label: t('step2.rowFinish'), value: t(`step2.finish.${finish}.label`) },
    { label: t('step2.rowFocus'), value: t(`step2.focus.${focus}.label`) },
  ];

  return (
    <div data-purpose="test-tono-paso-2" className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <TestTonoPanel purpose="step2-hero" className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <TestTonoTag tone="aqua">{t('step2.eyebrow')}</TestTonoTag>
          <TestTonoTag tone="lemon">{t('step2.badge')}</TestTonoTag>
        </div>
        <h1 className="font-display text-ink mt-4 text-2xl leading-none font-black uppercase md:text-4xl">
          {t('hero.step2Title')}
        </h1>
        <p className="font-body text-ink mt-2 max-w-3xl text-sm leading-relaxed font-semibold opacity-80">
          {t('hero.step2Description')}
        </p>
        <TestTonoStepper active={2} locale={locale} />
      </TestTonoPanel>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          {groups.map((group) => (
            <ChoiceModule
              key={group.id}
              group={group}
              value={values[group.id]}
              onSelect={handlers[group.id]}
            />
          ))}
          <RangeModule />
        </div>
        <div className="lg:col-span-5">
          <TestTonoPreferencesSummary locale={locale} rows={rows} />
        </div>
      </div>
    </div>
  );
}
