import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        'border-ink bg-cream text-ink shadow-pop flex flex-col items-center gap-4 border-2 p-8 text-center',
        className
      )}
    >
      {icon}
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description ? <p className="font-body text-sm">{description}</p> : null}
      {action}
    </section>
  );
}
