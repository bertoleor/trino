# Delta for security-resilience

## MODIFIED Requirements

### Requirement: Browser Headers, Cookies, and CORS
`next.config.ts` MUST set: CSP strict, HSTS `63072000; includeSubDomains; preload`, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, plus Cache-Control `private, no-cache, no-store` for `/admin/*`, `/account/*`, `/api/*` (W-03). Public catalog SHALL remain `s-maxage 60 swr 300`. Auth cookies MUST be HttpOnly+Secure+SameSite (Strict for /admin, Lax public)+Path=/+Max-Age=JWT lifetime; localStorage for session is forbidden. `/api/webhooks/*` MUST have isolated CORS: POST only, 1 MB limit, HMAC-only.

`src/proxy.ts` MUST generate a per-request nonce (`crypto.randomUUID()`) and MUST stamp it on the **request** header `x-nonce` via `NextResponse.next({ request: { headers } })`; it MUST NOT set `x-nonce` as a response header (client-leak prevention). For HTML document responses, `src/proxy.ts` SHALL own the `Content-Security-Policy` and SHALL inject `script-src 'self' 'nonce-…'`; `strict-dynamic` is prohibited and `unsafe-inline` MUST NOT appear in any `script-src`. The static CSP in `next.config.ts` MUST NOT emit a conflicting `script-src` for HTML (no double-CSP). Server components MUST read `x-nonce` via `headers()` and apply `nonce={nonce}` to the 4 inline `<script>` sites (producto JSON-LD, reviews JSON-LD, cultura JSON-LD, admin easter). Public cached routes `/tienda` and `/cultura` SHALL retain static CSP with NO nonce, preserving CDN `s-maxage` caching.

(Previously: CSP `script-src` was strict-static `'self'` only, emitted for `/(.*)` — no per-request nonce, no proxy ownership, the 4 inline scripts were silently blocked.)

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

#### Scenario: Public CDN route stays cachable with structured data present
- GIVEN a request for a public cultura route whose page holds inline JSON-LD
- WHEN the HTML response is produced
- THEN the response SHALL carry a single authoritative `Content-Security-Policy` with `script-src 'self' 'nonce-…'` and MUST remain CDN-cached as the catalog routes (`s-maxage`), and the structured-data `<script>` renders (not blocked)

#### Scenario: Private route admin receives nonce-stamped header
- GIVEN an authenticated request to `/admin/easter`
- WHEN the proxy processes the request
- THEN `x-nonce` is stamped on the **request** headers (readable via `headers()`), and the easter inline `<script>` renders with its `nonce` attribute

#### Scenario: Script with matching nonce executes
- GIVEN a rendered inline `<script>` carrying `nonce={nonce}` where nonce equals the response CSP `'nonce-…'`
- WHEN the browser evaluates the CSP
- THEN the inline script executes

#### Scenario: Script without nonce is blocked
- GIVEN an inline `<script>` with no `nonce` attribute (or a mismatched nonce)
- WHEN the browser enforces `script-src 'self' 'nonce-…'`
- THEN the script is blocked and does NOT execute

## ADDED Requirements

### Requirement: Nonce Sanity Guarantees
The nonce MUST be unique per request (no reuse). The value stamped in `x-nonce` MUST equal the `'nonce-…'` value injected into that request's CSP; a mismatch SHALL be treated as a bug. `x-nonce` MUST never appear in response headers.

#### Scenario: Unique nonce per request
- GIVEN two distinct requests to the same protected route
- WHEN the proxy generates nonces
- THEN the two nonces differ

#### Scenario: Header nonce equals body nonce
- GIVEN one request to a protected route
- WHEN the CSP and inline `<script>` nonce are compared
- THEN `x-nonce` value (base64) matches the `'nonce-...'` token embedded in the CSP

#### Scenario: Nonce header never leaked to client
- GIVEN a response built for a protected route
- WHEN response headers are inspected
- THEN `x-nonce` is absent from response headers (only the `Content-Security-Policy` carries the nonce)