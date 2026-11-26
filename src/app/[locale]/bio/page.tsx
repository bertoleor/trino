import { BioBrandShowcase, BioInfoPanel } from '@/components/storefront/bio-desktop-panels';
import { type BioLink, BioLinks } from '@/components/storefront/bio-links';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import { BioBackdrop } from '@/components/storefront/bio-backdrop';
import { BioHero } from '@/components/storefront/bio-hero';
import { BioShareButton } from '@/components/storefront/bio-share-button';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bio' });
  const url = localizedUrl(locale, 'bio');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: { canonical: url, languages: languageAlternates('bio') },
    openGraph: {
      type: 'website',
      url,
      locale,
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default async function BioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bio' });
  const ticker = t.raw('ticker') as string[];
  const text = (key: string) => t.raw(key) as string;
  const links: BioLink[] = (
    [
      { id: 'instagram', href: 'https://www.instagram.com/trinopunto/', tone: 'pink' },
      { id: 'tiktok', href: 'https://www.tiktok.com/@puntotrino', tone: 'lilac' },
      { id: 'whatsapp', href: 'https://wa.link/lf1o1e', tone: 'aqua' },
      {
        id: 'vip',
        href: 'https://chat.whatsapp.com/B73GiMAFrdwEbSU7vhwfqS',
        tone: 'orange',
      },
      { id: 'facebook', href: 'https://www.facebook.com/trinopunto', tone: 'cobalt' },
    ] as const
  ).map((link) => ({
    ...link,
    title: text(`links.${link.id}.title`),
    handle: text(`links.${link.id}.handle`),
    detail: text(`links.${link.id}.detail`),
    tag: text(`links.${link.id}.tag`),
  }));

  return (
    <StitchShell shellType="mobile_blank">
      <div className="relative min-h-dvh overflow-hidden">
        <BioBackdrop />
        <div className="relative mx-auto w-full max-w-md px-5 py-10 md:max-w-4xl md:px-6 md:py-8">
          <BioHero
            badge={t('badge')}
            brand={t('logo.brand')}
            headlineStart={t('headline.start')}
            headlineAccent={t('headline.accent')}
            intro={t('intro')}
            channels={t('channels')}
            ticker={ticker}
          />

          <main className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-start">
            <section
              data-purpose="official-channels-list"
              className="flex flex-col gap-3 md:col-span-7"
            >
              <BioLinks links={links} />
              <BioShareButton
                fullWidth
                label={t('share.label')}
                copied={t('share.copied')}
                title={t('meta.title')}
              />
            </section>

            <BioInfoPanel
              links={links}
              badge={t('badge')}
              channels={t('channels')}
              intro={t('intro')}
              headlineStart={t('headline.start')}
              headlineAccent={t('headline.accent')}
              footerTagline={t('footer.tagline')}
            />
          </main>

          <BioBrandShowcase
            logoBrand={t('logo.brand')}
            headlineStart={t('headline.start')}
            headlineAccent={t('headline.accent')}
            footerTagline={t('footer.tagline')}
            metaDescription={t('meta.description')}
          />

          <footer
            data-purpose="footer-credits"
            className="border-ink shadow-pop bg-cream rounded-card mt-6 border-[3px] p-4 text-center"
          >
            <p className="font-display text-3xl font-extrabold tracking-tight">
              trino<span className="text-pink">.</span>
            </p>
            <p className="font-label mt-1 text-xs font-black tracking-wider uppercase">
              {t('footer.tagline')}
            </p>
            <p className="font-body mt-1 text-[11px] font-bold">{t('footer.copyright')}</p>
          </footer>
        </div>
      </div>
    </StitchShell>
  );
}
