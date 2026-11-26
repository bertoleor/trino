import type { ReactNode } from 'react';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from './storefront-footer';
import { StorefrontHeader } from './storefront-header';

export function TestTonoShell({
  locale,
  step,
  children,
}: {
  locale: string;
  step: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div data-purpose={`test-tono-step-${step}`}>
      <StitchShell
        shellType="web_standard"
        header={<StorefrontHeader locale={locale} active="shop" />}
        footer={<StorefrontFooter locale={locale} />}
        contentClassName="mx-auto flex w-full max-w-7xl flex-col gap-0 px-4 py-8"
      >
        {children}
      </StitchShell>
    </div>
  );
}
