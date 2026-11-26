import { ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export interface ManifestoStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

const formatDate = (value: string | null, locale: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export async function ManifestoStories({
  locale,
  posts,
}: {
  locale: string;
  posts: ManifestoStory[];
}) {
  const t = await getTranslations({ locale, namespace: 'institucional.manifiesto.stories' });

  return (
    <section
      data-purpose="manifiesto-stories"
      aria-labelledby="manifiesto-stories-title"
      className="bg-cream col-span-12 px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <span className="font-label text-cobalt text-xs font-bold tracking-widest uppercase">
          {t('eyebrow')}
        </span>
        <h2
          id="manifiesto-stories-title"
          className="font-display mt-2 text-3xl font-semibold sm:text-4xl"
        >
          {t('title')}
        </h2>
        <p className="font-body mt-2 max-w-2xl text-sm">{t('description')}</p>

        {posts.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyBody')}
            className="mt-8"
            action={
              <Link
                href={`/${locale}/tienda`}
                className="font-label border-ink bg-ink text-cream shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
              >
                {t('emptyAction')}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/cultura/${post.slug}`}
                data-purpose="manifiesto-story"
                className="border-ink bg-cream shadow-pop rounded-card flex flex-col overflow-hidden border-[3px]"
              >
                <div className="border-ink bg-lilac relative aspect-video w-full border-b-[3px]">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-label absolute inset-0 flex items-center justify-center p-4 text-center text-xs font-bold uppercase">
                      {post.title}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-label text-[10px] font-bold tracking-widest uppercase">
                    {t('dateLabel')} {formatDate(post.published_at, locale)}
                  </p>
                  <h3 className="font-display mt-2 text-xl font-semibold">
                    {post.title || t('untitled')}
                  </h3>
                  {post.excerpt ? <p className="font-body mt-2 text-sm">{post.excerpt}</p> : null}
                  <span className="font-label border-ink bg-lemon shadow-pop-sm rounded-control mt-5 inline-flex min-h-11 items-center gap-2 self-start border-2 px-4 text-[10px] font-bold uppercase">
                    {t('read')}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
