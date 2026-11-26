'use client';

import { ArrowUpRight, Droplets, Palette, Sparkles } from 'lucide-react';
import { TONE_CLASS, TestTonoTag, type TestTonoTone } from './test-tono-primitives';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const ICONS: Record<string, ReactNode> = {
  base: <Droplets className="size-8" />,
  lips: <Sparkles className="size-8" />,
  blush: <Palette className="size-8" />,
};

export function TestTonoProductCard({
  index,
  productKey,
  tone,
  locale,
  className,
}: {
  index: string;
  productKey: 'base' | 'lips' | 'blush';
  tone: TestTonoTone;
  locale: string;
  className?: string;
}) {
  const t = useTranslations('testTono');
  const toneClass = TONE_CLASS[tone];

  return (
    <article
      data-purpose={`product-${productKey}`}
      className={cn('border-ink shadow-pop flex flex-col border-2', className)}
    >
      <div className={cn('border-ink flex h-44 items-center justify-center border-b-2', toneClass)}>
        <span aria-hidden="true">{ICONS[productKey]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TestTonoTag tone={tone}>{t(`step3.${productKey}.badge`)}</TestTonoTag>
          <span className="font-label text-ink text-[10px] font-black uppercase opacity-75">
            {index}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-ink text-lg leading-none font-black uppercase">
            {t(`step3.${productKey}.name`)}
          </h3>
          <p className="font-body text-ink text-xs leading-snug font-semibold opacity-80">
            {t(`step3.${productKey}.description`)}
          </p>
        </div>
        <div className="border-ink bg-cream mt-auto flex items-center justify-between gap-2 border-2 p-2">
          <span className="font-label text-ink text-[10px] font-black uppercase">
            {t(`step3.${productKey}.shade`)}
          </span>
          <span className="font-label border-ink bg-lemon border-2 px-2 text-[10px] font-black uppercase">
            {t('step3.orientativeShort')}
          </span>
        </div>
        <Link
          href={`/${locale}/tienda`}
          aria-label={t('step3.shopAria', { product: t(`step3.${productKey}.name`) })}
          className="font-label border-ink bg-ink text-cream inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-[11px] font-black uppercase"
        >
          {t('step3.shopCta')}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function TestTonoOption({
  label,
  description,
  selected,
  onSelect,
  icon,
  badge,
  className,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  badge?: string;
  className?: string;
}) {
  const t = useTranslations('testTono');
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={t('common.optionAria', { option: label })}
      onClick={onSelect}
      className={cn(
        'font-body text-ink min-h-11 border-2 p-3 text-left transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5',
        'border-ink',
        selected ? 'bg-lemon shadow-pop' : 'bg-cream',
        className
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2">
          {icon ? <span aria-hidden="true">{icon}</span> : null}
          <span className="font-label text-sm leading-tight font-black uppercase">{label}</span>
        </span>
        <span
          className={cn(
            'font-label border-ink border-2 px-1 text-[10px] font-black uppercase',
            selected ? 'bg-pink' : 'bg-cream'
          )}
        >
          {badge ?? (selected ? t('common.selected') : t('common.choose'))}
        </span>
      </span>
      {description ? (
        <span className="font-body mt-1 block text-[11px] leading-snug font-semibold opacity-80">
          {description}
        </span>
      ) : null}
    </button>
  );
}
