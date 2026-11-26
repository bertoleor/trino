import { Clock3, Eye, MessageCircle, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ASSURANCES = [
  { key: 'a', Icon: Clock3, tone: 'bg-lemon' },
  { key: 'b', Icon: Eye, tone: 'bg-aqua' },
  { key: 'c', Icon: Wallet, tone: 'bg-pink' },
  { key: 'd', Icon: MessageCircle, tone: 'bg-lilac' },
] as const;

export async function WishlistGalleryAssurance({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'institucional.wishlist.assurance' });

  return (
    <section
      data-purpose="wishlist-gallery-assurance"
      aria-labelledby="wishlist-gallery-assurance-title"
      className="border-ink bg-cream shadow-pop rounded-card col-span-12 border-[3px] p-6"
    >
      <h2 id="wishlist-gallery-assurance-title" className="font-display text-xl font-semibold">
        {t('title')}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ASSURANCES.map(({ key, Icon, tone }) => (
          <div
            key={key}
            data-purpose={`wishlist-gallery-assurance-${key}`}
            className="border-ink bg-cream shadow-pop-sm rounded-card flex items-start gap-3 border-2 p-4"
          >
            <span
              className={`border-ink ${tone} rounded-card flex h-10 w-10 shrink-0 items-center justify-center border-2`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-sm font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="font-body mt-1 text-xs">{t(`items.${key}.body`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
