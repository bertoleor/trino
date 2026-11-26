import { Heart, Package, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function CuentaTabs({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const tabs = [
    { key: 'tabs.orders', icon: Package, href: '#pedidos' },
    { key: 'tabs.favorites', icon: Heart, href: `/${locale}/cuenta` },
    { key: 'tabs.club', icon: Sparkles, href: '#club' },
    { key: 'tabs.settings', icon: Settings, href: `/${locale}/cuenta` },
  ] as const;

  return (
    <nav
      data-purpose="account-sections"
      aria-label={t('tabs.label')}
      className="flex flex-wrap gap-3 overflow-x-auto pb-2"
    >
      {tabs.map((tab, index) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={index === 0 ? 'true' : undefined}
          className="border-ink shadow-pop-sm rounded-control font-label aria-[current=true]:bg-ink aria-[current=true]:text-cream inline-flex min-h-11 items-center gap-2 border-2 px-4 py-2 text-xs font-bold tracking-wide uppercase"
        >
          <tab.icon aria-hidden="true" className="h-4 w-4" />
          {t(tab.key)}
        </Link>
      ))}
    </nav>
  );
}
