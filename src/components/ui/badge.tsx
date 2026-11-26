import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-none px-3 py-1 text-[var(--text-primary)] font-semibold focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--cream)] border-2 border-[var(--ink)] text-[var(--ink)]',
        success:
          'bg-[var(--surface-success)] border-2 border-[var(--surface-success)] text-[var(--text-primary)]',
        destructive:
          'bg-[var(--surface-error)] border-2 border-[var(--surface-error)] text-[var(--text-primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
