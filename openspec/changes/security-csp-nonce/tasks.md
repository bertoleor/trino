# Tasks: security-csp-nonce

## Review Workload Forecast

| Est 400 | 400-risk Low | 800-risk Low | Chained Yes | 1 PR stacked-to-main |
|---------|--------------|--------------|-----------|---------------------|
Decision needed: No | Chained recommended: Yes | Chain strategy: stacked-to-main

## Work Units

| U | PR | Base | Lines | Scope |
|---|----|------|-------|-------|
| 1 | PR5 CSP | main dcb9a84 | ~300 | proxy nonce + 4 sites + next.config split |

## Content

- [ ] T-P2-01 `src/proxy.ts` — Generate `crypto.randomUUID()` per request, stamp `x-nonce` on request headers via `NextResponse.next({ request: { headers } }`) (never response headers), set CSP header containing nonce for HTML routes (override static). Preserve static CSP for /tienda /cultura. Test: t-csp-nonce-proxy.test.ts — nonce generated, header stamped, CSP contains nonce, public routes have static CSP. Accept: securityLogs pass, test asserts CSP pattern `nonce-<uuid4>`.

## Dependencies
- PR1 (tooling-ci-regeneration) archived — base is main 692f227 + PR2 (client-warnings-fix).

## Open Questions (from design AD-02 AD-03)
- How proxy-owned CSP replaces static next.config for HTML vs static path keeps CDN (see design AD-02)
- Static headers() in next.config still serves public CDN paths (AD-01 + AD-02)
