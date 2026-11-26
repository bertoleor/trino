import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import {
  ProductoDetalleBanner,
  ProductoDetalleBreadcrumb,
  ProductoDetalleGallery,
} from '@/components/storefront/producto-detalle-principal';
import {
  ProductoDetalleBundle,
  ProductoDetalleCompatibles,
} from '@/components/storefront/producto-detalle-curaduria';
import {
  ProductoDetalleCommunity,
  ProductoDetalleDetails,
} from '@/components/storefront/producto-detalle-paneles';
import { languageAlternates, localizedUrl, siteUrl } from '@/lib/seo/site';
import type { Metadata } from 'next';
import { ProductoDetalleCompra } from '@/components/storefront/producto-detalle-compra';
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
      contentClassName="flex flex-col gap-12 py-8"
    >
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <ProductoDetalleBreadcrumb locale={locale} name={product.name} />
      <ProductoDetalleBanner locale={locale} />
      <section className="col-span-full grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ProductoDetalleGallery locale={locale} product={product} />
        </div>
        <div className="lg:col-span-6">
          <ProductoDetalleCompra
            locale={locale}
            product={product}
            priceCents={priceInCents(product)}
          />
        </div>
      </section>
      <ProductoDetalleBundle locale={locale} />
      <ProductoDetalleDetails locale={locale} />
      <ProductoDetalleCompatibles locale={locale} products={related ?? []} />
      <ProductoDetalleCommunity locale={locale} />
    </StitchShell>
  );
}
