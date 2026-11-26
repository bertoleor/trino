import { Sparkles } from 'lucide-react';

type BioHeroProps = {
  badge: string;
  brand: string;
  headlineStart: string;
  headlineAccent: string;
  intro: string;
  channels: string;
  ticker: string[];
};

export function BioHero({
  badge,
  brand,
  headlineStart,
  headlineAccent,
  intro,
  channels,
  ticker,
}: BioHeroProps) {
  const dotAt = brand.lastIndexOf('.');
  const brandName = dotAt >= 0 ? brand.slice(0, dotAt) : brand;
  const brandDot = dotAt >= 0 ? brand.slice(dotAt) : '';

  return (
    <>
      <header className="mb-3 flex justify-center">
        <span className="border-ink shadow-pop-sm bg-cream text-ink font-label rounded-control inline-flex items-center gap-2 border-[3px] px-4 py-1 text-xs font-black tracking-wider uppercase">
          <Sparkles aria-hidden="true" />
          {badge}
          <span aria-hidden="true" className="bg-aqua border-ink size-2 rounded-full border" />
        </span>
      </header>

      <section
        data-purpose="hero-identity"
        className="mx-auto mb-4 flex max-w-2xl flex-col items-center text-center"
      >
        <span className="font-display text-5xl leading-none font-extrabold tracking-tight md:text-7xl">
          {brandName}
          <span className="text-cobalt">{brandDot}</span>
        </span>
        <h1 className="font-display border-ink shadow-pop bg-cream rounded-card mt-3 inline-flex flex-wrap items-center justify-center gap-2 border-[3px] px-3 py-2 text-2xl leading-tight font-extrabold tracking-tight md:text-3xl">
          {headlineStart}
          <span className="border-ink shadow-pop-sm bg-cobalt text-cream rounded-card inline-block rotate-[-1.5deg] px-2.5 py-0.5">
            {headlineAccent}
          </span>
        </h1>
        <p className="border-ink shadow-pop bg-cream rounded-card mt-2 max-w-md border-[3px] p-3 text-sm leading-snug font-bold">
          {intro}
        </p>
        <p className="border-ink shadow-pop-sm bg-ink text-cream font-label rounded-control mt-3 inline-flex items-center gap-1.5 border-[3px] px-3 py-1 text-[11px] font-black uppercase">
          <span aria-hidden="true" className="bg-aqua size-2 animate-pulse rounded-full" />
          {channels}
        </p>
      </section>

      <section
        data-purpose="ticker-announcement"
        className="bg-ink -mx-5 mb-5 flex overflow-hidden py-1 md:-mx-6"
      >
        <div className="neopop-marquee flex w-max items-center gap-8">
          {[...ticker, ...ticker].map((item, index) => (
            <span
              key={`${item}-${index}`}
              aria-hidden={index >= ticker.length ? true : undefined}
              className="font-label text-cream text-xs font-black tracking-widest uppercase"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
