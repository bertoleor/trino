import { ArrowRight, PackageSearch, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/storefront/empty-state';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export interface BrandSummary {
  name: string;
  count: number;
}

const TONES = ['bg-cream', 'bg-pink', 'bg-aqua', 'bg-lemon', 'bg-lilac'];

function BrandCard({
  brand,
  locale,
  tone,
  productsLabel,
  exploreLabel,
}: {
  brand: BrandSummary;
  locale: string;
  tone: string;
  productsLabel: string;
  exploreLabel: string;
}) {
  return (
    <Link
      href={`/${locale}/tienda?brand=${encodeURIComponent(brand.name)}`}
      className={`border-ink shadow-pop flex min-h-40 flex-col justify-between border-[3px] p-4 transition-transform hover:-translate-y-1 ${tone}`}
    >
      <span className="font-label border-ink bg-ink text-cream border-2 px-2 py-0.5 text-[10px] font-bold uppercase">
        {productsLabel}
      </span>
      <span>
        <span className="font-display block text-xl font-semibold uppercase">{brand.name}</span>
        <span className="font-label mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase">
          {exploreLabel}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

export async function BrandsDirectory({
  locale,
  brands,
}: {
  locale: string;
  brands: BrandSummary[];
}) {
  const t = await getTranslations({ locale, namespace: 'brands' });
  const grouped = new Map<string, BrandSummary[]>();
  for (const brand of brands) {
    const letter = brand.name.trim().charAt(0).toLocaleUpperCase(locale);
    const group = grouped.get(letter) ?? [];
    group.push(brand);
    grouped.set(letter, group);
  }
  return (
    <>
      {brands.length === 0 ? (
        <EmptyState
          className="col-span-full"
          icon={<PackageSearch aria-hidden="true" className="text-cobalt h-10 w-10" />}
          title={t('empty.title')}
          description={t('empty.description')}
          action={
            <Link
              href={`/${locale}/tienda`}
              className="border-ink bg-lemon shadow-pop-sm min-h-11 border-2 px-5 text-xs font-bold uppercase"
            >
              {t('empty.action')}
            </Link>
          }
        />
      ) : (
        <>
          <section aria-labelledby="featured-brands" className="col-span-full px-6 py-6">
            <p className="font-label border-ink bg-pink shadow-pop-sm mb-3 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
              {t('featured.eyebrow')}
            </p>
            <h2 id="featured-brands" className="font-display text-2xl font-semibold sm:text-4xl">
              {t('featured.title')}
            </h2>
            <p className="font-body mt-2 text-sm">{t('featured.description')}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brands.slice(0, 3).map((brand, index) => (
                <BrandCard
                  key={brand.name}
                  brand={brand}
                  locale={locale}
                  tone={TONES[index % TONES.length] ?? 'bg-cream'}
                  productsLabel={t('card.products', { count: brand.count })}
                  exploreLabel={t('card.explore', { brand: brand.name })}
                />
              ))}
            </div>
          </section>

          <section
            id="marcas-directorio"
            aria-labelledby="directory-brands"
            className="border-ink col-span-full border-t-[3px] px-6 py-10"
          >
            <p className="font-label border-ink bg-cobalt text-cream shadow-pop-sm mb-3 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
              {t('directory.eyebrow')}
            </p>
            <h2 id="directory-brands" className="font-display text-2xl font-semibold sm:text-4xl">
              {t('directory.title')}
            </h2>
            <p className="font-body mt-2 text-sm">{t('directory.description')}</p>
            <div className="mt-8 flex flex-col gap-10">
              {[...grouped.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, group]) => (
                  <div key={letter} id={`marca-${letter}`} className="scroll-mt-28">
                    <h3 className="font-display border-ink mb-4 border-b-[3px] pb-2 text-xl font-semibold">
                      {letter}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {group.map((brand, index) => (
                        <BrandCard
                          key={brand.name}
                          brand={brand}
                          locale={locale}
                          tone={TONES[index % TONES.length] ?? 'bg-cream'}
                          productsLabel={t('card.products', { count: brand.count })}
                          exploreLabel={t('card.explore', { brand: brand.name })}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}

      <section className="border-ink bg-pink shadow-pop-lg col-span-full border-[3px] p-6 sm:p-10">
        <p className="font-label border-ink bg-lemon shadow-pop-sm mb-4 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
          {t('wholesale.eyebrow')}
        </p>
        <h2 className="font-display text-2xl font-semibold sm:text-4xl">{t('wholesale.title')}</h2>
        <p className="font-body mt-2 max-w-2xl">{t('wholesale.description')}</p>
        <Link
          href={`/${locale}#contacto`}
          className="border-ink bg-ink text-cream shadow-pop-sm mt-6 inline-flex min-h-11 items-center gap-2 border-2 px-5 text-xs font-bold uppercase"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {t('wholesale.cta')}
        </Link>
      </section>
    </>
  );
}
