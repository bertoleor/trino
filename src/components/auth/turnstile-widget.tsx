'use client';

import { useCallback, useEffect, useRef } from 'react';

// A-01: Cloudflare Turnstile widget (explicit rendering) for the auth forms.
// Server-side verification lives in src/app/auth/actions.ts (fail-closed);
// this component only produces the cf-turnstile-response token the server
// then validates via siteverify. CSP origins allowed in src/lib/security/csp.ts.

const SCRIPT_ID = 'cf-turnstile-script';
// A-01 review round 1 (F1): the loader promise resolves via the named
// global below, so the src MUST declare &onload=onA01TurnstileLoad — the
// official Cloudflare mechanism ("Using onload callback"). api.js never
// calls an undeclared global; without the param the first mount hangs
// forever and login/signup are bricked.
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onA01TurnstileLoad';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onA01TurnstileLoad?: () => void;
  }
}

// Single-flight: one in-flight/loaded script shared by every mount. The old
// per-call waiter overwrite broke remounts (React key-bump after a failed
// attempt) — the second mount replaced the first mount's callback before
// api.js ever fired it. A module-level promise can't lose a waiter.
let turnstileLoader: Promise<TurnstileApi> | null = null;

/** Loads the official api.js once (idempotent) and resolves when turnstile is ready. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;
  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const prev = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    // api.js invokes this global when &onload= points at it (see SCRIPT_SRC).
    window.onA01TurnstileLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('turnstile missing after onload'));
    };
    if (prev) return; // script already injected (maybe by a previous mount) — wait for the global
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      turnstileLoader = null; // allow a later mount to retry the fetch
      reject(new Error('turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });
  return turnstileLoader;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Latest-ref pattern: callbacks may change identity every render; the
  // turnstile widget closes over these refs, so keep them fresh in effects
  // (never during render — react-hooks/refs rule).
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    let disposed = false;
    loadTurnstile()
      .then(() => {
        if (disposed || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
          callback: (token: string) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current?.(),
          'error-callback': () => onErrorRef.current?.(),
        });
      })
      .catch(() => onErrorRef.current?.());
    return () => {
      disposed = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, []);

  return (
    <div className="a01-turnstile-container">
      <div ref={containerRef} data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''} />
      <button type="button" onClick={reset} className="mt-2 text-xs text-zinc-500 underline">
        Refrescar captcha
      </button>
    </div>
  );
}
