import { CreditCard, Heart, MapPin, MessageCircle } from 'lucide-react';
import { CuentaPanel } from '@/components/storefront/cuenta-ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function CuentaShortcuts({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cuenta' });
  const shortcuts = [
    { icon: MapPin, label: t('shortcuts.address'), hint: t('shortcuts.addressHint') },
    { icon: CreditCard, label: t('shortcuts.payments'), hint: t('shortcuts.paymentsHint') },
    { icon: Heart, label: t('shortcuts.coupons'), hint: t('shortcuts.couponsHint') },
    { icon: MessageCircle, label: t('shortcuts.help'), hint: t('shortcuts.helpHint') },
  ] as const;

  return (
    <CuentaPanel purpose="account-shortcuts" className="space-y-3">
      <h2 className="font-label text-xs font-bold tracking-wide uppercase">
        {t('shortcuts.title')}
      </h2>
      <ul className="space-y-2">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.label}>
            <Link
              href={`/${locale}/cuenta`}
              className="border-ink shadow-pop-sm rounded-card flex items-center gap-3 border-2 p-3"
            >
              <shortcut.icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="min-w-0">
                <span className="font-display block text-sm font-bold">{shortcut.label}</span>
                <span className="font-body block text-xs">{shortcut.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </CuentaPanel>
  );
}
