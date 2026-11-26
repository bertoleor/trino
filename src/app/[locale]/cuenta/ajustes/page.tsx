import {
  AjustesBreadcrumb,
  AjustesHeader,
  AjustesSidebar,
  AjustesTabs,
} from '@/components/storefront/cuenta-ajustes-header';
import { AjustesSections } from '@/components/storefront/cuenta-ajustes-sections';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ajustes' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: { canonical: localizedUrl(locale, 'cuenta/ajustes') },
    robots: { index: false, follow: false },
  };
}

export default async function AjustesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="shop" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8"
    >
      <AjustesBreadcrumb locale={locale} />
      <AjustesHeader locale={locale} hasSession={Boolean(user)} />
      <AjustesTabs locale={locale} />
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <AjustesSidebar locale={locale} email={email} />
        <AjustesSections locale={locale} email={email} />
      </div>
    </StitchShell>
  );
}
