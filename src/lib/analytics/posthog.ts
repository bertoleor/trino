// T-D09c PostHog 1M/mo gated consent fail-closed
type Consent = { analytics: boolean };
const KEY = 'consent';
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const j = JSON.parse(raw) as Consent & { marketing?: boolean };
    return Boolean(j.analytics);
  } catch {
    return false;
  }
}
export function initPostHog(): boolean {
  if (!hasAnalyticsConsent()) return false;
  return true;
}
export function capture(event: string, props?: Record<string, unknown>): boolean {
  if (!hasAnalyticsConsent()) return false;
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { posthog?: { capture: (e: string, p?: unknown) => void } }).posthog
  ) {
    (
      window as unknown as { posthog: { capture: (e: string, p?: unknown) => void } }
    ).posthog.capture(event, props);
  }
  return true;
}
export const POSTHOG_LIMIT = '1M/mo';
