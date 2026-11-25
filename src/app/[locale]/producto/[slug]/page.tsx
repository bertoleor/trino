import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import {
  ProductBreadcrumb,
  ProductGallery,
  ProductPurchase,
} from '@/components/storefront/product-sections';
import {
  ProductCommunity,
  ProductDetails,
  RelatedProducts,
} from '@/components/storefront/product-panels';
import { languageAlternates, localizedUrl, siteUrl } from '@/lib/seo/site';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { priceInCents } from '@/components/storefront/storefront-product';
import { productJsonLd } from '@/lib/seo/json-ld';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('slug', slug)
    .single();
  const title = product?.name ?? slug;
  const description = product?.description ?? title;
  const url = localizedUrl(locale, `producto/${slug}`);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(`producto/${slug}`) },
    openGraph: {
      title,
      description,
      url,
      images: product?.image_url ? [{ url: product.image_url }] : [],
      type: 'website',
      locale,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select(
      'id, name, description, price, price_cents, sale_price_cents, image_url, slug, shade, brand, category'
    )
    .eq('slug', slug)
    .single();
  if (!product) notFound();

  const nonce = nonceProp((await headers()).get(NONCE_HEADER));
  const ld = productJsonLd({
    name: product.name,
    slug: product.slug,
    priceCents: priceInCents(product),
    currency: 'ARS',
    image: product.image_url ?? siteUrl('og.jpg'),
    description: product.description ?? undefined,
    locale,
  });

  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, price, price_cents, sale_price_cents, image_url')
    .is('deleted_at', null)
    .eq('is_active', true)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <StitchShell
      shellType="web_standard"
      header={<StorefrontHeader locale={locale} active="product" />}
      footer={<StorefrontFooter locale={locale} />}
      contentClassName="flex flex-col gap-16 px-6 py-10"
    >
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <ProductBreadcrumb locale={locale} name={product.name} />
      <section className="col-span-full grid gap-10 lg:grid-cols-2">
        <ProductGallery locale={locale} product={product} />
        <ProductPurchase locale={locale} product={product} priceCents={priceInCents(product)} />
      </section>
      <ProductDetails locale={locale} />
      <RelatedProducts locale={locale} products={related ?? []} />
      <ProductCommunity locale={locale} />
    </StitchShell>
  );
}
