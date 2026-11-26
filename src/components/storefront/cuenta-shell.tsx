import type { ReactNode } from 'react';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';

export function CuentaShell({ locale, children }: { locale: string; children: ReactNode }) {
  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8"
    >
      {children}
    </StitchShell>
  );
}
