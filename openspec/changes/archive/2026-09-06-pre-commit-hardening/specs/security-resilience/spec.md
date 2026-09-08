# Delta for security-resilience

## ADDED Requirements

### Requirement: Turnstile Fail-Closed Verification

`verifyTurnstile` in `src/proxy.ts` MUST deny on missing secret, missing token, verification `false`, and transport error; fail-open (`if (!secret) return true`) is forbidden. Each denial MUST append a `turnstile_403` entry via the hardened log path.

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

#### Scenario: Auth brute-force lockout

- GIVEN an IP fails login 5× within 15min
- WHEN the 6th attempt arrives
- THEN 429 with `Retry-After: 900` is returned and the attempt is logged

### Requirement: security_logs Insert Hardening

Edge code MUST NOT insert into `security_logs`/`audit_logs` via anon-key REST `fetch`; all inserts MUST use the authenticated Supabase server client (service-role context), preserving INSERT-only RLS with 1yr retention.

#### Scenario: Anon-key REST path removed

- GIVEN a 403/429 audit path in `src/proxy.ts`
- WHEN the hardened code runs
- THEN no request carries the anon key and the row lands via the server client

### Requirement: CSP Coverage on Non-200 Responses

HTML non-200 responses carrying scripts MUST emit the nonce CSP; JSON error responses (400/403/429) are explicitly exempt — rationale: no script execution surface, `Content-Type: application/json` is never executed as script.

#### Scenario: Non-200 HTML keeps CSP

- GIVEN an HTML error response with inline scripts
- WHEN headers are inspected
- THEN exactly one `Content-Security-Policy` with the request nonce is present

### Requirement: Env Validation Depth at Boot

`src/config/env.ts` MUST require `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`, and Upstash vars (or a declared memory-fallback flag) and fail fast at boot listing every missing var; lazy-only validation is forbidden.

#### Scenario: Missing critical var blocks boot

- GIVEN `SUPABASE_SERVICE_ROLE` is absent and no fallback is declared
- WHEN the app boots
- THEN it throws listing all missing vars and refuses to start
