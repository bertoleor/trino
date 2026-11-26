import { Building2, PackageCheck, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ITEMS = [
  {
    Icon: Building2,
    tone: 'bg-lemon',
    titleKey: 'items.catalog.title',
    bodyKey: 'items.catalog.body',
  },
  {
    Icon: PackageCheck,
    tone: 'bg-pink',
    titleKey: 'items.packaging.title',
    bodyKey: 'items.packaging.body',
  },
  {
    Icon: ShieldCheck,
    tone: 'bg-aqua',
    titleKey: 'items.service.title',
    bodyKey: 'items.service.body',
  },
] as const;

export async function ConfirmacionCommitment({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.commitment' });

  return (
    <section
      data-purpose="confirmacion-commitment"
      aria-labelledby="confirmacion-commitment-title"
      className="border-ink bg-lemon shadow-pop border-[3px] p-6"
    >
      <h3
        id="confirmacion-commitment-title"
        className="font-display border-ink flex items-center gap-2 border-b-[3px] pb-3 text-sm font-semibold uppercase"
      >
        <ShieldCheck aria-hidden="true" className="text-ink h-5 w-5" />
        {t('title')}
      </h3>
      <ul className="mt-4 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.titleKey} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`border-ink ${item.tone} flex h-8 w-8 shrink-0 items-center justify-center border p-1`}
            >
              <item.Icon className="text-ink h-4 w-4" />
            </span>
            <div>
              <p className="font-label text-ink text-[10px] font-bold uppercase">
                {t(item.titleKey)}
              </p>
              <p className="font-body mt-0.5 text-[11px]">{t(item.bodyKey)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
