import { ArrowRight, Check, Settings2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const TABS = [
  { key: 'overview', href: 'cuenta' },
  { key: 'orders', href: 'cuenta' },
  { key: 'tone', href: 'test-de-tono/paso-1' },
  { key: 'favorites', href: 'wishlist' },
  { key: 'club', href: 'club' },
  { key: 'settings', href: 'cuenta/ajustes' },
] as const;

const SECTION_LINKS = [
  { key: 'personal', href: '#datos-personales' },
  { key: 'addresses', href: '#direcciones-entrega' },
  { key: 'payments', href: '#metodos-pago' },
  { key: 'security', href: '#seguridad' },
  { key: 'notifications', href: '#notificaciones' },
] as const;

export async function AjustesBreadcrumb({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ajustes' });
  return (
    <nav
      data-purpose="ajustes-breadcrumb"
      aria-label={t('breadcrumb.label')}
      className="font-body col-span-full text-sm"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/${locale}/cuenta`}>{t('breadcrumb.account')}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li
          aria-current="page"
          className="border-ink bg-lemon shadow-pop-sm rounded-control border-2 px-2 py-0.5 font-semibold"
        >
          {t('breadcrumb.current')}
        </li>
      </ol>
    </nav>
  );
}

export async function AjustesHeader({
  locale,
  hasSession,
}: {
  locale: string;
  hasSession: boolean;
}) {
  const t = await getTranslations({ locale, namespace: 'ajustes' });
  return (
    <section
      data-purpose="ajustes-header"
      className="border-ink bg-cream rounded-card col-span-full border-[3px] px-4 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-label border-ink bg-pink text-ink shadow-pop-sm rounded-control inline-flex items-center gap-2 border-2 px-3 py-1 text-xs font-bold uppercase">
          <Settings2 aria-hidden="true" />
          {t('header.eyebrow')}
        </p>
        <h1 className="font-display mt-4 text-3xl leading-tight font-semibold sm:text-5xl">
          {t('header.title')}
        </h1>
        <p className="font-body mt-3 max-w-2xl">{t('header.body')}</p>
        <p className="font-label mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase">
          <Check aria-hidden="true" className="text-cobalt" />
          {t('header.statusLabel')}:{' '}
          {hasSession ? t('header.statusActive') : t('header.statusNone')}
        </p>
      </div>
    </section>
  );
}

export async function AjustesTabs({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ajustes' });
  return (
    <nav
      data-purpose="ajustes-tabs"
      aria-label={t('header.tabsLabel')}
      className="border-ink col-span-full flex flex-wrap gap-2 border-b-[3px] pb-6"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/${locale}/${tab.href}`}
          aria-current={tab.key === 'settings' ? 'page' : undefined}
          className={`font-label border-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center border-2 px-4 text-xs font-bold uppercase ${
            tab.key === 'settings' ? 'bg-pink text-ink' : 'bg-cream text-ink'
          }`}
        >
          {t(`header.tabs.${tab.key}`)}
        </Link>
      ))}
    </nav>
  );
}

export async function AjustesSidebar({ locale, email }: { locale: string; email: string | null }) {
  const t = await getTranslations({ locale, namespace: 'ajustes' });
  return (
    <aside data-purpose="ajustes-sidebar" className="flex flex-col gap-6 lg:col-span-4">
      <section className="border-ink bg-lilac shadow-pop rounded-card border-[3px] p-6">
        <span
          aria-hidden="true"
          className="border-ink bg-pink text-ink shadow-pop-sm rounded-control mb-4 flex h-14 w-14 items-center justify-center border-2"
        >
          <UserRound />
        </span>
        <h2 className="font-display text-xl font-semibold">{t('profile.title')}</h2>
        <p className="font-label mt-4 text-xs font-bold uppercase">{t('profile.emailLabel')}</p>
        <p className="font-body mt-1 text-sm break-all">{email ?? t('profile.anonymous')}</p>
        <p className="font-body mt-4 text-xs">{t('profile.hint')}</p>
      </section>
      <nav
        aria-label={t('nav.label')}
        className="border-ink bg-cream shadow-pop rounded-card flex flex-col gap-2 border-[3px] p-3"
      >
        {SECTION_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="font-label border-ink bg-cream text-ink shadow-pop-sm rounded-control inline-flex min-h-11 items-center justify-between gap-2 border-2 px-3 text-xs font-bold uppercase"
          >
            {t(`sections.${link.key}.title`)}
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
