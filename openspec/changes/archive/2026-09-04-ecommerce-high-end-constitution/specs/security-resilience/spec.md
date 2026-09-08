# security-resilience Specification

## Purpose
Enforce CONSTITUTION security, cookie, rate-limit, and resilience guardrails cost-zero. Trace: SEC-01..08, COOKIE-01..03, RLIM-01/02, SLOG-01..03, HEALTH-01/02, RESILIENCIA-01, ENV-01..03, ARCH-05/06.

## Requirements

### Requirement: Browser Headers, Cookies, and CORS
`next.config.ts` MUST set: CSP strict, HSTS `63072000; includeSubDomains; preload`, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin (SEC-05). Auth cookies MUST be HttpOnly+Secure+SameSite (Strict for /admin, Lax public)+Path=/+Max-Age=JWT lifetime (COOKIE-02); prohibited localStorage for session (COOKIE-01). `/api/webhooks/*` MUST have isolated CORS: POST only, 1 MB limit, HMAC-only auth (CORS-WH-01).

#### Scenario: Header audit
- GIVEN production response
- WHEN inspected
- THEN all 5 headers present with exact values; CSP blocks inline unsafe

#### Scenario: XSS token exfiltration attempt
- GIVEN attacker injects JS to read session
- WHEN JS runs
- THEN HttpOnly cookie is inaccessible

### Requirement: Rate Limiting and Security Alerts
Upstash Redis MUST enforce tiers: auth 5/15min/IP lockout 15min, public 60/min/IP, authed 600/min/user, webhook 1 MB, admin bulk 10/h (RLIM-01); breach MUST return 429 with Retry-After + X-RateLimit-* (RLIM-02). Security events MUST append to `security_logs` (INSERT-only RLS, retained 1yr) and trigger alerts: 5 fails/10min IP block, new country login email, role grant to super_admin, bulk export >1k (SLOG-02).

#### Scenario: Brute force lockout
- GIVEN IP fails login 5× in 10min
- WHEN 6th attempt
- THEN 429 with Retry-After: 900 and security_logs entry

### Requirement: Resilience, Secrets, and Env Validation
All critical external calls MUST use AbortController 8s timeout; circuit opens after 3 fails/60s, half-open probe after 30s, graceful degradation to `pending_retry` without 500 (RESILIENCIA-01). Secrets MUST load only via `src/config/env.ts` Zod fail-closed at boot listing missing vars (ENV-01) with PUBLIC/SERVER/CRITICAL classification (ENV-02). Critical dep versions MUST be pinned exact (SEC-08). Deployment skew on Server Action MUST catch and `router.refresh()` with empathetic message (ARCH-06).

#### Scenario: Payment API down
- GIVEN MercadoPago timeout 8s
- WHEN checkout calls preference
- THEN UI shows "Reintentaremos" (locale), order saved `pending_retry`, no blank 500

#### Scenario: Missing env at boot
- GIVEN `MERCADOPAGO_ACCESS_TOKEN` absent
- WHEN app boots
- THEN it throws listing missing vars and refuses to start
