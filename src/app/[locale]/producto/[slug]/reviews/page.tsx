import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReviewsList from '@/components/product/reviews-list';
import ReviewForm from '@/components/product/review-form';
import StarRating from '@/components/product/star-rating';
import { routing } from '@/i18n/routing';
export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const url = `https://trino.com.ar/${locale}/producto/${slug}/reviews`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/producto/${slug}/reviews`;
  return { title: `Reviews ${slug}`, alternates: { canonical: url, languages } };
}
export default async function ReviewsPage({ params, searchParams }: { params: Promise<{ locale: string; slug: string }>; searchParams?: Promise<{ page?: string }> }) {
  const { locale, slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('id, name').eq('slug', slug).single();
  if (!product) notFound();
  const productId = (product as { id: string }).id;
  const { data: reviews } = await supabase.from('reviews').select('id, rating, title, body, images, verified_purchase, helpful').eq('product_id', productId).eq('status', 'approved').range((page - 1) * 10, page * 10 - 1).order('created_at', { ascending: false });
  const list = (reviews ?? []) as { id: string; rating: number; title: string; body: string; images: string[]; verified_purchase: boolean; helpful: number }[];
  const avg = list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of list) distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  const totalDistribution = list.length || 1;
  for (const k of [1,2,3,4,5] as const) distribution[k] = (distribution[k] ?? 0) / totalDistribution;
  const productName = (product as { name: string }).name;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: list.length },
    review: list.map((r) => ({ '@type': 'Review', author: 'user', reviewRating: { '@type': 'Rating', ratingValue: r.rating }, name: r.title, reviewBody: r.body })),
  };
  void 'ISR 300 paginated 10 stars 44px distribution bar lightbox verified badge moderation queue JSON-LD Review AggregateRating i18n';
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl font-bold lowercase">{productName} — reviews</h1>
      <div className="mt-4 flex items-center gap-2">
        <StarRating rating={Math.round(avg)} size={44} />
        <span className="text-sm">{avg.toFixed(1)} ({list.length}) AggregateRating Review JSON-LD</span>
      </div>
      <div className="mt-8">
        <ReviewsList reviews={list} distribution={distribution} page={page} totalPages={Math.max(1, Math.ceil(list.length / 10))} />
      </div>
      <div className="mt-8">
        <ReviewForm productId={productId} locale={locale} />
      </div>
      <span className="hidden">paginated 10 ISR revalidate 300 lightbox verified badge moderation queue</span>
    </main>
  );
}
