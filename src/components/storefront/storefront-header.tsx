import { Heart, Search, ShoppingBag, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export type StorefrontSection = 'home' | 'shop' | 'product';

const NAV_ITEMS = [
  { key: 'nav.drops', href: (locale: string) => `/${locale}/tienda`, match: 'shop' },
  { key: 'nav.catalog', href: (locale: string) => `/${locale}/tienda`, match: 'shop' },
  { key: 'nav.brands', href: (locale: string) => `/${locale}#marcas`, match: 'none' },
  { key: 'nav.toneTest', href: (locale: string) => `/${locale}#test-de-tono`, match: 'none' },
  { key: 'nav.club', href: (locale: string) => `/${locale}#club`, match: 'none' },
  { key: 'nav.contact', href: (locale: string) => `/${locale}#contacto`, match: 'none' },
] as const;

function ActionLink({
  href,
  label,
  icon,
  tone = 'cream',
}: {
  href: string;
  label: string;
  icon: ReactNode;
  tone?: 'cream' | 'aqua' | 'pink';
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'border-ink shadow-pop-sm inline-flex min-h-11 items-center justify-center border-2 px-3',
        tone === 'aqua' && 'bg-aqua text-ink',
        tone === 'pink' && 'bg-pink text-ink',
        tone === 'cream' && 'bg-cream text-ink'
      )}
    >
      {icon}
    </Link>
  );
}

export async function StorefrontHeader({
  locale,
  active,
}: {
  locale: string;
  active: StorefrontSection;
}) {
  const t = await getTranslations({ locale, namespace: 'storefront' });
  const tickerItems = t('announcement')
    .split('·')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <div className="border-ink bg-orange overflow-hidden border-b-[3px] py-2 select-none">
        <div className="neopop-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              aria-hidden={index >= tickerItems.length ? true : undefined}
              className="font-display text-ink text-xs font-bold tracking-widest uppercase"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Link
          href={`/${locale}`}
          aria-current={active === 'home' ? 'page' : undefined}
          className="text-ink font-display text-3xl font-semibold"
        >
          trino<span className="text-cobalt">.</span>
        </Link>
        <nav
          aria-label={t('nav.label')}
          className="hidden flex-1 items-center justify-center gap-0 lg:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href(locale)}
              className={cn(
                'text-ink border-2 border-transparent px-2 py-2 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap',
                active === item.match && 'border-ink bg-lemon shadow-pop-sm'
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ActionLink
            href={`/${locale}/tienda`}
            label={t('actions.search')}
            icon={<Search aria-hidden="true" />}
          />
          <ActionLink
            href={`/${locale}/wishlist`}
            label={t('actions.wishlist')}
            icon={<Heart aria-hidden="true" />}
          />
          <ActionLink
            href={`/${locale}/tienda`}
            label={t('actions.cart')}
            tone="aqua"
            icon={<ShoppingBag aria-hidden="true" />}
          />
          <Link
            href={`/${locale}/tienda`}
            className="border-ink bg-pink text-ink shadow-pop-sm inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            {t('actions.shop')}
            <UserRound aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
