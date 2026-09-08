# observability-health Specification

## Purpose
Structured observability with actionable alerts and health probes. Trace: OBS-01/02, HEALTH-01/02, ERR-01/02, TEST-01, TDOC.

## Requirements

### Requirement: Structured Logger and Alert Thresholds
All errors MUST route via centralized structured logger (OTel+Sentry) `instrumentation.ts` with fields `userId, organizationId, requestId, route, severity, timestamp UTC, stack, environment` (OBS-01). RBAC denials (W-02) MUST append to `security_logs` + `audit_logs` before/after JSONB and trigger alert when 5 fails/10min. Customer 360 LTV join (W-04) MUST emit `route:/admin/customers/[id] duration` metric; alert if p95>1s. Build MUST be zero warnings.

#### Scenario: DLQ alert
- GIVEN webhook handler fails and writes `failed_webhooks_log`
- WHEN insert occurs
- THEN logger emits severity:error; health dashboard DLQ counter increments <1min

#### Scenario: RBAC denial audit log
- GIVEN editor blocked on delete
- WHEN 403 returned
- THEN `security_logs` + `audit_logs {before:null,after:{denied:true}}` inserted and logger alerts

#### Scenario: 360 LTV latency alert
- GIVEN Customer 360 query p95 1.4s
- WHEN metric recorded
- THEN alert fires `p95>1s` on `/admin/customers/[id]`

#### Scenario: Warning gate
- GIVEN PR introduces ESLint warning
- WHEN CI runs `pnpm build && pnpm lint`
- THEN pipeline fails

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

### Requirement: Converted-catch logging contract
Every converted catch MUST call `src/lib/logger.ts` with: level `error` for request-path failures (cron, api routes, proxy helpers), `warn` for expected fallbacks (fx last-rate fallback, clipboard/share); fields `route` (always) + `error: String(error)`; `requestId`/`userId` when available. Bodies, tokens, secrets, and headers MUST NEVER be logged. Errors already routed via ErrorBoundary/global-error MUST NOT double-log at the catch site.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Cron failure logged without secrets
- GIVEN `fx` fetch throws with `CRON_SECRET` set
- WHEN the catch runs
- THEN `logger.error` emits route + error string, response is 200-fallback, no secret in the entry

#### Scenario: PII stays out of logs
- GIVEN a catch holding a request body with email
- WHEN logged
- THEN the entry contains route + error string only, no body fields

### Requirement: Segment error/loading coverage for touched routes
Every route this change touches MUST have a rendering contract on failure/loading: existing root `error.tsx`/`global-error.tsx` keep global coverage; touched segments missing scoped `error.tsx` (admin, `[locale]`) or `loading.tsx` MUST gain one reusing the shared ErrorBoundary + logger pattern and Bauhaus skeleton style. Untouched routes are out of scope.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Touched admin segment crashes gracefully
- GIVEN a touched `/admin/*` page throws during render
- WHEN the segment boundary captures
- THEN an inline fallback with retry renders, a logger entry is created, no white screen

#### Scenario: Touched route shows loading state
- GIVEN a touched route awaiting data
- WHEN navigation occurs
- THEN its `loading.tsx` skeleton renders until content resolves
