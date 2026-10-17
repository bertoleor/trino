'use client';

// Facetas: velas, tarot-oraculos, inciensos-resinas
import { HERO_FACETS } from './facets';

interface HeroProps {
  t: (key: string) => string;
}

export default function Hero({ t }: { t: (key: string) => string }) {
  return (
    <section className="motion-grid-wipe relative flex min-h-[20rem] w-full flex-col items-center justify-center gap-6 px-4 bg-[--bg-crema]">
      <h1 className="text-[--text-grafito] text-3xl font-bold">{t('title')}</h1>
      <p className="text-[--text-grafito] text-sm">{t('description')}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        {HERO_FACETS.map((tipo) => (
          <a
            key={tipo}
            href={`/tienda?tipo=${tipo}`}
            className="relative flex w-[18rem] h-[12rem] items-center justify-center gap-3 bg-[--bg-blanco]/20 backdrop-blur-sm rounded-xl border border-[--text-grafito]/20 px-4 py-3 transition-colors hover:bg-[--bg-blanco]/10"
          >
            {/* Geometric shape indicator: vary border-radius to suggest arc, circle, half-moon */}
            <div className="w-10 h-10 flex-shrink-0" aria-hidden="true">
              <div
                className={`w-full h-full rounded-${
                  tipo === 'velas'
                    ? 'tl-full' // arc-like: top-left rounded
                    : tipo === 'tarot-oraculos'
                      ? 'full' // circle
                      : 'bl-full' // half-moon: bottom-left rounded
                } rounded-t-full`}
                style={{
                  backgroundColor:
                    tipo === 'velas'
                      ? 'var(--color-mostaza)'
                      : tipo === 'tarot-oraculos'
                      ? 'var(--color-verde)'
                      : 'var(--color-celeste)'
                }}
              />
            </div>
            <span className="text-[--text-grafito] font-medium capitalize">{tipo}</span>
          </a>
        ))}
      </div>
    </section>
  );
}