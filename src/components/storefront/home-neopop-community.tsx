import { MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { homeNeopopCopy } from './home-neopop-copy';

export function HomeNeopopCommunity({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).community;

  return (
    <section
      data-purpose="home-community"
      className="border-ink col-span-full border-b-[3px] px-4 py-12 sm:px-6 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-label text-cobalt text-xs font-bold tracking-wider uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
        <p className="font-body mt-3 max-w-2xl">{copy.body}</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-ink bg-lilac shadow-pop rounded-card col-span-full flex flex-col items-center gap-3 border-[3px] p-8 text-center">
            <Sparkles aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold">{copy.emptyTitle}</h3>
            <p className="font-body text-sm">{copy.emptyBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeNeopopReviews({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).reviews;

  return (
    <section
      data-purpose="home-reviews"
      className="border-ink col-span-full border-b-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-label text-ink text-xs font-bold tracking-wider uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
        <p className="font-body mt-3 max-w-2xl">{copy.body}</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-ink bg-cream shadow-pop rounded-card flex flex-col items-center gap-3 border-[3px] p-8 text-center sm:col-span-3">
            <MessageCircle aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold">{copy.emptyTitle}</h3>
            <p className="font-body text-sm">{copy.emptyBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeNeopopQuality({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).quality;

  return (
    <section
      data-purpose="home-quality"
      className="border-ink bg-aqua col-span-full border-y-[3px] px-4 py-10 sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <p className="font-label text-ink text-xs font-bold tracking-wider uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-display text-3xl font-semibold uppercase sm:text-4xl">{copy.title}</h2>
        <p className="font-body max-w-2xl">{copy.body}</p>
        <Link
          href={`/${locale}/terms`}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center border-[3px] px-6 text-sm font-bold uppercase"
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
