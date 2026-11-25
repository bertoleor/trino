import { localizedUrl, siteUrl } from '@/lib/seo/site';

export function productJsonLd(input: {
  name: string;
  slug: string;
  priceCents: number;
  currency?: string;
  image: string;
  description?: string;
  availability?: string;
  locale?: string;
  // Carried for the <script nonce> contract; never embedded in the payload.
  nonce?: string;
}) {
  const price = (input.priceCents / 100).toFixed(2);
  const path = `producto/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description ?? input.name,
    image: input.image,
    sku: input.slug,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: input.currency ?? 'ARS',
      availability: `https://schema.org/${input.availability ?? 'InStock'}`,
      url: input.locale ? localizedUrl(input.locale, path) : siteUrl(path),
    },
  };
}

export function articleJsonLd(input: {
  headline: string;
  slug: string;
  excerpt?: string;
  image?: string;
  datePublished?: string;
  author?: string;
  locale?: string;
  // Carried for the <script nonce> contract; never embedded in the payload.
  nonce?: string;
}) {
  const path = `cultura/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.excerpt,
    image: input.image,
    datePublished: input.datePublished,
    author: { '@type': 'Person', name: input.author ?? 'trino.' },
    mainEntityOfPage: input.locale ? localizedUrl(input.locale, path) : siteUrl(path),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
