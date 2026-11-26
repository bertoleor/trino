'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type TestTonoTone = 'cream' | 'lemon' | 'pink' | 'lilac' | 'aqua' | 'cobalt' | 'ink';

export const TONE_CLASS: Record<TestTonoTone, string> = {
  cream: 'bg-cream text-ink',
  lemon: 'bg-lemon text-ink',
  pink: 'bg-pink text-ink',
  lilac: 'bg-lilac text-ink',
  aqua: 'bg-aqua text-ink',
  cobalt: 'bg-cobalt text-cream',
  ink: 'bg-ink text-cream',
};

export function TestTonoPanel({
  purpose,
  children,
  className,
}: {
  purpose: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-purpose={purpose}
      className={cn('border-ink bg-cream shadow-pop-lg border-2 p-5', className)}
    >
      {children}
    </section>
  );
}

export function TestTonoTag({
  children,
  tone = 'lemon',
  className,
}: {
  children: ReactNode;
  tone?: TestTonoTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-label inline-flex min-h-6 items-center border-2 px-2 text-[10px] font-black uppercase',
        'border-ink',
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function TestTonoHeading({
  index,
  title,
  step,
}: {
  index: string;
  title: string;
  step: string;
}) {
  return (
    <div className="border-ink flex flex-wrap items-center justify-between gap-2 border-b-2 pb-2">
      <div className="flex items-center gap-2">
        <span className="font-label border-ink bg-ink text-cream flex size-7 items-center justify-center border-2 text-xs font-black">
          {index}
        </span>
        <h2 className="font-display text-ink text-base leading-none font-black uppercase">
          {title}
        </h2>
      </div>
      <TestTonoTag tone="lemon">{step}</TestTonoTag>
    </div>
  );
}

export function TestTonoSwatch({
  label,
  tone,
  selected,
  onSelect,
}: {
  label: string;
  tone: TestTonoTone;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('testTono');
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={t('step1.swatchAria', { tone: label })}
      onClick={onSelect}
      className={cn(
        'border-ink flex min-h-11 flex-col items-center gap-1 border-2 p-1',
        selected && 'shadow-pop'
      )}
    >
      <span className={cn('h-8 w-full border-2', 'border-ink', TONE_CLASS[tone])} />
      <span className="font-label text-ink text-center text-[10px] leading-none font-black uppercase">
        {label}
      </span>
    </button>
  );
}
