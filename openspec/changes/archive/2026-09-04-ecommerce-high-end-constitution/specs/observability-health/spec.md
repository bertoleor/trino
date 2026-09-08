# observability-health Specification

## Purpose
Structured observability with actionable alerts and health probes. Trace: OBS-01/02, HEALTH-01/02, ERR-01/02, TEST-01, TDOC.

## Requirements

### Requirement: Structured Logger and Alert Thresholds
All errors MUST route through centralized structured logger (OTel+Sentry) configured in `instrumentation.ts` with fields: userId, organizationId, requestId, route, severity, timestamp UTC, stack, environment (OBS-01). Alerts MUST trigger on: error rate >1% per 5min, p95 >2s on critical routes, any DLQ insertion (OBS-01). SecurityLogs retained 1yr (SLOG-03). Build MUST be zero warnings/errors (CQ-08) — CI blocks on warn.

#### Scenario: DLQ alert
- GIVEN webhook handler fails and writes `failed_webhooks_log`
- WHEN insert occurs
- THEN structured logger emits `severity:error` and admin health dashboard increments DLQ counter within 1min

#### Scenario: Warning gate
- GIVEN PR introduces ESLint warning
- WHEN CI runs `pnpm build && pnpm lint`
- THEN pipeline fails; merge blocked

### Requirement: Health Endpoints and Boundaries
`GET /api/health` (public) MUST verify DB `SELECT 1` (2s), Redis PING (1s), Storage bucket (2s) and return 200 `{status:"ok", checks:{db,redis,storage}}` or 503 identifying failed check (HEALTH-01). Additional `GET /api/health/live` (liveness) and `GET /api/health/ready` (readiness, DB+ migrations) MUST exist (HEALTH-02). ErrorBoundary MUST wrap root layout + every critical route (`/checkout`, `/admin/*`) + data-fetching components with global (full page reload) and local (inline fallback) levels, each reporting to logger (ERR-01). Realtime subscriptions MUST clean up on unmount (ERR-02). Coverage thresholds: 90% per critical file/flow, 80% global; every suite MUST include sad paths (timeout, 500, expired session, empty state) (TEST-01/02).

#### Scenario: Degraded DB
- GIVEN DB unreachable
- WHEN `GET /api/health` called
- THEN 503 `{status:"degraded", checks:{db:"fail"}}`

#### Scenario: Critical route crash
- GIVEN /checkout throws render error
- WHEN ErrorBoundary captures
- THEN fallback shows empathetic message + retry button; logger entry created; page does not white-screen
