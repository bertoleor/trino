---
name: trino-security
description: >
  trino. security and resilience guardrails: headers/cookies/CORS, rate limiting, RLS two-role
  integration, CSP nonce, Turnstile, env fail-closed validation, cron auth. Trigger: When touching
  proxy.ts, next.config headers, auth cookies, rate limits, RLS policies, CSP nonce, Turnstile, or
  boot env validation.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Security & Resilience

Trace: SEC-01..08, COOKIE-01..03, RLIM-01/02, SLOG-01..03, HEALTH-01/02, RESILIENCIA-01, ENV-01..03,
ARCH-05/06.

## Headers, Cookies, CORS (W-03 / COOKIE)

`next.config.ts` headers MUST include (already set — preserve):

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: private, no-cache, no-store` for `/admin/*`, `/account/*`, `/api/*`,
  `/api/auth/*`, `/api/webhooks/*`, `/api/cart/*`, `/api/checkout/*`, `/api/orders/*`, `/api/me/*`.
- **Public catalog stays** `public, s-maxage=60, stale-while-revalidate=300` (e.g. `/tienda`,
  `/cultura`, `/api/catalog/*`).

Auth cookies MUST be `HttpOnly`+`Secure`+`SameSite` (**Strict for /admin**, Lax public) + `Path=/` +
`Max-Age=JWT lifetime`. **Session in localStorage is forbidden** — HttpOnly cookie is the only
session store.

`/api/webhooks/*` have isolated CORS: **POST only, 1 MB limit, HMAC-only** auth.

## Rate Limiting (RLIM-01/02) — Upstash Redis tiers

| Tier                                      | Limit                          |
| ----------------------------------------- | ------------------------------ |
| auth (`/login`, `/signup`, `/api/auth/*`) | 5/15min per IP + 15min lockout |
| public                                    | 60/min per IP                  |
| authed                                    | 600/min per user               |
| webhook                                   | 1 MB payload                   |
| admin bulk (`/api/admin/export`)          | 10/h                           |

Breach returns **429 with `Retry-After` + `X-RateLimit-*`** headers. Security events append to
`security_logs` (INSERT-only RLS, 1yr retention).

Alert triggers: 5 fails/10min per-IP block, new-country login email, role grant to `super_admin`,
bulk export >1k.

## Auth Rate-Limit (fail-closed)

`proxy` MUST route `/login`, `/signup`, `/api/auth/*` to the `auth` tier. The `public`-only fallback
for auth paths is **forbidden**. Scenario: 5 failed logins in 15min → 6th attempt →
`429 Retry-After: 900`.

## Resilience (RESILIENCIA-01)

- Critical external calls: `AbortController` **8s** timeout.
- Circuit opens after **3 fails/60s**, half-open probe after **30s**, degrade to `pending_retry` —
  never a blank 500.
- Payment API down → UI shows "Reintentaremos" (locale), order saved `pending_retry`.

## RLS Two-Role Integration (W-08)

- RLS verified via **supabase-local two-role integration (anon vs authenticated)** — never mock
  simulation.
- Tables using `is_admin()` SHALL use `SECURITY DEFINER has_role()` helper.
- **No `USING (true)` open policies.**
- Must prove `A≠B` 403 isolation: user B requesting A's row → 403/empty.

```sql
-- Correct RBAC shape (not `IN SELECT`)
CREATE OR REPLACE FUNCTION public.has_role(target text)
RETURNS boolean SECURITY DEFINER ...;
```

## CSP Nonce Close-Out (T-P2-01)

- Per-request `x-nonce` propagation: `src/proxy.ts` stamps `x-nonce` on request headers, readable
  via `headers()`, equal to the `'nonce-…'` token in that response CSP.
- Proxy-owned nonce CSP for HTML; static `script-src` conflict removed.
- Exactly **one** `Content-Security-Policy`; `script-src` = `'self'` + `'nonce-…'` only; **no
  `unsafe-inline`, no `strict-dynamic`**.
- `/tienda` and `/cultura` retain static cachable CSP.
- The 4 inline `<script>` sites (producto/reviews/cultura JSON-LD, admin easter) render unblocked.

## Turnstile Fail-Closed

`verifyTurnstile` in `src/proxy.ts` MUST **deny** on: missing secret, missing token, verification
`false`, transport error. **Fail-open (`if (!secret) return true`) is forbidden.** Each denial
appends a `turnstile_403` entry via the hardened log path.

## Env Fail-Closed at Boot (ENV-01/02)

`src/config/env.ts` MUST require `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`, and Upstash vars
(or declared `ALLOW_MEMORY_RATE_LIMIT=true` fallback) — **fail fast at boot listing every missing
var**. Lazy-only validation is forbidden. Secrets classified PUBLIC/SERVER/CRITICAL. Critical deps
pinned exact (SEC-08).

## security_logs Insert Hardening

Edge code MUST NOT insert into `security_logs`/`audit_logs` via anon-key REST `fetch`. All inserts
use the authenticated Supabase **server client (service-role context)**, preserving INSERT-only
RLS + 1yr retention.

## CSP on Non-200

HTML non-200 responses carrying scripts MUST emit the nonce CSP. JSON error responses (400/403/429)
are **exempt** (no script surface).

## Cron Auth (fail-closed with documented dev bypass)

- The 3 cron guards (`keepalive`, `fx`, `cultura-sync`) MUST `401` when `CRON_SECRET` unset in
  production. **Do NOT `if (!secret) return true`.**
- Local dev MAY bypass via `CRON_ALLOW_UNSET_SECRET=true`, honored ONLY when `NODE_ENV=development`.
- Any other environment with unset secret → 401.

## Traps

- **Never log bodies, tokens, secrets, headers, or PII** — only `route` + `error: String(error)`
  (see `trino-admin-backoffice`/observability log contract).
- **No `void "string"` dead code in proxy.ts** (`void "security_logs…"`, `void (isAdminCookie…)`).
  Remove or handle; keep the security diff pure.
- Deployment skew on Server Action → catch and `router.refresh()` with empathetic message (ARCH-06).
- Security diff purity: no Prettier churn beyond touched lines, no behavior change beyond the
  declared fail-closed rule.
