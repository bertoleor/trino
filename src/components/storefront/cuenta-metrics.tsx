import { Heart, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function CuentaMetrics({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const metrics = [
    {
      icon: Sparkles,
      title: t('metrics.clubTitle'),
      value: t('metrics.clubValue'),
      hint: t('metrics.clubHint'),
      href: `#club`,
    },
    {
      icon: Package,
      title: t('metrics.ordersTitle'),
      value: t('metrics.ordersValue'),
      hint: t('metrics.ordersHint'),
      href: '#pedidos',
    },
    {
      icon: Heart,
      title: t('metrics.favoritesTitle'),
      value: t('metrics.favoritesValue'),
      hint: t('metrics.favoritesHint'),
      href: `/${locale}/cuenta`,
    },
  ];

  return (
    <div
      data-purpose="profile-metrics"
      className="border-ink mt-6 grid grid-cols-1 gap-3 border-t-2 pt-6 sm:grid-cols-3"
    >
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="border-ink bg-cream shadow-pop-sm rounded-card flex flex-col gap-2 border-2 p-4"
        >
          <div className="font-label flex items-center justify-between text-xs font-bold tracking-wide uppercase">
            <span>{metric.title}</span>
            <metric.icon aria-hidden="true" className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-bold">{metric.value}</p>
          <Link
            href={metric.href}
            className="font-label text-xs font-bold underline underline-offset-4"
          >
            {metric.hint}
          </Link>
        </div>
      ))}
    </div>
  );
}
