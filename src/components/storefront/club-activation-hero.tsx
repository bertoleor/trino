import { CalendarDays, CheckCircle2, Gift, Sparkles, Ticket, Truck, UserRound } from 'lucide-react';
import { CuentaBadge } from '@/components/storefront/cuenta-ui';
import { getTranslations } from 'next-intl/server';

export async function ClubActivationHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const metrics = [
    {
      icon: Gift,
      title: t('activation.pointsTitle'),
      value: t('activation.pointsValue'),
      hint: t('activation.pointsHint'),
      tone: 'bg-lemon',
    },
    {
      icon: Ticket,
      title: t('activation.offerTitle'),
      value: t('activation.offerValue'),
      hint: t('activation.offerHint'),
      tone: 'bg-pink',
    },
    {
      icon: Truck,
      title: t('activation.shippingTitle'),
      value: t('activation.shippingValue'),
      hint: t('activation.shippingHint'),
      tone: 'bg-lilac',
    },
  ] as const;

  return (
    <section
      data-purpose="activation-hero"
      className="border-ink bg-cream shadow-pop-lg rounded-card border-2 p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div
            aria-hidden="true"
            className="border-ink bg-pink text-ink shadow-pop rounded-card flex h-24 w-24 shrink-0 items-center justify-center border-2"
          >
            <UserRound className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {t('profile.greeting')}
              </h1>
              <CuentaBadge tone="pink">{t('activation.newMember')}</CuentaBadge>
              <CuentaBadge tone="aqua">{t('activation.level')}</CuentaBadge>
            </div>
            <p className="font-label flex flex-wrap items-center gap-3 text-xs font-bold tracking-wide uppercase">
              <span className="flex items-center gap-1">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                {t('activation.memberSince')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                {t('profile.status')}
              </span>
            </p>
          </div>
        </div>
        <div className="border-ink bg-cream shadow-pop rounded-card flex items-center gap-3 border-2 p-4">
          <span className="border-ink bg-cobalt text-cream rounded-control flex h-10 w-10 items-center justify-center border-2">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-label text-[11px] font-bold tracking-wide uppercase">
              {t('activation.accountStatus')}
            </p>
            <p className="font-display text-lg font-bold">{t('activation.activeStatus')}</p>
          </div>
        </div>
      </div>

      <div
        data-purpose="activation-metrics"
        className="border-ink mt-6 grid grid-cols-1 gap-3 border-t-2 pt-6 md:grid-cols-3"
      >
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="border-ink bg-cream shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-4"
          >
            <span
              aria-hidden="true"
              className={`border-ink ${metric.tone} rounded-card flex h-12 w-12 shrink-0 items-center justify-center border-2`}
            >
              <metric.icon className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <p className="font-label text-[11px] font-bold tracking-wide uppercase">
                {metric.title}
              </p>
              <p className="font-display text-base font-bold">{metric.value}</p>
              <p className="font-body text-xs">{metric.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
