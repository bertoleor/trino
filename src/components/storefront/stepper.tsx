'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decrementLabel: string;
  incrementLabel: string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  decrementLabel,
  incrementLabel,
  className,
}: StepperProps) {
  return (
    <div
      className={cn('border-ink bg-cream text-ink inline-flex items-center border-2', className)}
    >
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 items-center justify-center disabled:opacity-50"
      >
        <Minus aria-hidden="true" />
      </button>
      <output aria-live="polite" className="font-display min-w-10 text-center font-semibold">
        {value}
      </output>
      <button
        type="button"
        aria-label={incrementLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-11 w-11 items-center justify-center disabled:opacity-50"
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}
