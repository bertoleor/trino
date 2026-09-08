# security-resilience Specification

## Purpose
Enforce CONSTITUTION security, cookie, rate-limit, and resilience guardrails cost-zero. Trace: SEC-01..08, COOKIE-01..03, RLIM-01/02, SLOG-01..03, HEALTH-01/02, RESILIENCIA-01, ENV-01..03, ARCH-05/06.

## Requirements

### Requirement: Browser Headers, Cookies, and CORS
`next.config.ts` MUST set: CSP strict, HSTS `63072000; includeSubDomains; preload`, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, plus Cache-Control `private, no-cache, no-store` for `/admin/*`, `/account/*`, `/api/*` (W-03). Public catalog SHALL remain `s-maxage 60 swr 300`. Auth cookies MUST be HttpOnly+Secure+SameSite (Strict for /admin, Lax public)+Path=/+Max-Age=JWT lifetime; localStorage for session is forbidden. `/api/webhooks/*` MUST have isolated CORS: POST only, 1 MB limit, HMAC-only.

#### Scenario: Header audit — private vs public cache split
- GIVEN GET `/admin/orders` vs GET `/tienda`
- WHEN response headers inspected
- THEN /admin has `private, no-cache, no-store`; /tienda has `s-maxage 60 swr 300`

#### Scenario: XSS token exfiltration attempt
- GIVEN attacker injects JS to read session
- WHEN JS runs
- THEN HttpOnly cookie is inaccessible

#### Scenario: Private route not cached by CDN
- GIVEN CDN edge receives `/api/me`
- WHEN Cache-Control evaluated
- THEN edge MUST NOT store; revalidation required

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

### Requirement: RLS Two-Role Integration Depth
RLS policies MUST be verified via supabase-local two-role integration (anon vs authenticated) (W-08), replacing mock simulation. All tables with `is_admin()` SHALL use `SECURITY DEFINER has_role()` helper; no `USING (true)` open policies. Tests MUST prove `A≠B` 403 isolation.

#### Scenario: RLS A≠B 403 isolation
- GIVEN user A owns cart X, user B requests X
- WHEN RLS evaluated under B session
- THEN 403/empty — B cannot read A data

#### Scenario: Anonymous cannot bypass RLS
- GIVEN anon calls `/api/admin/export`
- WHEN `has_role()` evaluated
- THEN 403 + security_logs

### Requirement: CSP Nonce Close-Out Verification
The system MUST prove `security-csp-nonce` T-P2-01 is live before archive: per-request `x-nonce` propagation, proxy-owned nonce CSP for HTML, static `script-src` conflict removal, and a green verify suite. Strict TS MUST hold with zero TODOs; no UI change so no new WCAG surface. Normative nonce behavior is defined in `openspec/changes/security-csp-nonce/specs/security-resilience/spec.md`; this requirement adds only the close-out verification gate (synced from `que-hay-pendiente-en-engram`, 2026-09-06).

#### Scenario: Nonce propagates at runtime
- GIVEN an HTML document request to a protected route
- WHEN `src/proxy.ts` processes the request
- THEN `x-nonce` is stamped on request headers, readable via `headers()`, and equals the `'nonce-…'` token in that response's CSP

#### Scenario: Static conflict removed
- GIVEN an HTML response with proxy-owned CSP
- WHEN headers are inspected
- THEN exactly one `Content-Security-Policy` exists, `script-src` contains `'self'` plus `'nonce-…'` only, and `unsafe-inline` and `strict-dynamic` are absent; `/tienda` and `/cultura` retain static cachable CSP

#### Scenario: Verify suite green before archive
- GIVEN the applied T-P2-01 slice
- WHEN `t-csp-nonce` tests, lint, and build run
- THEN all pass and the 4 inline `<script>` sites (producto/reviews/cultura JSON-LD, admin easter) render unblocked

### Requirement: Turnstile Fail-Closed Verification

`verifyTurnstile` in `src/proxy.ts` MUST deny on missing secret, missing token, verification `false`, and transport error; fail-open (`if (!secret) return true`) is forbidden. Each denial MUST append a `turnstile_403` entry via the hardened log path.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Missing secret denies

