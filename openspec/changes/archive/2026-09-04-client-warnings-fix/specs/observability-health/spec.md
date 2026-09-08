# Delta for observability-health — client-warnings-fix (W-02, W-04)

## MODIFIED Requirements

### Requirement: Structured Logger and Alert Thresholds
All errors MUST route via centralized structured logger (OTel+Sentry) `instrumentation.ts` with fields `userId, organizationId, requestId, route, severity, timestamp UTC, stack, environment` (OBS-01). RBAC denials (W-02) MUST append to `security_logs` + `audit_logs` before/after JSONB and trigger alert when 5 fails/10min. Customer 360 LTV join (W-04) MUST emit `route:/admin/customers/[id] duration` metric; alert if p95>1s. Build MUST be zero warnings. (Previously: no RBAC audit log linkage, no 360 latency metric)

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
