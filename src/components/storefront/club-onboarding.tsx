import { Check, Package, Sparkles } from 'lucide-react';
import { CuentaActionLink, CuentaBadge } from '@/components/storefront/cuenta-ui';
import { getTranslations } from 'next-intl/server';

export async function ClubOnboarding({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const steps = [
    {
      icon: Check,
      title: t('activation.step1Title'),
      hint: t('activation.step1Hint'),
      tone: 'bg-aqua',
      done: true,
    },
    {
      icon: Sparkles,
      title: t('activation.step2Title'),
      hint: t('activation.step2Hint'),
      action: t('activation.step2Action'),
      href: `/${locale}/tienda`,
      tone: 'bg-lemon',
    },
    {
      icon: Package,
      title: t('activation.step3Title'),
      hint: t('activation.step3Hint'),
      action: t('activation.step3Action'),
      href: `/${locale}/tienda`,
      tone: 'bg-pink',
    },
    {
      icon: Check,
      title: t('activation.step4Title'),
      hint: t('activation.step4Hint'),
      action: t('activation.step4Action'),
      href: `/${locale}/cuenta`,
      tone: 'bg-lilac',
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section
        data-purpose="welcome-benefit"
        className="border-ink bg-cobalt text-cream shadow-pop-lg rounded-card space-y-4 border-4 p-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <CuentaBadge tone="lemon">{t('activation.bannerLabel')}</CuentaBadge>
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-cream text-3xl font-bold tracking-tight">
            {t('activation.bannerTitle')}
          </h2>
          <p className="font-body text-sm">{t('activation.bannerHint')}</p>
        </div>
        <div className="border-ink bg-cream text-ink shadow-pop rounded-card flex flex-wrap items-center justify-between gap-3 border-2 p-4">
          <div>
            <p className="font-label text-[11px] font-bold tracking-wide uppercase">
              {t('activation.codeLabel')}
            </p>
            <p className="font-display text-lg font-bold">{t('activation.code')}</p>
          </div>
          <CuentaActionLink href={`/${locale}#club`} tone="lemon">
            {t('clubPanel.rewardAction')}
          </CuentaActionLink>
        </div>
      </section>

      <section
        data-purpose="onboarding-guide"
        className="border-ink bg-cream shadow-pop-lg rounded-card space-y-4 border-4 p-6"
      >
        <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-2 pb-4">
          <div>
            <p className="font-label text-[11px] font-bold tracking-wide uppercase">
              {t('activation.guideLabel')}
            </p>
            <h2 className="font-display text-xl font-bold">{t('activation.guideTitle')}</h2>
          </div>
          <CuentaBadge tone="lemon">{t('activation.guideStatus')}</CuentaBadge>
        </div>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-ink bg-cream shadow-pop-sm rounded-card flex flex-col gap-3 border-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`border-ink ${step.tone} rounded-control font-label flex h-8 w-8 shrink-0 items-center justify-center border-2 text-xs font-bold`}
                >
                  {'done' in step && step.done ? <step.icon className="h-4 w-4" /> : index + 1}
                </span>
                <div className="space-y-1">
                  <p className="font-display text-sm font-bold">{step.title}</p>
                  <p className="font-body text-xs">{step.hint}</p>
                </div>
              </div>
              {'action' in step && step.action && step.href ? (
                <CuentaActionLink href={step.href} tone={index === 1 ? 'cobalt' : 'lemon'}>
                  {step.action}
                </CuentaActionLink>
              ) : (
                <CuentaBadge tone="aqua">{t('activation.step1Status')}</CuentaBadge>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section
        data-purpose="empty-orders"
        className="border-ink bg-cream shadow-pop-lg rounded-card space-y-3 border-4 p-8 text-center"
      >
        <span
          aria-hidden="true"
          className="border-ink bg-lemon shadow-pop rounded-card mx-auto flex h-16 w-16 items-center justify-center border-4"
        >
          <Package className="h-8 w-8" />
        </span>
        <h2 className="font-display text-xl font-bold">{t('activation.emptyTitle')}</h2>
        <p className="font-body mx-auto max-w-md text-sm">{t('activation.emptyHint')}</p>
        <CuentaActionLink href={`/${locale}/tienda`} tone="cobalt">
          {t('activation.emptyAction')}
        </CuentaActionLink>
      </section>
    </div>
  );
}
