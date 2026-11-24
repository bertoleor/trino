import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ShadeSwatchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  shadeLabel: string;
  selected?: boolean;
}

export function ShadeSwatch({
  color,
  shadeLabel,
  selected = false,
  className,
  style,
  ...props
}: ShadeSwatchProps) {
  return (
    <button
      type="button"
      aria-label={shadeLabel}
      aria-pressed={selected}
      style={{ ...style, backgroundColor: color }}
      className={cn(
        'border-ink h-11 min-h-11 w-11 min-w-11 border-2',
        selected && 'shadow-pop-sm ring-cobalt ring-2 ring-offset-2',
        className
      )}
      {...props}
    />
  );
}
