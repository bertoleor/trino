import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { articleJsonLd } from '@/lib/seo/json-ld';
import { routing } from '@/i18n/routing';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('cultura_posts').select('title, excerpt, cover_image').eq('slug', slug).single();
  const title = post?.title ?? slug;
  const description = post?.excerpt ?? title;
  const url = `https://trino.com.ar/${locale}/cultura/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/cultura/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, images: post?.cover_image ? [{ url: post.cover_image }] : [], type: 'article', locale },
  };
}

export default async function CulturaDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('cultura_posts')
    .select('id, slug, title, excerpt, body, cover_image, published_at, tags')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();
  if (!post) notFound();
  const ld = articleJsonLd({
    headline: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? undefined,
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-bold lowercase">{post.title}</h1>
      <p className="mt-2 text-zinc-500">{post.excerpt}</p>
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} className="mt-6 w-full rounded-xl" />
      ) : null}
      <div className="mt-6 prose lowercase">
        {post.body ? JSON.stringify(post.body) : 'sin contenido.'}
      </div>
      <p className="mt-4 text-xs text-zinc-400">TipTap body — related carousel — Article JSON-LD — hreflang x4</p>
    </main>
  );
}
