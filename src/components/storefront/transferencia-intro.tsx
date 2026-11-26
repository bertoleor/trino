import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function TransferenciaIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'transferencia.intro' });

  return (
    <section data-purpose="transferencia-intro" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/checkout/pago`}
          aria-label={t('back')}
          className="font-label text-ink inline-flex min-h-11 items-center gap-2 text-[10px] font-bold tracking-wide uppercase"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t('back')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label border-ink bg-ink text-cream shadow-pop-sm border-2 px-2 py-1 text-[10px] font-bold uppercase">
            {t('step')}
          </span>
          <span className="font-label text-ink text-xs font-bold uppercase">{t('title')}</span>
        </div>
      </div>
      <div className="border-ink bg-lemon shadow-pop flex flex-col gap-2 border-[3px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-label text-ink flex items-center gap-2 text-xs font-bold uppercase">
          <Clock aria-hidden="true" className="h-5 w-5" />
          {t('noticeTitle')}
        </span>
        <p className="font-body text-ink text-xs">{t('noticeBody')}</p>
      </div>
    </section>
  );
}
