'use client';

import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export function WishlistGalleryNotify() {
  const t = useTranslations('institucional.wishlist.notify');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <section
        data-purpose="wishlist-gallery-notify"
        aria-labelledby="wishlist-gallery-notify-title"
        className="border-ink bg-lilac shadow-pop rounded-card col-span-12 border-[3px] p-6"
      >
        <span className="font-label text-[10px] font-bold tracking-widest uppercase">
          {t('eyebrow')}
        </span>
        <h2 id="wishlist-gallery-notify-title" className="font-display mt-2 text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="font-body mt-2 max-w-2xl text-sm">{t('body')}</p>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="font-label border-ink bg-ink text-cream shadow-pop-sm rounded-control mt-5 inline-flex min-h-11 items-center gap-2 border-2 px-5 text-xs font-bold uppercase"
        >
          <Bell aria-hidden="true" className="h-4 w-4" />
          {t('open')}
        </button>
      </section>

      {open ? (
        <div
          data-purpose="wishlist-gallery-modal"
          className="bg-ink fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-gallery-modal-title"
            className="border-ink bg-cream shadow-pop-lg rounded-card w-full max-w-md border-[3px] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="wishlist-gallery-modal-title" className="font-display text-xl font-semibold">
                {t('title')}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center border-2"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <p className="font-body mt-4 text-sm">{t('body')}</p>
            <label className="mt-6 block">
              <span className="font-label text-[10px] font-bold uppercase">{t('emailLabel')}</span>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="border-ink bg-cream text-ink rounded-control mt-2 min-h-11 w-full border-2 px-4"
              />
            </label>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-label border-ink bg-pink text-ink shadow-pop-sm rounded-control mt-4 inline-flex min-h-11 w-full items-center justify-center border-2 px-4 text-xs font-bold uppercase"
            >
              {t('submit')}
            </button>
            <p className="font-body mt-3 text-xs">{t('note')}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
