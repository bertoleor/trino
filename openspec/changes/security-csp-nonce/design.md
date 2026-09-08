# Design: security-csp-nonce

## Philosophy (from proposal)
Option A: CDN cache preserved (static split), Edge nonce via proxy.ts request headers, no strict-dynamic, zero unsafe-inline, 4 inline sites, stop boundary at 0 Warnings.

## AD: CSP Nonce via Next.js 16 Proxy (Edge)

| # | Decision | Rejected Alternatives | Why |
|---|----------|----------------------|-----|
| AD-01 | `proxy.ts` generates `crypto.randomUUID()` per request, stamps `x-nonce` on **request headers** (never response) | Static CSP-only / hash-less / inline-block-all | Recipe prevents client-side CSP leak (headers sent to browser don't carry nonce; server components read it via `headers()` API) |
| AD-02 | The proxy-owned CSP **overrides** the base static `next.config.ts` for HTML responses | Remove static CSP entirely / combine both (double-CSP) | Explicit conflict resolution: proxy outputs nonce'd CSP for HTML; static serves the public CDN path |
| AD-03 | `x-nonce` read via `next/headers` in server components → {NonceProvider} | Manual prop drilling | Keeps 44px / inline JSON-LD working without client-side request handling |

## File Changes (≤150 lines each)

| File | Action | Lines |
|------|--------|-------|
| `src/proxy.ts` | Modify | Add nonce generation + injection to `middleware()` + set x-nonce request header + set nonce CSP for HTML routes only; preserve static CSP pass-through for static `/tienda`/`/cultura` | ≤120 |
| `src/app/layout.tsx` | Modify | Serve `x-nonce` from `headers()` and pass to `NonceProvider` (if context needed) | ≤40 |
| `src/app/[locale]/producto/[slug]/page.tsx` | Modify | Pass nonce to JSON-LD via `<script nonce={nonce} type="application/ld+json">` | ≤60 |
| `src/app/[locale]/cultura/[slug]/page.tsx` | Modify | Same JSON-LD nonce injection | ≤60 |
| `src/lib/seo/json-ld.ts` | Modify | Accept `nonce?: string` and return safe Head ({ nonce }) | ≤50 |
| `next.config.ts` | Modify | Remove/rename static CSP header to `X-CSP-Placeholder` or keep `static-csp` header group separate; add `X-Nonce-Enabled` middleware config | ≤40 |

## Test Plan (RED → GREEN)

| Test | Type | Target |
|------|------|--------|
| `t-csp-nonce-proxy.test.ts` | Unit | proxy generates randomUUID, stamps x-nonce request header, CSP header includes nonce for HTML routes, static path has static CSP |
| `t-csp-nonce-layout.test.ts` | Unit | layout.tsx injects nonce from headers() into 4 scripts | 
| `t-csp-drift-guard.test.ts` | Unit | Lint asserts no `unsafe-inline` in script-src, nonce object always present for dynamic routes |

**Acceptance**: `pnpm lint 0`, `pnpm test 376+`, `pnpm build 75+ pages`, CSP header contains nonce for HTML pages, JSON-LD scripts execute without CSP console violation, `unsafe-inline` absent.
