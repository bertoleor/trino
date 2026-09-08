# Delta for security-resilience

Normative nonce behavior is defined in `openspec/changes/security-csp-nonce/specs/security-resilience/spec.md` (MODIFIED Browser Headers + ADDED Nonce Sanity Guarantees). This delta adds ONLY the close-out verification gate — no behavior change, no duplication.

## ADDED Requirements

### Requirement: CSP Nonce Close-Out Verification

The system MUST prove `security-csp-nonce` T-P2-01 is live before archive: per-request `x-nonce` propagation, proxy-owned nonce CSP for HTML, static `script-src` conflict removal, and a green verify suite. Strict TS MUST hold with zero TODOs; no UI change so no new WCAG surface.

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
