import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ConfirmacionCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.catalogCta' });

  return (
    <section
      data-purpose="confirmacion-catalog-cta"
      aria-labelledby="confirmacion-cta-title"
      className="border-ink bg-cobalt text-cream shadow-pop-lg flex flex-col items-center justify-between gap-6 border-[3px] p-8 md:flex-row"
    >
      <div className="space-y-2 text-center md:text-left">
        <span className="font-label border-ink bg-lemon text-ink inline-block border-2 px-3 py-1 text-[10px] font-bold uppercase">
          {t('eyebrow')}
        </span>
        <h2 id="confirmacion-cta-title" className="font-display text-2xl font-bold uppercase">
          {t('title')}
        </h2>
        <p className="font-body max-w-xl text-sm">{t('description')}</p>
      </div>
      <Link
        href={`/${locale}/tienda`}
        aria-label={t('action')}
        className="font-label border-ink bg-lemon text-ink shadow-pop inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border-2 px-6 text-xs font-bold uppercase"
      >
        <Sparkles aria-hidden="true" className="h-4 w-4" />
        {t('action')}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
