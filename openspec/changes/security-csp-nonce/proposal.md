# Proposal: Per-Request CSP Nonce (Option A)

## Intent

Restore 4 legitimate inline scripts (SEO JSON-LD + admin easter) blocked by static `script-src 'self'` (PR10 C-05) without regressing to `unsafe-inline`. Objective: SEO structured-data visibility + zero `unsafe-inline`.

## Scope

### In Scope
- Per-request nonce (`crypto.randomUUID()`) in `src/proxy.ts`, stamped on **request** header `x-nonce` (never response header — leaks to client).
- Proxy injects `script-src 'self' 'nonce-…'` into CSP for HTML routes; reconcile with static `next.config.ts` CSP (no double-CSP).
- Server components read `x-nonce` via `headers()`; 4 inline sites get `nonce={nonce}` / `<script nonce={nonce}>`.
- Preserve CDN cache: public routes (`/tienda`, `/cultura`) keep static CSP (no nonce).

### Out of Scope
- `strict-dynamic` (explicitly rejected — nonce-only).
- Third-party scripts (none present; PostHog deferred).
- DB/RLS/shipping/touch changes.
- Any `unsafe-inline` (prohibited always).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `security-resilience`: "Browser Headers, Cookies, and CORS" — CSP `script-src 'self'` gains per-request nonce for the 4 inline sites; static header must not conflict (double-CSP).

## Approach

Next.js 16 proxy pattern: `proxy()` generates nonce, sets `x-nonce` via `NextResponse.next({ request: { headers } })`, injects `'nonce-…'` into `script-src`. Server components (`layout.tsx`, 4 pages) read `headers().get('x-nonce')` and apply `nonce` to inline `<script>`. Public routes split on static CSP; nonce only on the 4 inline sites.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/proxy.ts` | Modified | Generate nonce; set `x-nonce` request header; inject nonce into CSP |
| `next.config.ts` | Modified | Reconcile static `script-src 'self'` with dynamic nonce (split public/HTML) |
| `src/app/layout.tsx` | Modified | Read `x-nonce`, propagate to inline scripts |
| `producto/[slug]/page.tsx:61` | Modified | JSON-LD `nonce` |
| `producto/[slug]/reviews/page.tsx:42` | Modified | Reviews JSON-LD `nonce` |
| `cultura/[slug]/page.tsx:54` | Modified | Blog JSON-LD `nonce` |
| `admin/easter/page.tsx:19` | Modified | `nonce={nonce}` easter script |
| `tests/unit/t-prx-nonce.spec.ts` | New | Nonce uniqueness; header===body; CSP strict preserved |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Double-CSP: static + dynamic break nonce | Med | Proxy owns CSP for HTML; static split to public routes |
| Dynamic route cache invalidation on public pages | Low | Nonce only 4 inline routes; public stays static |
| ES6 spread/TS drift | Low | tsc 0 gate |
| Remaining Snapshots mismatch | Low | Update snapshots in same slice |

## Rollback Plan

Revert PR4 (nonce change); `next.config.ts` static CSP `script-src 'self'` re-applies (blocks inline scripts, but safe). No data migration.

## Dependencies

- `security-resilience` spec (S-01 CSP); exploration.md already written.

## Success Criteria

- [ ] Build 75, lint 0, tsc 0, tests 376+, coverage 53%+
- [ ] JSON-LD live (structured data renders)
- [ ] `security_logs` A + Response 609 / CSP artifact valid
- [ ] Task c04 (lint) passes
- [ ] `has_role` (from P4) intact