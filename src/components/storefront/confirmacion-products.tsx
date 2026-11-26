import { Droplet, Palette, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ITEMS = [
  {
    tone: 'bg-lemon',
    Icon: Droplet,
    nameKey: 'items.gloss.name',
    variantKey: 'items.gloss.variant',
    tagKey: 'items.gloss.tag',
  },
  {
    tone: 'bg-pink',
    Icon: Sparkles,
    nameKey: 'items.blush.name',
    variantKey: 'items.blush.variant',
    tagKey: 'items.blush.tag',
  },
  {
    tone: 'bg-lilac',
    Icon: Palette,
    nameKey: 'items.balm.name',
    variantKey: 'items.balm.variant',
    tagKey: 'items.balm.tag',
  },
] as const;

export async function ConfirmacionProducts({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.products' });

  return (
    <section
      data-purpose="confirmacion-products"
      aria-labelledby="confirmacion-products-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-[3px] pb-4">
        <div>
          <h2 id="confirmacion-products-title" className="font-display text-xl font-semibold">
            {t('title')}
          </h2>
          <p className="font-body text-xs opacity-80">{t('subtitle')}</p>
        </div>
        <span className="font-label border-ink bg-pink text-ink border-2 px-3 py-1 text-xs font-bold uppercase">
          {t('badge')}
        </span>
      </div>

      <ul className="border-ink divide-ink divide-y-2 border-b-2">
        {ITEMS.map((item) => (
          <li key={item.nameKey} className="flex items-center gap-4 py-4">
            <span
              aria-hidden="true"
              className={`border-ink ${item.tone} shadow-pop-sm flex h-20 w-20 shrink-0 items-center justify-center border-2 p-1.5`}
            >
              <item.Icon className="text-ink h-9 w-9" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display truncate text-sm font-semibold">{t(item.nameKey)}</h3>
                <span className="font-label text-ink text-xs font-bold">{t(item.tagKey)}</span>
              </div>
              <p className="font-body mt-1 text-xs opacity-80">{t(item.variantKey)}</p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2">
        <div className="font-body flex items-baseline justify-between gap-3 text-sm">
          <dt>{t('totals.products')}</dt>
          <dd className="font-label text-ink text-xs font-bold">{t('totals.available')}</dd>
        </div>
        <div className="font-body flex items-baseline justify-between gap-3 text-sm">
          <dt>{t('totals.delivery')}</dt>
          <dd className="font-label text-ink text-xs font-bold">{t('totals.perOption')}</dd>
        </div>
        <div className="font-body flex items-baseline justify-between gap-3 text-sm">
          <dt>{t('totals.detail')}</dt>
          <dd className="font-label text-ink text-xs font-bold">{t('totals.pending')}</dd>
        </div>
        <div className="border-ink mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t-[3px] pt-4">
          <dt className="font-label text-ink text-xs font-bold uppercase">{t('totals.total')}</dt>
          <dd className="font-display text-ink text-2xl font-semibold">{t('totals.pending')}</dd>
        </div>
      </dl>
      <p className="font-label text-ink mt-3 text-[10px] font-bold uppercase opacity-70">
        {t('totals.note')}
      </p>
    </section>
  );
}
