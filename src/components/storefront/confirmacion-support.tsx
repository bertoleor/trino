import { MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function ConfirmacionSupport({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.support' });

  return (
    <section
      data-purpose="confirmacion-support"
      aria-labelledby="confirmacion-support-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <div className="border-ink flex items-center gap-3 border-b-[3px] pb-3">
        <span className="border-ink bg-aqua shadow-pop-sm rounded-control flex h-12 w-12 shrink-0 items-center justify-center border-2">
          <Sparkles aria-hidden="true" className="text-ink h-6 w-6" />
        </span>
        <div>
          <span className="font-label text-ink block text-[10px] font-bold uppercase opacity-70">
            {t('eyebrow')}
          </span>
          <h3 id="confirmacion-support-title" className="font-display text-sm font-semibold">
            {t('title')}
          </h3>
        </div>
      </div>
      <p className="font-body mt-4 text-xs leading-relaxed">{t('description')}</p>
      <p className="font-label border-ink bg-lemon text-ink mt-4 flex items-center gap-2 border-2 p-3 text-[10px] font-bold uppercase">
        <span
          aria-hidden="true"
          className="bg-aqua border-ink rounded-control h-2.5 w-2.5 border"
        />
        {t('status')}
      </p>
      <Link
        href={`/${locale}/contacto`}
        aria-label={t('action')}
        className="font-label border-ink bg-aqua text-ink shadow-pop mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4" />
        {t('action')}
      </Link>
    </section>
  );
}
