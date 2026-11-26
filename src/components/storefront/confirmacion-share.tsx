import { Camera, Link2 } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ConfirmacionShare({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.share' });

  return (
    <section
      data-purpose="confirmacion-share"
      aria-labelledby="confirmacion-share-title"
      className="border-ink bg-pink text-ink shadow-pop border-[3px] p-6"
    >
      <span className="font-label border-ink bg-ink text-cream border-2 px-2.5 py-1 text-[10px] font-bold uppercase">
        {t('eyebrow')}
      </span>
      <h3
        id="confirmacion-share-title"
        className="font-display mt-3 text-lg font-semibold uppercase"
      >
        {t('title')}
      </h3>
      <p className="font-body mt-2 text-sm leading-snug">{t('description')}</p>
      <div className="mt-5 space-y-2">
        <Link
          href={`/${locale}/contacto`}
          aria-label={t('primary')}
          className="font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
        >
          <Camera aria-hidden="true" className="h-4 w-4" />
          {t('primary')}
        </Link>
        <Link
          href={`/${locale}/tienda`}
          aria-label={t('secondary')}
          className="font-label border-ink bg-cream text-ink shadow-pop-sm inline-flex min-h-11 w-full items-center justify-center gap-2 border-2 px-4 text-[10px] font-bold uppercase"
        >
          <Link2 aria-hidden="true" className="h-4 w-4" />
          {t('secondary')}
        </Link>
      </div>
    </section>
  );
}
