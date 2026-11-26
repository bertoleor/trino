import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function PasswordForm({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'authScreens' });
  const requirements = [
    t('password.requirementOne'),
    t('password.requirementTwo'),
    t('password.requirementThree'),
  ];

  return (
    <div data-purpose="auth-password-form" className="mt-8 flex flex-col gap-5">
      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password-new"
            className="font-label text-[11px] font-bold tracking-wider uppercase"
          >
            {t('password.newLabel')}
          </label>
          <div className="relative">
            <input
              id="password-new"
              name="new-password"
              type="password"
              placeholder={t('password.placeholder')}
              className="border-ink bg-cream shadow-pop-sm text-ink placeholder:text-ink/50 focus:shadow-pop rounded-control font-body h-12 w-full border-2 px-4 pr-12"
            />
            <Eye aria-hidden="true" className="text-ink/60 absolute top-3.5 right-4 size-5" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password-confirm"
            className="font-label text-[11px] font-bold tracking-wider uppercase"
          >
            {t('password.confirmLabel')}
          </label>
          <div className="relative">
            <input
              id="password-confirm"
              name="confirm-password"
              type="password"
              placeholder={t('password.placeholder')}
              className="border-ink bg-cream shadow-pop-sm text-ink placeholder:text-ink/50 focus:shadow-pop rounded-control font-body h-12 w-full border-2 px-4 pr-12"
            />
            <Eye aria-hidden="true" className="text-ink/60 absolute top-3.5 right-4 size-5" />
          </div>
        </div>

        <div aria-hidden="true" className="flex gap-1.5">
          {[0, 1, 2, 3].map((bar) => (
            <span key={bar} className="border-ink bg-cream h-2 flex-1 border" />
          ))}
        </div>
        <p className="font-body text-ink/70 text-xs">{t('password.strengthIdle')}</p>

        <div className="border-ink bg-cream shadow-pop-sm rounded-control border-2 p-4">
          <p className="font-label text-[11px] font-bold tracking-wider uppercase">
            {t('password.requirementsTitle')}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {requirements.map((requirement) => (
              <li key={requirement} className="font-body flex items-center gap-2 text-xs">
                <span className="border-ink bg-lemon size-2.5 shrink-0 border" />
                {requirement}
              </li>
            ))}
          </ul>
        </div>

        <label
          htmlFor="password-logout"
          className="border-ink bg-cream shadow-pop-sm rounded-control flex cursor-pointer items-start gap-3 border-2 p-4"
        >
          <input
            id="password-logout"
            name="logout-others"
            type="checkbox"
            className="border-ink bg-cream mt-0.5 size-5 shrink-0 accent-current"
          />
          <span>
            <span className="font-label block text-[11px] font-bold tracking-wider uppercase">
              {t('password.logoutLabel')}
            </span>
            <span className="font-body text-ink/70 mt-1 block text-xs">
              {t('password.logoutBody')}
            </span>
          </span>
        </label>

        <button
          type="button"
          disabled
          className="bg-ink text-cream border-ink shadow-pop-sm font-label rounded-control flex h-14 min-h-11 items-center justify-center border-2 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('password.ctaDisabled')}
        </button>
      </form>

      <Link
        href="/login"
        className="font-label mt-8 inline-flex min-h-11 items-center gap-2 self-start text-[11px] font-bold uppercase underline decoration-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('common.backToLogin')}
      </Link>
    </div>
  );
}
