import { type BioLink, BioLinks } from '@/components/storefront/bio-links';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import { BioShareButton } from '@/components/storefront/bio-share-button';
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
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
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-lemon pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(var(--ink) 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="border-ink shadow-pop bg-pink absolute -top-8 -right-10 block size-32 rounded-full border-[3px]" />
          <span className="border-ink shadow-pop bg-cobalt absolute top-28 -right-4 block size-14 rounded-full border-[3px]" />
          <span className="border-ink shadow-pop bg-aqua absolute top-[420px] -left-10 block size-24 rounded-full border-[3px]" />
        </div>
        <div className="relative mx-auto w-full max-w-md px-5 py-10 md:max-w-5xl md:px-10 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-14">
            <section>
              <span className="border-ink shadow-pop-sm bg-cream text-ink font-label rounded-control inline-flex items-center gap-2 border-2 px-3 py-1 text-xs font-black tracking-wider uppercase">
                <Sparkles aria-hidden="true" />
                {t('badge')}
              </span>
              <div className="mt-5 flex items-center gap-4">
                <div className="border-ink shadow-pop bg-cream rounded-card flex size-24 flex-col items-center justify-center border-[3px]">
                  <span className="font-display text-2xl font-extrabold tracking-tight">
                    {t('logo.brand')}
                  </span>
                  <span className="font-label text-pink -mt-1 text-xs font-black tracking-widest uppercase">
                    {t('logo.line')}
                  </span>
                </div>
              </div>
              <h1 className="font-display mt-5 text-4xl leading-none font-extrabold tracking-tight md:text-5xl">
                {t('headline.start')}{' '}
                <span className="text-cobalt decoration-pink underline decoration-4 underline-offset-4">
                  {t('headline.accent')}
                </span>
              </h1>
              <p className="border-ink shadow-pop-sm bg-cream rounded-card mt-5 border-2 p-4 font-semibold">
                {t('intro')}
              </p>
              <p className="font-label mt-4 text-sm font-black tracking-wider uppercase">
                {t('channels')}
              </p>
              <div className="border-ink shadow-pop bg-ink rounded-card mt-5 flex overflow-hidden border-[3px]">
                <div className="neopop-marquee flex w-max items-center gap-6 py-2">
                  {[...ticker, ...ticker].map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      aria-hidden={index >= ticker.length ? true : undefined}
                      className="font-label text-cream text-xs font-black tracking-widest uppercase"
                    >
                      ✦ {item}
                    </span>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <BioLinks links={links} />
              <div className="mt-8 flex justify-center">
                <BioShareButton
                  label={t('share.label')}
                  copied={t('share.copied')}
                  title={t('meta.title')}
                />
              </div>
            </section>
          </div>
          <footer className="mt-12 text-center">
            <p className="font-display text-2xl font-extrabold tracking-tight">
              trino<span className="text-pink">.</span>
            </p>
            <p className="font-body mt-1 text-xs font-bold">{t('footer.copyright')}</p>
            <p className="font-label mt-1 text-[10px] font-black tracking-widest uppercase">
              {t('footer.tagline')}
            </p>
          </footer>
        </div>
      </div>
    </StitchShell>
  );
}
