import { Check, CheckCircle2, MailCheck, Palette, Sparkles, Ticket, X, Zap } from 'lucide-react';
import { ClubWelcomeActions } from '@/components/storefront/club-welcome-actions';
import { CuentaBadge } from '@/components/storefront/cuenta-ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ClubWelcome({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const bullets = [
    { icon: Check, title: t('welcome.bullet1Title'), hint: t('welcome.bullet1Hint') },
    { icon: Palette, title: t('welcome.bullet2Title'), hint: t('welcome.bullet2Hint') },
    { icon: Zap, title: t('welcome.bullet3Title'), hint: t('welcome.bullet3Hint') },
  ] as const;

  return (
    <section
      data-purpose="club-welcome"
      className="border-ink bg-ink rounded-card flex w-full justify-center border-2 p-4 md:p-8"
    >
      <div className="border-ink bg-cream shadow-pop-xl rounded-card w-full max-w-6xl overflow-hidden border-4">
        <header className="border-ink bg-lemon flex flex-wrap items-center justify-between gap-3 border-b-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="bg-ink rounded-control h-3.5 w-3.5" />
            <span
              aria-hidden="true"
              className="border-ink bg-pink rounded-control h-3.5 w-3.5 border-2"
            />
            <span
              aria-hidden="true"
              className="border-ink bg-aqua rounded-control h-3.5 w-3.5 border-2"
            />
            <p className="font-label ml-2 text-xs font-bold tracking-widest uppercase">
              {t('welcome.eyebrow')}
            </p>
          </div>
          <Link
            href={`/${locale}/tienda`}
            aria-label={t('welcome.close')}
            className="border-ink bg-cream shadow-pop-sm rounded-control flex h-9 w-9 items-center justify-center border-2"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="border-ink bg-cobalt text-cream flex flex-col gap-6 border-r-4 p-8 lg:col-span-5">
            <CuentaBadge tone="lemon">{t('welcome.badge')}</CuentaBadge>
            <div
              aria-hidden="true"
              className="border-ink bg-cream shadow-pop rounded-card flex h-56 items-center justify-center border-4"
            >
              <Sparkles className="text-ink h-16 w-16" />
            </div>
            <h2 className="font-display text-cream text-3xl leading-tight font-bold tracking-tight">
              {t('welcome.title')}
            </h2>
            <ul className="space-y-3">
              {bullets.map((bullet) => (
                <li
                  key={bullet.title}
                  className="border-ink bg-cream shadow-pop-sm text-ink rounded-card flex items-start gap-3 border-2 p-3"
                >
                  <span
                    aria-hidden="true"
                    className="border-ink bg-aqua rounded-control flex h-6 w-6 shrink-0 items-center justify-center border-2"
                  >
                    <bullet.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="font-label block text-sm font-bold uppercase">
                      {bullet.title}
                    </span>
                    <span className="font-body block text-xs">{bullet.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="font-label border-cream border-t-2 pt-4 text-xs font-bold tracking-wide uppercase">
              {t('welcome.footer')}
            </p>
          </div>

          <div className="bg-cream flex flex-col justify-between gap-6 p-8 lg:col-span-7">
            <div className="flex items-start gap-4">
              <div className="border-ink bg-aqua shadow-pop rounded-card relative flex h-16 w-16 shrink-0 items-center justify-center border-4">
                <MailCheck aria-hidden="true" className="text-ink h-8 w-8" />
                <span
                  aria-hidden="true"
                  className="border-ink bg-lemon rounded-control absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center border-2"
                >
                  <Check className="text-ink h-4 w-4" />
                </span>
              </div>
              <div className="space-y-1">
                <CuentaBadge tone="pink">{t('welcome.verified')}</CuentaBadge>
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {t('welcome.emailTitle')}
                </h1>
              </div>
            </div>

            <p className="border-ink bg-cream shadow-pop rounded-card font-body border-2 p-4 text-sm">
              {t('welcome.emailHint')}
            </p>

            <div className="border-ink bg-lemon shadow-pop rounded-card space-y-3 border-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-label text-xs font-bold tracking-wide uppercase">
                  {t('welcome.benefitLabel')}
                </p>
                <CuentaBadge tone="ink">{t('welcome.validToday')}</CuentaBadge>
              </div>
              <div className="border-ink bg-cream shadow-pop-sm rounded-card flex items-center justify-between gap-3 border-2 p-3">
                <div>
                  <p className="font-label text-[11px] font-bold tracking-wide uppercase">
                    {t('welcome.codeLabel')}
                  </p>
                  <p className="font-display text-lg font-bold">{t('welcome.code')}</p>
                </div>
                <Ticket aria-hidden="true" className="text-ink h-6 w-6" />
              </div>
              <p className="font-body flex items-center gap-2 text-xs">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                {t('welcome.benefitHint')}
              </p>
            </div>

            <ClubWelcomeActions locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
