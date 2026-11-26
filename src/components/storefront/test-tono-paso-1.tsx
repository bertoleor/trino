'use client';

import { ArrowRight, Check, Lock, Sparkles } from 'lucide-react';
import { TestTonoPanel, TestTonoTag } from './test-tono-primitives';
import Link from 'next/link';
import { TestTonoQuestions } from './test-tono-questions';
import { TestTonoSubtones } from './test-tono-subtones';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const STEPPER_ITEMS = [
  { number: 1, key: 'one', href: 'paso-1' },
  { number: 2, key: 'two', href: 'paso-2' },
  { number: 3, key: 'three', href: 'paso-3' },
] as const;

export function TestTonoStepper({ active, locale }: { active: 1 | 2 | 3; locale: string }) {
  const t = useTranslations('testTono');
  return (
    <nav
      data-purpose="test-tono-stepper"
      aria-label={t('common.stepper')}
      className="border-ink mt-6 grid grid-cols-1 gap-3 border-t-2 pt-5 md:grid-cols-3"
    >
      {STEPPER_ITEMS.map((item) => {
        const state = item.number === active ? 'active' : item.number < active ? 'done' : 'pending';
        const Icon = state === 'done' ? Check : state === 'pending' ? Lock : ArrowRight;
        return (
          <Link
            key={item.number}
            href={`/${locale}/test-de-tono/${item.href}`}
            data-purpose={`stepper-${state}`}
            aria-current={state === 'active' ? 'step' : undefined}
            className={cn(
              'font-label border-ink text-ink flex min-h-11 items-center justify-between gap-2 border-2 p-3 text-[10px] font-black uppercase',
              state === 'active' && 'bg-pink shadow-pop',
              state === 'done' && 'bg-aqua',
              state === 'pending' && 'bg-lilac'
            )}
          >
            <span className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{t(`steps.${item.key}.label`)}</span>
            </span>
            <span className="border-ink bg-cream border-2 px-1 py-0.5">
              {t(`steps.${item.key}.${state}`)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TestTonoPaso1({ locale }: { locale: string }) {
  const t = useTranslations('testTono');
  const [subtone, setSubtone] = useState('warm');
  const [depth, setDepth] = useState('medium');

  return (
    <div data-purpose="test-tono-paso-1" className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <TestTonoPanel purpose="step1-hero" className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <TestTonoTag tone="aqua">{t('hero.eyebrow')}</TestTonoTag>
          <TestTonoTag tone="lemon">{t('common.guide')}</TestTonoTag>
        </div>
        <h1 className="font-display text-ink mt-4 text-2xl leading-none font-black uppercase md:text-4xl">
          {t('hero.step1Title')}
        </h1>
        <p className="font-body text-ink mt-2 max-w-3xl text-sm leading-relaxed font-semibold opacity-80">
          {t('hero.step1Description')}
        </p>
        <section
          data-purpose="step1-badge"
          className="border-ink bg-lemon shadow-pop mt-4 flex items-center gap-3 border-2 p-3"
        >
          <Sparkles aria-hidden="true" className="text-ink size-6 shrink-0" />
          <div className="flex flex-col">
            <span className="font-label text-ink text-xs font-black uppercase">
              {t('hero.badgeTitle')}
            </span>
            <span className="font-body text-ink text-xs font-semibold">{t('hero.badgeText')}</span>
          </div>
        </section>
        <TestTonoStepper active={1} locale={locale} />
      </TestTonoPanel>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TestTonoSubtones
            subtone={subtone}
            onSubtoneChange={setSubtone}
            depth={depth}
            onDepthChange={setDepth}
          />
        </div>
        <div className="lg:col-span-7">
          <TestTonoQuestions />
        </div>
      </div>

      <TestTonoPanel
        purpose="step1-dock"
        className="bg-lemon flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <Sparkles aria-hidden="true" className="text-ink size-8 shrink-0" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <TestTonoTag tone="aqua">{t('common.guide')}</TestTonoTag>
              <span className="font-label text-ink text-xs font-black uppercase opacity-75">
                {t('common.multibrand')}
              </span>
            </div>
            <p className="font-body text-ink text-sm font-black">{t('step1.dockText')}</p>
          </div>
        </div>
        <Link
          href={`/${locale}/test-de-tono/paso-2`}
          className="font-label border-ink bg-pink text-ink shadow-pop inline-flex min-h-11 items-center justify-center gap-3 border-2 px-6 text-xs font-black uppercase"
        >
          {t('step1.dockCta')}
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </TestTonoPanel>
    </div>
  );
}
