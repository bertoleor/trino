import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { productJsonLd } from '@/lib/seo/json-ld';
import { routing } from '@/i18n/routing';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('name, description, image_url').eq('slug', slug).single();
  const title = product?.name ?? slug;
  const description = product?.description ?? title;
  const url = `https://trino.com.ar/${locale}/producto/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/producto/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages },
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
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, price, price_cents, image_url, slug')
    .eq('slug', slug)
    .single();
  if (!product) notFound();
  const nonce = nonceProp((await headers()).get(NONCE_HEADER));
  const priceCents = (product as { price_cents?: number }).price_cents ?? Math.round(Number(product.price) * 100);
  const ld = productJsonLd({
    name: product.name,
    slug: product.slug,
    priceCents,
    currency: 'ARS',
    image: product.image_url ?? 'https://trino.com.ar/og.jpg',
    description: product.description ?? undefined,
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-zinc-100" />
        <div>
          <h1 className="text-3xl font-bold lowercase">{product.name}</h1>
          <p className="mt-4 text-zinc-600">{product.description}</p>
          <p className="mt-6 text-2xl font-semibold">ARS {(priceCents / 100).toFixed(2)}</p>
          <button className="mt-8 min-h-[44px] w-full rounded-full bg-zinc-900 px-6 py-3 text-white sm:w-auto">agregar al carrito.</button>
        </div>
      </div>
    </main>
  );
}
