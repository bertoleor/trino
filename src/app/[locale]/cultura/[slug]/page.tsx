import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import { languageAlternates, localizedUrl } from '@/lib/seo/site';
import Image from 'next/image';
import type { Metadata } from 'next';
import { articleJsonLd } from '@/lib/seo/json-ld';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('cultura_posts')
    .select('title, excerpt, cover_image')
    .eq('slug', slug)
    .single();
  const title = post?.title ?? slug;
  const description = post?.excerpt ?? title;
  const path = `cultura/${slug}`;
  const url = localizedUrl(locale, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      images: post?.cover_image ? [{ url: post.cover_image }] : [],
      type: 'article',
      locale,
    },
  };
}

export default async function CulturaDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('cultura_posts')
    .select('id, slug, title, excerpt, body, cover_image, published_at, tags')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();
  if (!post) notFound();
  const nonce = nonceProp((await headers()).get(NONCE_HEADER));
  const ld = articleJsonLd({
    headline: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    locale,
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <h1 className="text-3xl font-bold lowercase">{post.title}</h1>
      <p className="mt-2 text-zinc-500">{post.excerpt}</p>
      {post.cover_image ? (
        <Image
          src={post.cover_image}
          alt={post.title}
          width={1200}
          height={630}
          sizes="100vw"
          priority
          className="mt-6 w-full rounded-xl"
        />
      ) : null}
      <div className="prose mt-6 lowercase">
        {post.body ? JSON.stringify(post.body) : 'sin contenido.'}
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        TipTap body — related carousel — Article JSON-LD — hreflang x4
      </p>
    </main>
  );
}
