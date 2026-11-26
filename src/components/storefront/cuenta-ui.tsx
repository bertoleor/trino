import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CuentaTone = 'cream' | 'ink' | 'cobalt' | 'pink' | 'lemon' | 'lilac' | 'aqua';

const TONES: Record<CuentaTone, string> = {
  cream: 'bg-cream text-ink',
  ink: 'bg-ink text-cream',
  cobalt: 'bg-cobalt text-cream',
  pink: 'bg-pink text-ink',
  lemon: 'bg-lemon text-ink',
  lilac: 'bg-lilac text-ink',
  aqua: 'bg-aqua text-ink',
};

export function CuentaPanel({
  purpose,
  id,
  tone = 'cream',
  className,
  children,
}: {
  purpose: string;
  id?: string;
  tone?: CuentaTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-purpose={purpose}
      className={cn('border-ink shadow-pop-lg rounded-card border-2 p-5', TONES[tone], className)}
    >
      {children}
    </section>
  );
}

export function CuentaBadge({
  tone = 'ink',
  className,
  children,
}: {
  tone?: CuentaTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'border-ink rounded-control font-label inline-flex items-center border-2 px-3 py-1 text-[11px] font-bold tracking-wide uppercase',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function CuentaActionLink({
  href,
  tone = 'lemon',
  external = false,
  className,
  children,
}: {
  href: string;
  tone?: CuentaTone;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const styles = cn(
    'border-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-2 font-label text-xs font-bold tracking-wide uppercase',
    TONES[tone],
    className
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
}
