import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 min-h-[44px] w-full rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] px-4 py-2 text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
