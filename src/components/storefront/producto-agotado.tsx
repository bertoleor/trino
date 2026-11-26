import { ArrowLeft } from 'lucide-react';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { loadCatalog } from '@/lib/catalog/catalog-data';
import { parseFacets } from '@/lib/db/facets';

type AgotadoProps = { locale: string; slug: string };

export async function ProductoAgotado({ locale, slug }: AgotadoProps) {
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.agotado' });
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, image_url, brand, category, shade')
    .eq('slug', slug)
    .single();

  if (!product) {
    return (
      <section
        data-purpose="agotado-missing"
        className="border-ink bg-cream shadow-pop col-span-12 border-[3px] p-6"
      >
        <h1 className="font-display text-2xl font-semibold">{slug}</h1>
        <Link
          href={`/${locale}/tienda`}
          className="font-label border-ink bg-lemon shadow-pop-sm mt-4 inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t('backAction')}
        </Link>
      </section>
    );
  }

  const { products } = await loadCatalog({
    supabase,
    offset: 0,
    limit: 4,
    q: '',
    facets: parseFacets({}),
  });
  const similar = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <>
      <nav data-purpose="agotado-breadcrumb" aria-label="Breadcrumb" className="col-span-12">
        <Link
          href={`/${locale}/tienda`}
          className="font-label text-cobalt text-xs font-bold uppercase underline-offset-2 hover:underline"
        >
          {t('breadcrumbCatalog')}
        </Link>
      </nav>

      <section data-purpose="agotado-detail" className="col-span-12 grid gap-8 lg:grid-cols-2">
        <div
          aria-label={t('galleryLabel')}
          className="border-ink bg-lemon shadow-pop relative aspect-square w-full overflow-hidden border-[3px]"
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          ) : (
            <span className="font-label text-ink absolute inset-0 flex items-center justify-center text-xs font-bold uppercase">
              {t('galleryEmpty')}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="font-label text-cobalt text-xs font-black tracking-widest uppercase">
              {t('detailsEyebrow')}
            </p>
            <span className="font-label border-ink bg-pink text-ink shadow-pop-sm mt-2 inline-block border-2 px-3 py-1 text-[10px] font-black uppercase">
              {t('badge')}
            </span>
            <h1 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
            <p className="font-body mt-2 text-sm">{product.description}</p>
            {product.shade ? (
              <p className="font-label mt-4 text-xs font-bold uppercase">
                {t('shadeLabel')}: {product.shade}
              </p>
            ) : null}
          </div>

          <div
            data-purpose="agotado-notify"
            className="border-ink bg-cream shadow-pop border-[3px] p-5"
          >
            <h2 className="font-display text-xl font-semibold">{t('notifyTitle')}</h2>
            <p className="font-body mt-1 text-sm">{t('notifyBody')}</p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">{t('notifyLabel')}</span>
                <input
                  type="email"
                  placeholder={t('notifyPlaceholder')}
                  disabled
                  className="border-ink bg-cream text-ink placeholder:text-ink/60 min-h-11 w-full border-2 px-3 disabled:opacity-100"
                />
              </label>
              <button
                type="button"
                disabled
                className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center justify-center gap-2 border-2 px-5 text-xs font-bold uppercase"
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
                {t('notifyAction')}
              </button>
            </form>
            <p className="font-body mt-2 text-xs">{t('notifyNote')}</p>
          </div>
        </div>
      </section>

      {similar.length ? (
        <section
          data-purpose="agotado-similar"
          aria-labelledby="agotado-similar-titulo"
          className="col-span-12"
        >
          <h2 id="agotado-similar-titulo" className="font-display text-2xl font-semibold">
            {t('similarTitle')}
          </h2>
          <p className="font-body mt-1 text-sm">{t('similarDescription')}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <ProductCard
                key={item.id}
                locale={locale}
                product={{
                  name: item.name,
                  slug: item.slug,
                  imageUrl: item.image_url,
                  priceCents: item.price_cents ?? Math.round(Number(item.price ?? 0) * 100),
                  salePriceCents: item.sale_price_cents,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
