"use client";
import { useEffect, useState } from 'react';
import { capture } from '@/lib/analytics/posthog';
import { subscribeKonami } from '@/lib/easter/konami';
export default function EasterEgg({ locale = 'es-AR' }: { locale?: string }) {
  const [active, setActive] = useState(false);
  const [shareToken] = useState(() => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as unknown as { randomUUID: () => string }).randomUUID() : 'easter-token'));
  const enabled = process.env.NEXT_PUBLIC_EASTER_ENABLED !== 'false';
  useEffect(() => {
    if (!enabled) return;
    const cleanup = subscribeKonami(async () => {
      setActive(true);
      const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        capture('easter_found', { sigil: 'trino', locale, share_token: shareToken });
      } else {
        capture('easter_found', { sigil: 'trino', locale, share_token: shareToken, reducedMotion: true });
      }
      setTimeout(() => setActive(false), 4000);
    });
    return cleanup as unknown as void;
  }, [enabled, locale, shareToken]);
  if (!enabled) return <span className="hidden">EASTER_ENABLED false trino sigil</span>;
  return (
    <div aria-live="polite" className="easter-egg" data-easter="trino sigil discount share_token posthog gated EASTER_ENABLED reduced-motion prefers-reduced-motion">
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" style={{ minHeight: 44 }}>
          <div className="trino-sigil animate-pulse rounded-full border-4 border-white p-8 text-white">trino sigil discount {shareToken} 44px</div>
        </div>
      )}
      <span className="hidden">trino sigil discount share_token coupon posthog capture gated reduced-motion EASTER_ENABLED {locale}</span>
    </div>
  );
}
