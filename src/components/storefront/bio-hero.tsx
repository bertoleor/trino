import { Sparkles } from 'lucide-react';

type BioHeroProps = {
  badge: string;
  brand: string;
  line: string;
  headlineStart: string;
  headlineAccent: string;
  intro: string;
  channels: string;
  ticker: string[];
};

export function BioHero({
  badge,
  brand,
  line,
  headlineStart,
  headlineAccent,
  intro,
  channels,
  ticker,
}: BioHeroProps) {
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
        <div className="border-ink shadow-pop bg-cream rounded-card inline-flex items-center justify-center border-[3px] px-6 py-2 md:py-2.5">
          <span className="font-display text-4xl leading-none font-extrabold tracking-tight md:text-6xl">
            {brand}
          </span>
        </div>
        <span className="font-label text-pink -mt-1 text-xs font-black tracking-widest uppercase">
          {line}
        </span>
        <h1 className="font-display mt-2 text-2xl leading-tight font-extrabold tracking-tight md:text-3xl">
          {headlineStart}{' '}
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
        className="border-ink shadow-pop bg-ink rounded-card mb-5 flex overflow-hidden border-[3px]"
      >
        <div className="neopop-marquee flex w-max items-center gap-6 py-1.5">
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
