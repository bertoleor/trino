'use client';

import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function WishlistGalleryShare() {
  const t = useTranslations('institucional.wishlist.share');
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      data-purpose="wishlist-gallery-share"
      aria-labelledby="wishlist-gallery-share-title"
      className="border-ink bg-aqua text-ink shadow-pop rounded-card col-span-12 border-[3px] p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <span className="font-label border-ink bg-ink text-cream rounded-control inline-flex items-center gap-2 border-2 px-3 py-2 text-[10px] font-bold uppercase">
            <Share2 aria-hidden="true" className="h-4 w-4" />
            {t('eyebrow')}
          </span>
          <h2
            id="wishlist-gallery-share-title"
            className="font-display text-3xl font-semibold sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="font-body text-sm">{t('body')}</p>
          <div className="border-ink bg-cream shadow-pop-sm rounded-card border-2 p-4">
            <p className="font-body text-sm font-semibold">{t('highlight')}</p>
          </div>
        </div>
        <div className="border-ink bg-cream shadow-pop rounded-card space-y-4 border-[3px] p-6 lg:col-span-5">
          <p className="font-label text-[10px] font-bold uppercase">{t('linkLabel')}</p>
          <button
            type="button"
            onClick={copyLink}
            className="font-label border-ink bg-lemon text-ink shadow-pop-sm rounded-control inline-flex min-h-11 w-full items-center justify-center gap-2 border-2 px-4 text-xs font-bold uppercase"
          >
            <Check aria-hidden="true" className="h-4 w-4" />
            {t('copy')}
          </button>
          <p role="status" className="font-body min-h-5 text-xs">
            {status === 'copied' ? t('copied') : status === 'error' ? t('copyError') : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
