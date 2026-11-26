import { ArrowRight, KeyRound, LogOut } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { signOut } from '@/app/auth/actions';

function AjustesCard({
  id,
  purpose,
  title,
  body,
  children,
}: {
  id: string;
  purpose: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-purpose={purpose}
      className="border-ink bg-cream shadow-pop rounded-card border-[3px] p-6 sm:p-8"
    >
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      <p className="font-body mt-2 text-sm">{body}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export async function AjustesSections({ locale, email }: { locale: string; email: string | null }) {
  const t = await getTranslations({ locale, namespace: 'ajustes' });

  return (
    <div className="flex flex-col gap-6 lg:col-span-8">
      <AjustesCard
        id="datos-personales"
        purpose="ajustes-personal"
        title={t('sections.personal.title')}
        body={t('sections.personal.body')}
      >
        <p className="font-label text-xs font-bold uppercase">{t('profile.emailLabel')}</p>
        <p className="font-body mt-1 text-sm break-all">{email ?? t('profile.anonymous')}</p>
        <p className="font-body border-ink mt-6 border-t-2 pt-4 text-xs">
          {t('sections.personal.note')}
        </p>
      </AjustesCard>

      <AjustesCard
        id="direcciones-entrega"
        purpose="ajustes-addresses"
        title={t('sections.addresses.title')}
        body={t('sections.addresses.body')}
      >
        <div className="border-ink bg-lilac rounded-card border-2 p-5 text-center">
          <p className="font-display text-lg font-semibold">{t('sections.addresses.emptyTitle')}</p>
          <p className="font-body mt-2 text-sm">{t('sections.addresses.emptyBody')}</p>
        </div>
      </AjustesCard>

      <AjustesCard
        id="metodos-pago"
        purpose="ajustes-payments"
        title={t('sections.payments.title')}
        body={t('sections.payments.body')}
      >
        <div className="border-ink bg-lilac rounded-card border-2 p-5 text-center">
          <p className="font-display text-lg font-semibold">{t('sections.payments.emptyTitle')}</p>
          <p className="font-body mt-2 text-sm">{t('sections.payments.emptyBody')}</p>
        </div>
      </AjustesCard>

      <AjustesCard
        id="seguridad"
        purpose="ajustes-security"
        title={t('sections.security.title')}
        body={t('sections.security.body')}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/recuperar-contrasea`}
            className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            <KeyRound aria-hidden="true" />
            {t('sections.security.passwordCta')}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
            >
              <LogOut aria-hidden="true" />
              {t('sections.security.signOut')}
            </button>
          </form>
        </div>
        <p className="font-body mt-4 text-xs">{t('sections.security.note')}</p>
      </AjustesCard>

      <AjustesCard
        id="notificaciones"
        purpose="ajustes-privacy"
        title={t('sections.notifications.title')}
        body={t('sections.notifications.body')}
      >
        <Link
          href={`/${locale}/privacy`}
          className="font-label border-ink bg-aqua text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          {t('sections.notifications.privacyCta')}
          <ArrowRight aria-hidden="true" />
        </Link>
        <p className="font-body mt-4 text-xs">{t('sections.notifications.note')}</p>
      </AjustesCard>

      <section
        data-purpose="ajustes-advanced"
        className="border-ink bg-ink text-cream shadow-pop-lg rounded-card border-[3px] p-6 sm:p-8"
      >
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{t('advanced.title')}</h2>
        <p className="font-body mt-2 text-sm">{t('advanced.body')}</p>
        <Link
          href={`/${locale}/contacto`}
          className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control mt-6 inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          {t('advanced.cta')}
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section
        data-purpose="ajustes-support"
        className="border-ink bg-pink text-ink shadow-pop rounded-card border-[3px] p-6 text-center"
      >
        <h2 className="font-display text-xl font-semibold">{t('support.title')}</h2>
        <p className="font-body mt-2 text-sm">{t('support.body')}</p>
        <Link
          href={`/${locale}/contacto`}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control mt-4 inline-flex min-h-11 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          {t('support.cta')}
        </Link>
      </section>
    </div>
  );
}
