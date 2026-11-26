import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { homeNeopopCopy } from './home-neopop-copy';

export function HomeNeopopGuide({ locale }: { locale: string }) {
  const copy = homeNeopopCopy(locale).guide;

  return (
    <section
      id="test-de-tono"
      data-purpose="home-guide"
      className="border-ink bg-cobalt text-cream shadow-pop-lg rounded-card col-span-full border-[3px] px-4 py-12 sm:px-8 lg:py-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="font-label text-xs font-bold tracking-wider uppercase">{copy.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl leading-tight font-semibold sm:text-5xl">
            {copy.title}
          </h2>
          <p className="font-body mt-4 max-w-2xl">{copy.body}</p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {copy.steps.map((step, index) => (
              <li
                key={step}
                className="border-ink bg-cream text-ink shadow-pop rounded-card border-[3px] p-5"
              >
                <span className="font-display text-cobalt text-3xl font-semibold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-display mt-3 text-lg font-semibold">{step}</p>
              </li>
            ))}
          </ol>
          <Link
            href={`/${locale}/test-de-tono/paso-1`}
            className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control mt-8 inline-flex min-h-11 items-center gap-2 border-[3px] px-6 text-sm font-bold uppercase"
          >
            {copy.cta}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="lg:col-span-5">
          <div className="border-ink bg-cream text-ink shadow-pop-lg rounded-card border-4 p-6">
            <p className="font-label text-cobalt text-xs font-bold uppercase">{copy.cardLabel}</p>
            <h3 className="font-display mt-2 text-2xl font-semibold">{copy.cardTitle}</h3>
            <fieldset className="mt-6">
              <legend className="font-body mb-3 text-sm font-semibold">{copy.cardQuestion}</legend>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {copy.options.map((option) => (
                  <label
                    key={option}
                    className="font-label border-ink bg-cream shadow-pop-sm rounded-card flex min-h-11 cursor-pointer items-center gap-2 border-2 px-3 text-xs font-bold uppercase"
                  >
                    <input type="radio" name="home-guide-finish" value={option} />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="font-body mt-6 text-xs">{copy.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
