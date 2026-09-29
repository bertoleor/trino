'use client';
import { useEffect, useState } from 'react';

type Consent = { essential: boolean; analytics: boolean; marketing: boolean };

const KEY = 'consent';

function load(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Consent) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const c = load();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- S1 triage: mount-only consent hydration from localStorage; a lazy useState initializer would run during SSR prerender (no localStorage) and cause a hydration mismatch; ticket: warnings-smells-cleanup/S1
    if (!c) setOpen(true);
    else setConsent(c);
  }, []);

  function save(next: Consent) {
    localStorage.setItem(KEY, JSON.stringify(next));
    document.cookie = `consent=${encodeURIComponent(JSON.stringify(next))}; Path=/; SameSite=Lax`;
    if (!next.analytics && !next.marketing) {
      localStorage.removeItem('posthog_consent');
    }
    setConsent(next);
    setOpen(false);
    if (next.marketing) {
      fetch('/api/consent', { method: 'POST', body: JSON.stringify(next) }).catch(() => {});
    }
  }

  function blockResend(): boolean {
    return !consent.marketing;
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="cookie consent"
      className="fixed right-0 bottom-0 left-0 z-50 border-t bg-white p-4"
    >
      <div className="mx-auto max-w-3xl space-y-3">
        <p className="text-sm">
          Usamos cookies esenciales, de analitica y marketing. Gestiona tu consentimiento granular.
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled /> essential (requerido)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
            />{' '}
            analytics
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
            />{' '}
            marketing (Resend)
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => save({ essential: true, analytics: false, marketing: false })}
            className="rounded border px-4 py-2 text-sm"
          >
            Solo esenciales
          </button>
          <button
            onClick={() => save(consent)}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Guardar granular
          </button>
          <button
            onClick={() => save({ essential: true, analytics: true, marketing: true })}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Aceptar todo
          </button>
        </div>
        <span className="hidden">{String(blockResend())}</span>
      </div>
    </div>
  );
}
