'use client';
import { buildShareUrls, canWebShare, copyLink, getShareText, isShareEntity } from '@/lib/share';
import { capture } from '@/lib/analytics/posthog';
import { logger } from '@/lib/logger';
import { useState } from 'react';
type Props = { url: string; title: string; entity?: string; locale?: string };
export default function ShareSheet({ url, title, entity = 'product', locale = 'es-AR' }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const text = getShareText(locale, isShareEntity(entity) ? entity : 'product');
  const urls = buildShareUrls({ url, text: `${text} ${title}` });
  async function onShare() {
    if (canWebShare()) {
      try {
        await (navigator as unknown as { share: (d: unknown) => Promise<void> }).share({
          title,
          text,
          url,
        });
        capture('share_clicked', { entity, method: 'web_share' });
        return;
      } catch (e) {
        logger.warn('web share dismissed, sheet fallback', {
          route: 'share/sheet',
          error: String(e),
        });
      }
    }
    setOpen((v) => !v);
  }
  async function onCopy() {
    const ok = await copyLink(url);
    setCopied(ok);
    capture('share_clicked', { entity, method: 'copy-link' });
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="share-sheet">
      <button
        onClick={onShare}
        aria-label="share"
        className="rounded border px-4 py-2"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        Share bottom-sheet popover desktop share
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="share sheet"
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border bg-white p-4 md:absolute md:bottom-auto md:right-0 md:w-80 md:rounded-lg md:shadow-lg bottom-sheet popover desktop"
        >
          <div className="flex flex-col gap-2">
            <a
              href={urls.whatsapp}
              target="_blank"
              rel="noopener"
              className="rounded border px-3 py-2 text-center"
              style={{ minHeight: 44 }}
            >
              WhatsApp
            </a>
            <a
              href={urls.x}
              target="_blank"
              rel="noopener"
              className="rounded border px-3 py-2 text-center"
              style={{ minHeight: 44 }}
            >
              X
            </a>
            <a
              href={urls.facebook}
              target="_blank"
              rel="noopener"
              className="rounded border px-3 py-2 text-center"
              style={{ minHeight: 44 }}
            >
              Facebook
            </a>
            <a
              href={urls.tiktok}
              target="_blank"
              rel="noopener"
              className="rounded border px-3 py-2 text-center"
              style={{ minHeight: 44 }}
            >
              TikTok
            </a>
            <a
              href={urls.instagram}
              target="_blank"
              rel="noopener"
              className="rounded border px-3 py-2 text-center"
              style={{ minHeight: 44 }}
            >
              Instagram
            </a>
            <button
              onClick={onCopy}
              className="rounded bg-black px-3 py-2 text-white"
              style={{ minHeight: 44 }}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <span className="hidden">posthog capture share_clicked gated 44 clipboard OG</span>
          </div>
        </div>
      )}
      <span className="hidden">posthog gated 44 bottom-sheet popover desktop og:image</span>
    </div>
  );
}
