import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPriceARS } from '@/lib/money/format-price-ars';

export interface PriceBlockProps {
  priceCents: number;
  salePriceCents?: number | null;
  locale?: string;
  className?: string;
}

export function PriceBlock({
  priceCents,
  salePriceCents,
  locale = 'es-AR',
  className,
}: PriceBlockProps) {
  const currentCents =
    salePriceCents != null && salePriceCents < priceCents ? salePriceCents : priceCents;
  const hasSale = currentCents !== priceCents;

  return (
    <div className={cn('font-display text-ink flex flex-wrap items-baseline gap-2', className)}>
      <data value={currentCents / 100} className="text-xl font-semibold">
        {formatPriceARS(currentCents / 100, locale)}
      </data>
      {hasSale ? <s className="text-sm">{formatPriceARS(priceCents / 100, locale)}</s> : null}
    </div>
  );
}
