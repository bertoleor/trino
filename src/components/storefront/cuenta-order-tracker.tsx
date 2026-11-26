import { Check, House, Package, Truck } from 'lucide-react';
import { CuentaActionLink, CuentaBadge } from '@/components/storefront/cuenta-ui';
import { getTranslations } from 'next-intl/server';

export async function CuentaOrderTracker({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const steps = [
    { icon: Check, label: t('orders.steps.confirmed'), state: 'bg-aqua' },
    { icon: Package, label: t('orders.steps.prepared'), state: 'bg-aqua' },
    { icon: Truck, label: t('orders.steps.shipped'), state: 'bg-cobalt' },
    { icon: House, label: t('orders.steps.delivered'), state: 'bg-cream' },
  ] as const;
  const items = [
    { label: t('orders.itemFirst'), tone: 'bg-pink' },
    { label: t('orders.itemSecond'), tone: 'bg-lilac' },
  ] as const;

  return (
    <section
      id="pedidos"
      data-purpose="active-order"
      className="border-ink bg-cream shadow-pop-lg rounded-card border-2"
    >
      <header className="border-ink bg-lemon flex flex-wrap items-center justify-between gap-3 border-b-2 p-5">
        <div>
          <p className="font-label text-xs font-bold tracking-wide uppercase">
            {t('orders.activeSubtitle')}
          </p>
          <h2 className="font-display text-2xl font-bold">{t('orders.activeTitle')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CuentaBadge tone="ink">{t('orders.reference')}</CuentaBadge>
          <p className="font-body text-xs">{t('orders.code')}</p>
        </div>
      </header>

      <div className="space-y-6 p-5">
        <ol data-purpose="order-steps" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.label}
              className={`border-ink ${step.state} rounded-card flex flex-col items-center gap-2 border-2 p-3 text-center`}
            >
              <step.icon aria-hidden="true" className="h-5 w-5" />
              <span className="font-label text-[11px] font-bold tracking-wide uppercase">
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-label text-xs font-bold tracking-wide uppercase">
              {t('orders.contentsTitle')}
            </h3>
            <p className="font-body text-xs">{t('orders.contentsHint')}</p>
          </div>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.label}
                className="border-ink shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3"
              >
                <span
                  aria-hidden="true"
                  className={`border-ink ${item.tone} rounded-card flex h-12 w-12 shrink-0 items-center justify-center border-2`}
                >
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold">{item.label}</p>
                  <p className="font-body text-xs">{t('orders.itemHint')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-ink flex flex-col gap-3 border-t-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-label text-xs font-bold tracking-wide uppercase">
              {t('orders.totalLabel')}
            </p>
            <p className="font-body text-sm">{t('orders.totalValue')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CuentaActionLink href={`/${locale}/cuenta`}>{t('orders.invoice')}</CuentaActionLink>
            <CuentaActionLink href={`/${locale}/tienda`} tone="pink">
              {t('orders.repeat')}
            </CuentaActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
