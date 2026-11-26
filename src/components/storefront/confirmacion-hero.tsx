import { ArrowLeft, CheckCircle2, MessageSquare, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ConfirmacionHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.hero' });

  return (
    <section
      data-purpose="confirmacion-hero"
      aria-labelledby="confirmacion-title"
      className="border-ink bg-cream shadow-pop-lg relative overflow-hidden border-[3px] p-6 md:p-10"
    >
      <span
        aria-hidden="true"
        className="border-ink bg-orange text-cream shadow-pop absolute -top-3 right-6 z-10 rotate-12 border-2 px-4 py-2 text-sm font-bold"
      >
        {t('stickers.primary')}
      </span>
      <span
        aria-hidden="true"
        className="border-ink bg-lilac text-ink shadow-pop absolute right-10 bottom-4 z-10 hidden -rotate-6 border-2 px-3 py-1.5 text-sm font-bold md:block"
      >
        {t('stickers.secondary')}
      </span>

      <div className="relative max-w-3xl space-y-4">
        <span className="font-label border-ink bg-aqua text-ink shadow-pop-sm inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          {t('eyebrow')}
        </span>
        <h1
          id="confirmacion-title"
          className="font-display text-ink text-4xl font-bold tracking-tight uppercase md:text-5xl"
        >
          {t('title')}
        </h1>
        <p className="font-body text-ink text-sm">{t('subtitle')}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-label border-ink bg-lemon text-ink shadow-pop-sm border-2 px-3 py-1.5 text-xs font-bold uppercase">
            {t('badge')}
          </span>
          <span className="font-label border-ink bg-cream text-ink border-2 px-3 py-1.5 text-xs font-bold uppercase">
            {t('delivery')}
          </span>
        </div>
        <p className="font-body text-ink max-w-2xl text-sm leading-relaxed md:text-base">
          {t('summary')}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/${locale}/checkout/entrega`}
            aria-label={t('actions.delivery')}
            className="font-label border-ink bg-ink text-cream shadow-pop inline-flex min-h-12 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            <PackageCheck aria-hidden="true" className="h-4 w-4" />
            {t('actions.delivery')}
          </Link>
          <Link
            href={`/${locale}/contacto`}
            aria-label={t('actions.help')}
            className="font-label border-ink bg-cream text-ink shadow-pop inline-flex min-h-12 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            <MessageSquare aria-hidden="true" className="h-4 w-4" />
            {t('actions.help')}
          </Link>
          <Link
            href={`/${locale}/tienda`}
            aria-label={t('actions.catalog')}
            className="font-label border-ink bg-pink text-ink shadow-pop inline-flex min-h-12 items-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t('actions.catalog')}
          </Link>
        </div>
      </div>
    </section>
  );
}
