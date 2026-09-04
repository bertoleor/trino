export function productJsonLd(input: {
  name: string;
  slug: string;
  priceCents: number;
  currency?: string;
  image: string;
  description?: string;
  availability?: string;
}) {
  const price = (input.priceCents / 100).toFixed(2);
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
      url: `https://trino.com.ar/producto/${input.slug}`,
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.excerpt,
    image: input.image,
    datePublished: input.datePublished,
    author: { '@type': 'Person', name: input.author ?? 'trino.' },
    mainEntityOfPage: `https://trino.com.ar/cultura/${input.slug}`,
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
