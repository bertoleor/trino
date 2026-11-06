# Incident Runbook — santisima-trinidad (TRINO)

This runbook is the on-call reference for diagnosing and recovering from
production incidents. It assumes the stack in `ARCHITECTURE.md` and
`docs/DEPLOY.md`: Next.js 16 on Vercel, Supabase Postgres (RLS), Upstash Redis,
and per-cron automation. Keep it current with `docs/DEPLOY.md` — they are two
halves of the same operating picture.

> Escalation owner: `@bertoleor` (see `SECURITY.md`, `CODEOWNERS`).

---

## 1. The panic rule (read first)

**Verify before you fix.** Get an alert, a failing log, or an API call that
errors — then act. Triggers and severity are below; never "fix" on assumption.
For anything affecting payments, auth, or data integrity, notify
`@bertoleor` immediately.

**Severity ladder**

| Sev | Definition | Example | First action |
|-----|-----------|---------|--------------|
| SEV-1 | Payments or auth down, data loss/leak | Checkout 5xx, RLS misconfig | Rollback + notify owner |
| SEV-2 | Core storefront degraded | 503s on `/health`, LCP > budget | Investigate + kill-switch |
| SEV-3 | Background job failing | Cron timeout, DLQ backlog | Replay / reschedule |
| SEV-4 | Non-blocking anomaly | Lighthouse warn, slow endpoint | Track, fix in working hours |

---

## 2. Signal sources (where to look)

- **Observability:** OTel + Sentry via `instrumentation.ts`. Traces/errors land
  in Sentry; correlation ids tie a request to its logs.
- **Health check:** `GET /health` returns 2s/1s/2s probes → 503 on failure.
- **Audit trail:** `audit_logs` table (INSERT-only RLS, 1-year retention) plus
  `security_logs`.
- **Webhook failures:** `failed_webhooks_log` DLQ — the single source of truth
  for undelivered MercadoPago/Resend webhooks.
- **Cron logs:** Vercel Functions logs for jobs in `vercel.json`; pg_cron logs
  for DB-side jobs.
- **External monitoring:** UptimeRobot 5-min HTTP check points at the storefront.

## 3. Cron & automation map (ground truth)

The scheduler is **split across three systems** — check the right one:

| Job | Trigger | Source | Schedule |
|-----|---------|--------|----------|
| Keepalive heartbeat | `POST /api/cron/keepalive` | Vercel cron (`vercel.json`) | daily 04:00 UTC |
| Cultura sync | `POST /api/cron/cultura-sync` | Vercel cron (`vercel.json`) | daily 06:00 UTC |
| FX rates | `POST /api/cron/fx` | Vercel cron (`vercel.json`) | daily 05:00 UTC |
| pg_cron heartbeat (DB) | `cron.schedule('keepalive-heartbeat', ...)` | pg_cron (`0010_keepalive.sql`) | every 6h |
| Abandoned cart | pg_cron → QStash → Resend | migration `0008_cron.sql` | every 1h |
| Bank cancel idempotent | pg_cron | migration `0008_cron.sql` | every 1h |
| GitHub keepalive fallback | `curl /api/cron/keepalive` | `.github/workflows/keepalive.yml` | daily 04:00 UTC |

> **Note:** the GitHub fallback authenticates with `${{ secrets.CRON_SECRET }}`
> (verified byte-exact against the workflow file). The reference is valid and
> the fallback works when `CRON_SECRET` is set and `SITE_URL` resolves.

All cron endpoints require `CRON_SECRET` bearer auth and must return 200
within 10 s (Vercel free tier).

## 4. Incident playbooks

### 4.1 Storefront down / health-check failing (SEV-2)

1. `GET /health` — which probe fails (2s/1s/2s)? Isolate DB vs Redis vs app.
2. Check Sentry for the correlating error and Vercel Functions logs.
3. Confirm Supabase is reachable (`SELECT 1`), and Upstash Redis responds.
4. If the deploy is the problem → roll back (see §5).
5. If a feature is the problem → flip its kill-switch (§6).

### 4.2 Checkout / payments failing (SEV-1)

1. **Immediately** notify `@bertoleor`.
2. Check `failed_webhooks_log` for undelivered MercadoPago webhooks.
3. Disable checkout via kill-switch `new_checkout_active = false` → health
   returns 200 → notify. Do this before deep diagnosis.
4. Verify RLS roles are intact (recent migrations are the usual culprit).
5. Replay undelivered webhooks through the DLQ idempotency path (§5).

### 4.3 Cron job not running (SEV-3)

1. Confirm which system owns it (§3) — Vercel, pg_cron, or GitHub fallback.
2. Vercel: check Functions logs for a timeout or 4xx (secret mismatch).
3. pg_cron: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;`
4. If the GitHub keepalive fallback is the path you were relying on, see the
   known defect in §3 — it is broken and must be fixed first.
5. Re-run manually via the endpoint with the correct `CRON_SECRET`.

### 4.4 Webhook / notification backlog (SEV-3)

1. Query `failed_webhooks_log` for age and count.
2. Replay idempotent entries (HMAC + idempotency keys guarantee exactly-once).
3. If ingestion is stuck, check Upstash Redis rate limits and the HMAC secret.

### 4.5 Data integrity / RLS suspect (SEV-1)

1. Notify `@bertoleor` and freeze writes where possible.
2. Check `audit_logs` for the INSERT-only trail around the incident window.
3. Compare migration state against `supabase/migrations/` (CI drift guard).
4. Restore from the last known-good point; expand/contract migrations mean no
   destructive revert.

## 5. Recovery toolbox

- **Rollback deploy:** `vercel rollback` (Dashboard or CLI) — <1 s to the
  previous deployment.
- **DB migrations:** expand/contract model — no destructive reverts; deploy the
  contract step rather than restoring backwards.
- **Webhook replay:** DLQ `failed_webhooks_log` idempotent replay.

## 6. Kill-switches & feature flags

Set via env (Zod fail-closed at boot, `src/config/env.ts`):

| Flag | Default | Purpose |
|------|---------|---------|
| `new_checkout_active` | on | Turn **off** to disable checkout (health stays 200) |
| Error boundary flag | off | 2-level boundary <1s; enable on degraded UI |
| `SHIPPING_INTERNATIONAL_ENABLED` | false | Falls back to flat-rate when off |
| `PAYMENTS_*` flags | false | Per-payment-method toggles |
| `EASTER_ENABLED` | true | Seasonal feature toggle |

Kill-switch trigger (from `DEPLOY.md`): 5% error rate over 2 min or p95 > 3 s.

## 7. Decision thresholds

- **Rollback:** when a deploy correlates with the error and reverting is
  reversible (<1s).
- **Kill-switch:** checkout errors > threshold (§6) — disable before deep dive.
- **Replay:** webhooks in DLQ when no duplication risk (idempotency on).
- **Post-mortem:** within 48 h for any SEV-1/SEV-2 — write it to
  `docs/reports/`.

## 8. Post-incident

1. Write a post-mortem (timeline, root cause, fix, prevention) within 48 h.
2. File it under `docs/reports/`.
4. Update this runbook and/or `docs/DEPLOY.md` if the incident exposed a gap.

---

*Status: authored 2026-09-14 as part of the docs audit (item C2). Not yet
battle-tested against a live incident — validate thresholds during the next
SEV-3 or lower.*