import { AuthInfoCard, AuthStepper, AuthTicker } from './auth-screen-primitives';
import { Lightbulb, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PasswordForm } from './auth-screen-password-form';
import { StitchShell } from '@/components/layout/stitch-shell';
import { getTranslations } from 'next-intl/server';

export async function PasswordScreen({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'authScreens' });

  return (
    <StitchShell shellType="web_blank" className="w-full max-w-6xl p-4 sm:p-8">
      <div data-purpose="auth-password" className="flex flex-col gap-8">
        <AuthTicker
          items={[t('common.tickerOne'), t('common.tickerTwo'), t('common.tickerThree')]}
        />

        <header className="border-ink flex flex-wrap items-center justify-between gap-4 border-b-2 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/${locale}`} className="font-display text-3xl leading-none">
              trino<span className="text-pink">.</span>
            </Link>
            <span className="border-ink bg-lemon shadow-pop-sm font-label border-2 px-2.5 py-1 text-[11px] font-bold uppercase">
              {t('common.brandTag')}
            </span>
          </div>
          <AuthStepper
            active={3}
            labels={[t('common.stepOne'), t('common.stepTwo'), t('common.stepThree')]}
          />
        </header>

        <div className="border-ink bg-cream shadow-pop-lg rounded-card grid grid-cols-1 overflow-hidden border-2 lg:grid-cols-12">
          <section
            data-purpose="auth-password-panel"
            className="border-ink flex flex-col border-b-2 p-6 sm:p-8 lg:col-span-7 lg:border-r-2 lg:border-b-0"
          >
            <span className="border-ink bg-lilac shadow-pop-sm font-label inline-flex w-fit items-center gap-2 border-2 px-3 py-1.5 text-[11px] font-bold uppercase">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {t('password.badge')}
            </span>

            <h1 className="font-display mt-6 text-3xl leading-tight sm:text-4xl">
              {t('password.title')}
            </h1>
            <p className="font-body text-ink/80 mt-4 max-w-xl text-sm">{t('password.intro')}</p>

            <PasswordForm locale={locale} />
          </section>

          <aside
            data-purpose="auth-password-aside"
            className="bg-pink flex flex-col gap-4 p-6 sm:p-8"
          >
            <div className="border-ink bg-cream shadow-pop rounded-card border-2 p-5">
              <span className="border-ink bg-lemon shadow-pop-sm font-label inline-block border-2 px-2.5 py-1 text-[11px] font-bold uppercase">
                {t('password.titleAccent')}
              </span>
              <h2 className="font-display mt-4 text-xl">
                trino<span className="text-pink">.</span>
              </h2>
              <p className="font-body mt-2 text-xs font-bold">{t('password.intro')}</p>
            </div>
            <AuthInfoCard icon={Lightbulb} title={t('password.tipTitle')} tone="bg-aqua">
              {t('password.tipBody')}
            </AuthInfoCard>
            <AuthInfoCard icon={ShieldCheck} title={t('password.helpTitle')} tone="bg-lilac">
              {t('password.helpBody')}
            </AuthInfoCard>
          </aside>
        </div>
      </div>
    </StitchShell>
  );
}
