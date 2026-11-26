import { CheckCircle2, Package } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function CuentaOrderHistory({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const orders = [
    { icon: CheckCircle2, label: t('history.first'), tone: 'bg-aqua' },
    { icon: Package, label: t('history.second'), tone: 'bg-lilac' },
  ] as const;

  return (
    <section data-purpose="order-history" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-bold">{t('history.title')}</h2>
        <p className="font-label text-xs font-bold tracking-wide uppercase">{t('history.hint')}</p>
      </div>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li
            key={order.label}
            className="border-ink bg-cream shadow-pop rounded-card flex flex-col gap-3 border-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`border-ink ${order.tone} rounded-card flex h-12 w-12 shrink-0 items-center justify-center border-2`}
              >
                <order.icon className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <p className="font-display text-sm font-bold">{order.label}</p>
                <p className="font-label text-[11px] font-bold tracking-wide uppercase">
                  {t('history.delivered')}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/cuenta`}
              className="font-label border-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center justify-center border-2 px-4 py-2 text-xs font-bold tracking-wide uppercase"
            >
              {t('history.detail')}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
