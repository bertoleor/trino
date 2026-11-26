import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthStepList, AuthStepper, AuthTicker } from './auth-screen-primitives';
import Link from 'next/link';
import { StitchShell } from '@/components/layout/stitch-shell';
import { getTranslations } from 'next-intl/server';

export async function RecoveryScreen({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'authScreens' });
  const steps = [
    { title: t('recovery.stepOneTitle'), body: t('recovery.stepOneBody') },
    { title: t('recovery.stepTwoTitle'), body: t('recovery.stepTwoBody') },
    { title: t('recovery.stepThreeTitle'), body: t('recovery.stepThreeBody') },
  ];

  return (
    <StitchShell shellType="web_blank" className="w-full max-w-6xl p-4 sm:p-8">
      <div data-purpose="auth-recovery" className="flex flex-col gap-8">
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
            active={1}
            labels={[t('common.stepOne'), t('common.stepTwo'), t('common.stepThree')]}
          />
        </header>

        <div className="border-ink bg-cream shadow-pop-lg rounded-card grid grid-cols-1 overflow-hidden border-2 lg:grid-cols-12">
          <section
            data-purpose="auth-recovery-form"
            className="border-ink flex flex-col border-b-2 p-6 sm:p-8 lg:col-span-7 lg:border-r-2 lg:border-b-0"
          >
            <span className="border-ink bg-lemon shadow-pop-sm font-label inline-flex w-fit items-center gap-2 border-2 px-3 py-1.5 text-[11px] font-bold uppercase">
              <KeyRound aria-hidden="true" className="size-4" />
              {t('recovery.badge')}
            </span>

            <h1 className="font-display mt-6 text-3xl leading-tight sm:text-4xl">
              {t('recovery.title')}{' '}
              <span className="bg-pink border-ink shadow-pop-sm -rotate-1 border-2 px-2">
                {t('recovery.titleAccent')}
              </span>
            </h1>
            <p className="font-body text-ink/80 mt-4 max-w-xl text-sm">{t('recovery.intro')}</p>

            <form className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="recovery-email"
                  className="font-label text-[11px] font-bold tracking-wider uppercase"
                >
                  {t('recovery.emailLabel')}
                </label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  placeholder={t('recovery.emailPlaceholder')}
                  className="border-ink bg-cream shadow-pop-sm text-ink placeholder:text-ink/50 focus:shadow-pop rounded-control font-body h-12 border-2 px-4"
                />
                <p className="font-body text-ink/70 mt-1 text-xs">{t('recovery.emailHint')}</p>
              </div>

              <button
                type="button"
                disabled
                className="bg-ink text-cream border-ink shadow-pop-sm font-label rounded-control flex h-14 min-h-11 items-center justify-center border-2 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('recovery.ctaDisabled')}
              </button>
            </form>

            <Link
              href="/login"
              className="font-label mt-8 inline-flex min-h-11 items-center gap-2 self-start text-[11px] font-bold uppercase underline decoration-2"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t('common.backToLogin')}
            </Link>
          </section>

          <aside
            data-purpose="auth-recovery-aside"
            className="bg-lilac flex flex-col gap-4 p-6 sm:p-8"
          >
            <div className="border-ink bg-cream shadow-pop rounded-card border-2 p-5">
              <h2 className="font-display text-xl">{t('recovery.howTitle')}</h2>
              <AuthStepList steps={steps} />
            </div>
            <div className="border-ink bg-aqua shadow-pop rounded-card border-2 p-5">
              <ShieldCheck aria-hidden="true" className="size-6" />
              <h2 className="font-display mt-3 text-lg">{t('recovery.helpTitle')}</h2>
              <p className="font-body mt-2 text-xs font-bold">{t('recovery.helpBody')}</p>
            </div>
          </aside>
        </div>

        <p className="font-label text-ink/70 text-center text-[11px] uppercase">
          {t('recovery.footnote')}
        </p>
      </div>
    </StitchShell>
  );
}
