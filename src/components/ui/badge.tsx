import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline-none', {
  variants: {
    variant: {
      default: 'bg-[var(--color-mostaza)] text-[var(--text-grafito)]',
      success: 'bg-[var(--color-verde)] text-white',
      destructive: 'bg-red-500 text-white',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
