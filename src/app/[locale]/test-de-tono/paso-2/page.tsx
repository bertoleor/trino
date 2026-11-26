import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import type { Metadata } from 'next';
import { TestTonoPaso2 } from '@/components/storefront/test-tono-paso-2';
import { TestTonoShell } from '@/components/storefront/test-tono-shell';
import { getTranslations } from 'next-intl/server';

const PATH = 'test-de-tono/paso-2';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'testTono' });
  const url = localizedUrl(locale, PATH);
  return {
    title: t('meta.step2.title'),
    description: t('meta.step2.description'),
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: { type: 'website', url, locale },
  };
}

export default async function TestTonoStep2Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <TestTonoShell locale={locale} step={2}>
      <TestTonoPaso2 locale={locale} />
    </TestTonoShell>
  );
}
