import { CuentaActionLink, CuentaBadge, CuentaPanel } from '@/components/storefront/cuenta-ui';
import { Heart, MapPin, MessageCircle, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ClubPerksSidebar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });

  return (
    <aside data-purpose="club-sidebar" className="space-y-6">
      <CuentaPanel purpose="club-recommendation" tone="lemon" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CuentaBadge tone="ink">{t('activation.recommendTitle')}</CuentaBadge>
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </div>
        <p className="font-body text-sm">{t('activation.recommendHint')}</p>
        <CuentaActionLink href={`/${locale}#club`} tone="ink" className="w-full">
          {t('activation.recommendAction')}
        </CuentaActionLink>
      </CuentaPanel>

      <CuentaPanel purpose="club-progress" className="space-y-3">
        <div className="border-ink flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3">
          <h2 className="font-display text-lg font-bold">{t('activation.progressTitle')}</h2>
          <CuentaBadge tone="lilac">{t('activation.level')}</CuentaBadge>
        </div>
        <p className="font-label text-xs font-bold tracking-wide uppercase">
          {t('activation.progressLabel')}
        </p>
        <p className="font-display text-base font-bold">{t('clubPanel.levelValue')}</p>
        <p className="font-body text-sm">{t('activation.progressHint')}</p>
      </CuentaPanel>

      <CuentaPanel purpose="club-invite" tone="lilac" className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart aria-hidden="true" className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">{t('activation.inviteTitle')}</h2>
        </div>
        <p className="font-body text-sm">{t('activation.inviteHint')}</p>
        <div className="border-ink bg-cream shadow-pop-sm rounded-card flex items-center justify-between gap-2 border-2 p-3">
          <span className="font-label text-xs font-bold tracking-wide uppercase">
            {t('clubPanel.inviteCode')}
          </span>
          <Users aria-hidden="true" className="h-5 w-5" />
        </div>
      </CuentaPanel>

      <CuentaPanel purpose="club-shortcuts" className="space-y-3">
        <h2 className="font-label text-xs font-bold tracking-wide uppercase">
          {t('activation.shortcutsTitle')}
        </h2>
        <ul className="space-y-2">
          <li>
            <Link
              href={`/${locale}/cuenta`}
              className="border-ink shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3"
            >
              <MapPin aria-hidden="true" className="h-5 w-5" />
              <span className="font-body text-sm font-bold">{t('shortcuts.address')}</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}#contacto`}
              className="border-ink shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              <span className="font-body text-sm font-bold">{t('activation.support')}</span>
            </Link>
          </li>
        </ul>
      </CuentaPanel>
    </aside>
  );
}
