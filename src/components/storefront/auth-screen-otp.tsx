import { ArrowLeft, Info, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { AuthStepper, AuthTicker } from './auth-screen-primitives';
import Link from 'next/link';
import { StitchShell } from '@/components/layout/stitch-shell';
import { getTranslations } from 'next-intl/server';

export async function OtpScreen({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'authScreens' });

  return (
    <StitchShell shellType="web_blank" className="w-full max-w-6xl p-4 sm:p-8">
      <div data-purpose="auth-otp" className="flex flex-col gap-8">
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
            active={2}
            labels={[t('common.stepOne'), t('common.stepTwo'), t('common.stepThree')]}
          />
        </header>

        <div className="border-ink bg-cream shadow-pop-lg rounded-card grid grid-cols-1 overflow-hidden border-2 lg:grid-cols-12">
          <section
            data-purpose="auth-otp-form"
            className="border-ink flex flex-col justify-between border-b-2 p-6 sm:p-8 lg:col-span-7 lg:border-r-2 lg:border-b-0"
          >
            <div>
              <span className="border-ink bg-aqua shadow-pop-sm font-label inline-flex w-fit items-center gap-2 border-2 px-3 py-1.5 text-[11px] font-bold uppercase">
                <ShieldCheck aria-hidden="true" className="size-4" />
                {t('otp.badge')}
              </span>
              <h1 className="font-display mt-5 text-3xl leading-tight sm:text-4xl">
                {t('otp.title')}
              </h1>
              <p className="font-body text-ink/80 mt-3 text-sm">{t('otp.intro')}</p>
              <p className="border-ink bg-lemon shadow-pop-sm font-label mt-4 w-fit border-2 px-3 py-1.5 text-[11px] font-bold uppercase">
                {t('otp.notice')}
              </p>

              <div className="mt-8">
                <p
                  id="otp-code-label"
                  className="font-label text-[11px] font-bold tracking-wider uppercase"
                >
                  {t('otp.codeLabel')}
                </p>
                <div
                  aria-hidden="true"
                  role="presentation"
                  aria-labelledby="otp-code-label"
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <span
                      key={index}
                      className={`border-ink shadow-pop-sm rounded-control flex size-12 items-center justify-center border-2 sm:size-14 ${
                        index === 0 ? 'bg-lemon' : 'bg-cream'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-body text-ink/70 mt-3 text-xs">{t('otp.codeHelp')}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t-2 pt-4">
              <button
                type="button"
                disabled
                className="bg-ink text-cream border-ink shadow-pop-sm font-label rounded-control flex h-14 items-center justify-center border-2 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('otp.ctaDisabled')}
              </button>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/${locale}/recuperar-contrasea`}
                  className="font-label inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase underline decoration-2"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  {t('otp.back')}
                </Link>
                <button
                  type="button"
                  disabled
                  className="font-label min-h-11 text-[11px] font-bold uppercase underline decoration-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('otp.resendDisabled')}
                </button>
              </div>
            </div>
          </section>

          <aside data-purpose="auth-otp-aside" className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="border-ink bg-cream shadow-pop rounded-card border-2 p-5">
              <h2 className="font-display text-lg">{t('otp.channelsTitle')}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                <li className="border-ink bg-cream shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3">
                  <Mail aria-hidden="true" className="size-5 shrink-0" />
                  <span className="font-label text-xs font-bold">{t('otp.channelEmail')}</span>
                </li>
                <li className="border-ink bg-cream shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3">
                  <Smartphone aria-hidden="true" className="size-5 shrink-0" />
                  <span className="font-label text-xs font-bold">{t('otp.channelPhone')}</span>
                </li>
              </ul>
              <p className="font-body text-ink/70 mt-3 text-xs">{t('otp.channelNote')}</p>
            </div>

            <div className="border-ink bg-lemon shadow-pop rounded-card border-2 p-5">
              <ShieldCheck aria-hidden="true" className="size-6" />
              <h2 className="font-display mt-3 text-lg">{t('otp.protectionTitle')}</h2>
              <p className="font-body mt-2 text-xs font-bold">{t('otp.protectionBody')}</p>
            </div>

            <div className="border-ink bg-lilac shadow-pop rounded-card border-2 p-5">
              <Info aria-hidden="true" className="size-6" />
              <h2 className="font-display mt-3 text-lg">{t('otp.helpTitle')}</h2>
              <p className="font-body mt-2 text-xs font-bold">{t('otp.helpBody')}</p>
              <Link
                href="/login"
                className="font-label mt-4 inline-flex min-h-11 items-center text-[11px] font-bold uppercase underline decoration-2"
              >
                {t('common.backToLogin')}
              </Link>
            </div>
          </aside>
        </div>

        <p className="font-label text-ink/70 text-center text-[11px] uppercase">
          {t('otp.footnote')}
        </p>
      </div>
    </StitchShell>
  );
}
