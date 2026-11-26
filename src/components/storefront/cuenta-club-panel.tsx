import { CuentaActionLink, CuentaBadge, CuentaPanel } from '@/components/storefront/cuenta-ui';
import { Gift, Sparkles, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function CuentaClubPanel({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });

  return (
    <CuentaPanel id="club" purpose="club-benefits" tone="pink" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CuentaBadge tone="cream">{t('clubPanel.status')}</CuentaBadge>
        <Sparkles aria-hidden="true" className="h-5 w-5" />
      </div>
      <h2 className="font-display text-xl font-bold">{t('clubPanel.title')}</h2>

      <div className="border-ink bg-cream shadow-pop-sm rounded-card space-y-1 border-2 p-3">
        <p className="font-label text-[11px] font-bold tracking-wide uppercase">
          {t('clubPanel.level')}
        </p>
        <p className="font-display text-lg font-bold">{t('clubPanel.levelValue')}</p>
        <p className="font-body text-xs">{t('clubPanel.progressHint')}</p>
      </div>

      <div className="border-ink bg-lemon shadow-pop-sm rounded-card space-y-2 border-2 p-3">
        <div className="flex items-center gap-2">
          <Gift aria-hidden="true" className="h-4 w-4" />
          <p className="font-label text-xs font-bold tracking-wide uppercase">
            {t('clubPanel.rewardTitle')}
          </p>
        </div>
        <p className="font-body text-xs">{t('clubPanel.rewardHint')}</p>
        <CuentaActionLink href={`/${locale}#club`} tone="ink" className="w-full">
          {t('clubPanel.rewardAction')}
        </CuentaActionLink>
      </div>

      <div className="border-ink bg-lilac shadow-pop-sm rounded-card space-y-2 border-2 p-3">
        <div className="flex items-center gap-2">
          <Users aria-hidden="true" className="h-4 w-4" />
          <p className="font-label text-xs font-bold tracking-wide uppercase">
            {t('clubPanel.inviteTitle')}
          </p>
        </div>
        <p className="font-body text-xs">{t('clubPanel.inviteHint')}</p>
        <p className="font-display text-sm font-bold">{t('clubPanel.inviteCode')}</p>
      </div>
    </CuentaPanel>
  );
}