- GIVEN `TURNSTILE_SECRET_KEY` is unset and a POST hits `/api/contact`
- WHEN verification runs
- THEN the request is rejected 403 and a `turnstile_403` entry is logged

#### Scenario: Provider outage denies

- GIVEN the siteverify fetch throws or returns `{success:false}`
- WHEN a gated request arrives
- THEN the request is rejected 403 (never passed through)

### Requirement: Auth Rate-Limit Tier Enforcement

`proxy` MUST route `/login`, `/signup`, and `/api/auth/*` to an `auth` tier (5 attempts/15min/IP, 15min lockout) returning 429 with `Retry-After` plus `X-RateLimit-*`; the current `public`-only fallback for auth paths is forbidden.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Auth brute-force lockout

- GIVEN an IP fails login 5× within 15min
- WHEN the 6th attempt arrives
- THEN 429 with `Retry-After: 900` is returned and the attempt is logged

### Requirement: security_logs Insert Hardening

Edge code MUST NOT insert into `security_logs`/`audit_logs` via anon-key REST `fetch`; all inserts MUST use the authenticated Supabase server client (service-role context), preserving INSERT-only RLS with 1yr retention.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Anon-key REST path removed

- GIVEN a 403/429 audit path in `src/proxy.ts`
- WHEN the hardened code runs
- THEN no request carries the anon key and the row lands via the server client

### Requirement: CSP Coverage on Non-200 Responses

HTML non-200 responses carrying scripts MUST emit the nonce CSP; JSON error responses (400/403/429) are explicitly exempt — rationale: no script execution surface, `Content-Type: application/json` is never executed as script.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Non-200 HTML keeps CSP

- GIVEN an HTML error response with inline scripts
- WHEN headers are inspected
- THEN exactly one `Content-Security-Policy` with the request nonce is present

### Requirement: Env Validation Depth at Boot

`src/config/env.ts` MUST require `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`, and Upstash vars (or a declared memory-fallback flag) and fail fast at boot listing every missing var; lazy-only validation is forbidden.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Missing critical var blocks boot

- GIVEN `SUPABASE_SERVICE_ROLE` is absent and no fallback is declared
- WHEN the app boots
- THEN it throws listing all missing vars and refuses to start

### Requirement: Cron fail-open becomes fail-closed with documented dev fallback

The 3 cron guards (`keepalive`, `fx`, `cultura-sync`: `if (!secret) return true`) MUST deny with 401 when `CRON_SECRET` is unset in production. Local development MAY bypass via explicit flag `CRON_ALLOW_UNSET_SECRET=true`, honored ONLY when `NODE_ENV=development`; in any other environment an unset secret MUST 401. The flag name, dev-only behavior, and production denial MUST be documented where cron auth is configured.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Production denies without secret

- GIVEN `CRON_SECRET` unset and `NODE_ENV=production`
- WHEN `GET /api/cron/fx` arrives
- THEN 401 is returned regardless of `CRON_ALLOW_UNSET_SECRET`

#### Scenario: Documented local bypass

- GIVEN `NODE_ENV=development` and `CRON_ALLOW_UNSET_SECRET=true`
- WHEN `GET /api/cron/keepalive` arrives without credentials
- THEN the request proceeds and the bypass is documented, never silent

### Requirement: proxy.ts void remediation under slice-B ownership

`proxy.ts:45,87,136` void-baits MUST be removed or replaced with real handling (cookie-option constant used, audit comment resolved into code or deleted) in a review owned or approved by the slice-B owner — S3-after-B-merge or single combined review. The security diff MUST stay pure: no Prettier churn beyond touched lines, no behavior change beyond the fail-closed cron rule.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Sequenced review

- GIVEN slice-B still unmerged
- WHEN S3 edits `proxy.ts`
- THEN the S3 diff is rebased after B or combined in one owner-approved review, never a conflicting parallel edit

#### Scenario: Security diff purity

- GIVEN the merged S3 `proxy.ts` diff
- WHEN inspected
- THEN it contains only void remediation + cron-auth lines, with `tsc`/`eslint`/build green
