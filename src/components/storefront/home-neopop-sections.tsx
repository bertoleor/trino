import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { homeNeopopCopy } from './home-neopop-copy';

export function HomeNeopopHero({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).hero;

  return (
    <section
      data-purpose="home-hero"
      className="border-ink col-span-full border-b-[3px] px-4 py-10 sm:px-6 lg:py-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <p className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex items-center gap-2 border-[3px] px-4 py-2 text-xs font-bold tracking-wider uppercase">
            <span
              aria-hidden="true"
              className="bg-pink border-ink rounded-control h-2.5 w-2.5 border-2"
            />
            {copy.eyebrow}
          </p>
          <h1 className="font-display text-5xl leading-[0.95] font-semibold tracking-tight uppercase sm:text-6xl lg:text-7xl">
            {copy.titleLead} <span className="text-cobalt">{copy.titleAccent}</span>
            <span className="bg-pink text-ink border-ink shadow-pop-lg rounded-card mt-4 block w-fit -rotate-1 border-[3px] px-5 py-3 text-3xl leading-none font-semibold sm:text-5xl">
              {copy.highlight}
            </span>
          </h1>
          <p className="font-body max-w-xl text-base">{copy.body}</p>
          <div className="flex w-full flex-wrap gap-4 sm:w-auto">
            <Link
              href={`/${locale}/tienda`}
              className="font-label border-ink bg-ink text-cream shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-sm font-bold uppercase"
            >
              {copy.primaryCta}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="#test-de-tono"
              className="font-label border-ink bg-cream text-ink shadow-pop rounded-control inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-sm font-bold uppercase"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="border-ink bg-lilac shadow-pop-lg rounded-card relative border-4 p-4 pb-6">
            <span className="font-label border-ink bg-pink text-ink shadow-pop-sm rounded-control absolute -top-4 -left-4 z-10 -rotate-3 border-[3px] px-4 py-1.5 text-xs font-bold uppercase">
              {copy.visualLabel}
            </span>
            <span
              aria-hidden="true"
              className="font-display border-ink bg-lemon text-ink shadow-pop-sm rounded-control absolute -top-3 -right-3 z-10 flex h-16 w-16 rotate-6 items-center justify-center border-[3px] text-2xl font-semibold"
            >
              <Sparkles />
            </span>
            <div className="border-ink bg-cream rounded-card relative aspect-[3/4] overflow-hidden border-[3px]">
              <span
                aria-hidden="true"
                className="border-ink bg-pink rounded-card absolute -top-6 -left-6 h-28 w-28 rotate-12 border-[3px]"
              />
              <span
                aria-hidden="true"
                className="border-ink bg-aqua rounded-card absolute -right-8 bottom-10 h-36 w-36 -rotate-6 border-[3px]"
              />
              <span className="font-display text-ink border-ink bg-cream shadow-pop rounded-card absolute top-1/2 left-1/2 flex w-[70%] -translate-x-1/2 -translate-y-1/2 -rotate-3 items-center justify-center border-[3px] p-4 text-center text-4xl font-semibold">
                trino<span className="text-cobalt">.</span>
              </span>
              <span className="font-label border-ink bg-ink text-cream rounded-control absolute right-3 bottom-3 border-2 px-3 py-1 text-[10px] font-bold uppercase">
                {copy.visualLabel}
              </span>
            </div>
            <div className="border-ink bg-cream shadow-pop rounded-card mt-4 flex items-center justify-between gap-3 border-[3px] p-3">
              <p className="font-label text-ink text-xs font-bold tracking-wide uppercase">
                {copy.visualHint}
              </p>
              <ArrowRight aria-hidden="true" className="text-cobalt shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeNeopopTicker({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).ticker;

  return (
    <section
      data-purpose="home-ticker"
      aria-label={copy.items.join(' · ')}
      className="border-ink bg-pink col-span-full overflow-hidden border-y-[3px] py-3"
    >
      <ul className="font-label flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-xs font-bold tracking-wider uppercase">
        {copy.items.map((item) => (
          <li key={item} className="whitespace-nowrap">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
