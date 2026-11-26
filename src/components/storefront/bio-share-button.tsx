'use client';

import { Check, Share2 } from 'lucide-react';
import { canWebShare, copyLink } from '@/lib/share';
import { useState } from 'react';

export function BioShareButton({
  label,
  copied,
  title,
}: {
  label: string;
  copied: string;
  title: string;
}) {
  const [done, setDone] = useState(false);

  async function onShare() {
    if (canWebShare()) {
      try {
        await (navigator as unknown as { share: (data: unknown) => Promise<void> }).share({
          title,
          url: window.location.href,
        });
        return;
      } catch {
        // Dismissed or unsupported: fall back to copying the link.
      }
    }
    const ok = await copyLink(window.location.href);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 2400);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onShare}
        className="border-ink shadow-pop bg-cream text-ink font-label rounded-control active:shadow-pop-sm flex min-h-11 items-center gap-2 border-[3px] px-5 py-2 text-sm font-black tracking-wider uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5"
      >
        {done ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
        {done ? copied : label}
      </button>
      <span aria-live="polite" className="sr-only">
        {done ? copied : ''}
      </span>
    </div>
  );
}
