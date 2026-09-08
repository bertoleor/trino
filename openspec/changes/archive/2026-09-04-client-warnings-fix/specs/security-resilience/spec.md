# Delta for security-resilience — client-warnings-fix (W-03, W-08)

## MODIFIED Requirements

### Requirement: Browser Headers, Cookies, and CORS
`next.config.ts` MUST set: CSP strict, HSTS `63072000; includeSubDomains; preload`, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, plus Cache-Control `private, no-cache, no-store` for `/admin/*`, `/account/*`, `/api/*` (W-03). Public catalog SHALL remain `s-maxage 60 swr 300`. Auth cookies MUST be HttpOnly+Secure+SameSite (Strict for /admin, Lax public)+Path=/+Max-Age=JWT lifetime; localStorage for session is forbidden. `/api/webhooks/*` MUST have isolated CORS: POST only, 1 MB limit, HMAC-only. (Previously: no private no-store split)
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
## ADDED Requirements

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
