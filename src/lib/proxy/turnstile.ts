export type SecurityAuditEvent = 'turnstile_403' | 'rate_limit_429' | 'rbac_403';

export const AUDIT_INGEST_PATH = '/api/internal/audit';

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function enqueueSecurityAudit(
  event: SecurityAuditEvent,
  detail: { ip: string; path: string },
  origin?: string
): void {
  const ingestSecret = process.env.AUDIT_INGEST_SECRET;
  if (!ingestSecret) return;
  const target = origin ? `${origin}${AUDIT_INGEST_PATH}` : AUDIT_INGEST_PATH;
  try {
    fetch(target, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ingestSecret}`,
      },
      body: JSON.stringify({ event, ip: detail.ip, path: detail.path }),
    }).catch(() => {});
  } catch {
    // Denial stands regardless; audit is best-effort by design.
  }
}
