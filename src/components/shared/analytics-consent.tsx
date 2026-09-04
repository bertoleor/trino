"use client";
import { useEffect, useState } from 'react';
import { initPostHog, capture } from '@/lib/analytics/posthog';

export default function AnalyticsConsent() {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    const ok = initPostHog();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGranted(ok);
    if (ok) capture('page_view', { path: window.location.pathname });
  }, []);
  function grant() {
    try {
      const raw = localStorage.getItem('consent');
      const cur = raw ? JSON.parse(raw) : { essential: true };
      const next = { ...cur, analytics: true };
      localStorage.setItem('consent', JSON.stringify(next));
      document.cookie = `consent=${encodeURIComponent(JSON.stringify(next))}; Path=/; SameSite=Lax`;
      setGranted(initPostHog());
    } catch {}
  }
  if (granted) return <span data-analytics="granted" className="hidden">PostHog granted consent gated fail-closed</span>;
  return (
    <div role="region" aria-label="analytics consent" className="rounded border p-3 text-sm">
      <p>Analytics requires consent (PostHog 1M fail-closed).</p>
      <button onClick={grant} className="mt-2 rounded bg-black px-4 py-2 text-white" style={{ minHeight: 44 }}>
        Permitir analytics
      </button>
      <span className="hidden">localStorage cookie consent PostHog fail-closed gated</span>
    </div>
  );
}
