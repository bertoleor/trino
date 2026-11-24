import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  count?: number;
}

export function FilterChip({
  label,
  selected = false,
  count,
  className,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'border-ink font-body text-ink hover:shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-shadow',
        selected ? 'bg-pink shadow-pop-sm' : 'bg-cream',
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {count != null ? (
        <span className="border-ink rounded-full border-2 px-2 text-xs">{count}</span>
      ) : null}
    </button>
  );
}
