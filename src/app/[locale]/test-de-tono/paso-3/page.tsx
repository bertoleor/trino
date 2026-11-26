import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import type { Metadata } from 'next';
import { TestTonoPaso3 } from '@/components/storefront/test-tono-paso-3';
import { TestTonoShell } from '@/components/storefront/test-tono-shell';
import { getTranslations } from 'next-intl/server';

const PATH = 'test-de-tono/paso-3';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'testTono' });
  const url = localizedUrl(locale, PATH);
  return {
    title: t('meta.step3.title'),
    description: t('meta.step3.description'),
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: { type: 'website', url, locale },
  };
}

export default async function TestTonoStep3Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <TestTonoShell locale={locale} step={3}>
      <TestTonoPaso3 locale={locale} />
    </TestTonoShell>
  );
}
