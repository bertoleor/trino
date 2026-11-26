import type { BioLink } from './bio-links';

type InfoPanelProps = {
  links: readonly BioLink[];
  badge: string;
  channels: string;
  intro: string;
  logoLine: string;
  headlineStart: string;
  headlineAccent: string;
  footerTagline: string;
};

export function BioInfoPanel({
  links,
  badge,
  channels,
  intro,
  logoLine,
  headlineStart,
  headlineAccent,
  footerTagline,
}: InfoPanelProps) {
  return (
    <aside
      aria-label={channels}
      data-purpose="editorial-and-info"
      className="hidden flex-col gap-4 md:col-span-5 md:flex"
    >
      <section className="border-ink shadow-pop bg-cream rounded-card p-4">
        <span className="font-label border-ink bg-lemon text-ink rounded-control inline-block border-2 px-3 py-1 text-[10px] font-black tracking-wider uppercase">
          {badge}
        </span>
        <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight">{channels}</h2>
        <p className="font-body mt-2 text-sm font-semibold">{intro}</p>
        <ul className="mt-4 flex flex-col gap-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="font-label border-ink flex items-center justify-between gap-2 border-2 px-2 py-1.5 text-[10px] font-black uppercase"
            >
              <span className="truncate">{link.handle}</span>
              <span className="border-ink bg-lemon text-ink rounded-control border px-2 py-0.5">
                {link.tag}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-ink shadow-pop bg-cobalt text-cream rounded-card p-4">
        <span className="font-label text-[10px] font-black tracking-widest uppercase">
          {logoLine}
        </span>
        <p className="font-display mt-2 text-xl leading-tight font-extrabold">
          {headlineStart} {headlineAccent}
        </p>
        <p className="font-body mt-2 text-xs font-bold">{footerTagline}</p>
      </section>
    </aside>
  );
}

type BrandShowcaseProps = {
  logoBrand: string;
  logoLine: string;
  headlineStart: string;
  headlineAccent: string;
  footerTagline: string;
  metaDescription: string;
};

export function BioBrandShowcase({
  logoBrand,
  logoLine,
  headlineStart,
  headlineAccent,
  footerTagline,
  metaDescription,
}: BrandShowcaseProps) {
  return (
    <section
      data-purpose="brand-footer-specs"
      className="border-ink shadow-pop bg-cream rounded-card mt-6 hidden p-4 md:block"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        <div className="border-ink bg-cobalt text-cream rounded-card flex items-center gap-3 border-[3px] p-2.5">
          <div className="border-ink bg-cream text-cobalt font-display rounded-card flex size-11 shrink-0 items-center justify-center border-2 text-2xl font-extrabold">
            t.
          </div>
          <div>
            <span className="font-label text-lemon text-[9px] font-black tracking-wider uppercase">
              {logoLine}
            </span>
            <p className="font-body text-xs font-bold">{footerTagline}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center text-center md:text-left">
          <span className="font-label text-[10px] font-black tracking-wider uppercase">
            {logoBrand}
          </span>
          <p className="font-display text-base leading-tight font-extrabold">
            {headlineStart} {headlineAccent}
          </p>
          <p className="font-body mt-0.5 text-[11px] font-bold">{metaDescription}</p>
        </div>
      </div>
    </section>
  );
}
