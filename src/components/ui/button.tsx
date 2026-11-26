import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-none min-h-[44px] min-w-[44px] px-6 py-2 text-[var(--text-primary)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 border-none',
        secondary:
          'bg-[var(--surface-success)] hover:bg-[var(--surface-success)]/90 border-none text-white',
        outline:
          'border-2 border-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-white',
        ghost: 'hover:bg-[var(--cream)] hover:text-[var(--ink)]',
      },
      size: { default: 'h-11', sm: 'h-9', lg: 'h-12', icon: 'h-11 w-11 p-0' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span className="animate-pulse opacity-70">…</span> : children}
    </button>
  );
}
