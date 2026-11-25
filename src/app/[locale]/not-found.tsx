import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { HomeClub } from '@/components/storefront/home-panels';
import { HomeTrust } from '@/components/storefront/home-sections';
import Link from 'next/link';
import { NotFoundHero } from '@/components/storefront/not-found-hero';
import { ProductCard } from '@/components/storefront/product-card';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { priceInCents } from '@/components/storefront/storefront-product';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function LocaleNotFound() {
  const requestedLocale = await getLocale();
  const locale = routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'errors' });
  const tStore = await getTranslations({ locale, namespace: 'storefront' });

  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, price_cents, sale_price_cents, image_url')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="product" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-12 py-8"
    >
      <NotFoundHero locale={locale} />

      {products && products.length > 0 ? (
        <section id="favoritos-virales" className="col-span-full px-6 py-4">
          <div className="border-ink flex flex-col gap-4 border-b-[3px] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-label border-ink bg-cobalt text-cream shadow-pop-sm mb-3 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
                {t('notFoundPage.relatedLabel')}
              </p>
              <h2 className="font-display text-2xl font-semibold sm:text-4xl">
                {t('notFoundPage.relatedTitle')}
              </h2>
              <p className="font-body mt-2 text-sm">{t('notFoundPage.relatedDescription')}</p>
            </div>
            <Link
              href={`/${locale}/tienda`}
              className="font-label border-ink bg-lemon text-ink shadow-pop-sm inline-flex min-h-11 items-center gap-2 self-start border-2 px-4 text-xs font-bold uppercase"
            >
              {tStore('actions.shop')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                product={{
                  name: product.name,
                  slug: product.slug,
                  imageUrl: product.image_url,
                  priceCents: priceInCents(product),
                  salePriceCents: product.sale_price_cents,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <HomeTrust locale={locale} />
      <HomeClub locale={locale} />
    </StitchShell>
  );
}
