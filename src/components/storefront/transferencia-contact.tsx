import { Mail, Paperclip, Rocket } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function TransferenciaContact({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'transferencia.contact' });
  const note = await getTranslations({ locale, namespace: 'transferencia.note' });

  return (
    <>
      <section
        data-purpose="transferencia-contact-actions"
        aria-labelledby="transferencia-contact-title"
        className="border-ink bg-cream shadow-pop flex flex-col gap-4 border-[3px] p-6"
      >
        <div>
          <h2
            id="transferencia-contact-title"
            className="font-display text-sm font-semibold uppercase"
          >
            {t('title')}
          </h2>
          <p className="font-body mt-1 text-xs">{t('description')}</p>
        </div>
        <Link
          href={`/${locale}/contacto`}
          aria-label={t('primary')}
          className="font-label border-ink bg-aqua text-ink shadow-pop flex min-h-12 w-full items-center justify-between gap-3 border-2 px-4 text-xs font-bold uppercase"
        >
          <span className="flex items-center gap-3">
            <Mail aria-hidden="true" className="h-6 w-6" />
            {t('primary')}
          </span>
          <Rocket aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link
          href={`/${locale}/tienda`}
          aria-label={t('secondary')}
          className="font-label border-ink bg-pink text-ink shadow-pop flex min-h-12 w-full items-center justify-between gap-3 border-2 px-4 text-xs font-bold uppercase"
        >
          <span className="flex items-center gap-3">
            <Paperclip aria-hidden="true" className="h-6 w-6" />
            {t('secondary')}
          </span>
          <Rocket aria-hidden="true" className="h-4 w-4" />
        </Link>
        <div className="border-ink bg-cream shadow-pop-sm flex flex-col items-center gap-1 border-2 p-4 text-center">
          <Paperclip aria-hidden="true" className="text-ink h-6 w-6" />
          <span className="font-label text-ink text-[10px] font-bold uppercase">
            {t('upload.title')}
          </span>
          <p className="font-body text-[11px]">{t('upload.body')}</p>
        </div>
      </section>

      <section
        data-purpose="transferencia-note"
        aria-labelledby="transferencia-note-title"
        className="border-ink bg-cream shadow-pop flex items-center gap-4 border-[3px] p-4"
      >
        <span className="border-ink bg-aqua shadow-pop-sm flex h-12 w-12 shrink-0 items-center justify-center border-2">
          <Rocket aria-hidden="true" className="text-ink h-6 w-6" />
        </span>
        <div>
          <h3
            id="transferencia-note-title"
            className="font-display text-xs font-semibold uppercase"
          >
            {note('title')}
          </h3>
          <p className="font-body mt-1 text-[11px]">{note('body')}</p>
        </div>
      </section>
    </>
  );
}
