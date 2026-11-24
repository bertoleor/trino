import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type ShellType =
  'mobile_tab' | 'mobile_stack' | 'mobile_blank' | 'web_standard' | 'web_dashboard' | 'web_blank';

export interface ShellTab {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface StitchShellProps {
  shellType: ShellType;
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  tabs?: readonly ShellTab[];
  activeHref?: string;
  navLabel?: string;
  className?: string;
  contentClassName?: string;
}

function ShellHeader({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <header className="border-ink bg-cream sticky top-0 z-10 flex min-h-16 items-center justify-between border-b-2 px-4">
      {children}
    </header>
  );
}

function TabBar({
  tabs,
  activeHref,
  navLabel,
}: {
  tabs: readonly ShellTab[];
  activeHref?: string;
  navLabel?: string;
}) {
  if (tabs.length === 0) return null;
  return (
    <nav
      aria-label={navLabel}
      className="border-ink bg-cream fixed bottom-0 left-0 z-20 flex w-full border-t-2"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={activeHref === tab.href ? 'page' : undefined}
          className="text-ink aria-[current=page]:bg-pink flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-semibold"
        >
          {tab.icon}
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function StitchShell({
  shellType,
  children,
  header,
  sidebar,
  footer,
  tabs = [],
  activeHref,
  navLabel,
  className,
  contentClassName,
}: StitchShellProps) {
  if (shellType === 'web_standard') {
    return (
      <div
        data-shell-type={shellType}
        className={cn('bg-cream text-ink mx-auto w-full max-w-[1440px]', className)}
      >
        <ShellHeader>{header}</ShellHeader>
        <main className={cn('grid grid-cols-12 gap-6 px-6 py-8', contentClassName)}>
          {children}
        </main>
        {footer ? (
          <footer className="border-ink bg-cream border-t-2 px-6 py-10">{footer}</footer>
        ) : null}
      </div>
    );
  }

  if (shellType === 'web_dashboard') {
    return (
      <div
        data-shell-type={shellType}
        className={cn('bg-cream text-ink flex min-h-dvh', className)}
      >
        <aside className="border-ink w-64 shrink-0 border-r-2 p-4">{sidebar}</aside>
        <div className="min-w-0 flex-1">
          <ShellHeader>{header}</ShellHeader>
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  if (shellType === 'web_blank') {
    return (
      <main
        data-shell-type={shellType}
        className={cn('bg-cream text-ink mx-auto w-full max-w-md p-6', className)}
      >
        {children}
      </main>
    );
  }

  if (shellType === 'mobile_blank') {
    return (
      <main data-shell-type={shellType} className={cn('bg-cream text-ink min-h-dvh', className)}>
        {children}
      </main>
    );
  }

  const isTabbed = shellType === 'mobile_tab';
  return (
    <div
      data-shell-type={shellType}
      className={cn(
        'bg-cream text-ink mx-auto flex min-h-dvh w-full max-w-[390px] flex-col',
        isTabbed && 'pb-20',
        className
      )}
    >
      <ShellHeader>{header}</ShellHeader>
      <main className="flex-1 px-4 py-6">{children}</main>
      {footer ? (
        <div className="border-ink bg-cream sticky bottom-0 z-10 border-t-2 p-4">{footer}</div>
      ) : null}
      {isTabbed ? <TabBar tabs={tabs} activeHref={activeHref} navLabel={navLabel} /> : null}
    </div>
  );
}
