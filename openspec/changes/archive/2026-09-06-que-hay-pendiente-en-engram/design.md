# Design: Clear Pending Work

## Technical Approach

Close two pending items with zero new behavior surface. Slice 1 applies `security-csp-nonce` T-P2-01 verbatim (normative design reused, not duplicated): per-request nonce in `src/proxy.ts`, single proxy-owned CSP for HTML, `x-nonce` read via `headers()` in server components, static `script-src 'self'` conflict removed from `next.config.ts`. This delta adds only the close-out verify gate (spec `security-resilience`). Slice 2 is a guarded filesystem delete of the stale duplicate folder (spec `change-hygiene`). No UI, no new deps, cost-zero.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Proxy owns HTML CSP, static keeps `/tienda`+`/cultura` CDN CSP | Single CSP avoids double-header enforcement bugs; static routes stay cachable | Proxy sets `Content-Security-Policy` with `'nonce-…'` for HTML only; `next.config.ts` static CSP drops `script-src` for HTML scope, retains cache headers for public routes |
| `x-nonce` on request headers via `NextResponse.next({request:{headers}})` | Response header would leak nonce to client; request header is server-readable via `headers()` | Stamp on request headers only; assert absence on response headers in tests |
| `crypto.randomUUID()` per request | Extra entropy vs counter; negligible Edge cost | Reuse per existing design; uniqueness asserted by test |
| Verify gate before archive (t-csp-nonce + lint + build + staging curl) | Slower archive, but prevents broken-CSP archive | Archive blocked until suite green and exactly-one-CSP holds |
| Guarded delete with byte-identical precondition | Extra check step, but prevents wrong-folder loss | Diff stale folder vs archive copy first; delete only if archive intact; rollback from git/archive |

Non-obvious pattern — request-header propagation:

```ts
const nonce = crypto.randomUUID().replace(/-/g, "");
const reqHeaders = new Headers(request.headers);
reqHeaders.set("x-nonce", nonce);
const res = NextResponse.next({ request: { headers: reqHeaders } });
res.headers.set("Content-Security-Policy",
  `default-src 'self'; script-src 'self' 'nonce-${nonce}'`);
```

Server components read it with `const nonce = (await headers()).get("x-nonce")` and render `<script nonce={nonce ?? undefined}>`; `json-ld.ts` gains optional `nonce?: string`.

## Data Flow

```
Request → proxy() [uuid → x-nonce req header → nonce CSP res header]
  → Server Component [headers() → nonce prop → 4 <script nonce>]
  → Browser [CSP 'nonce-…' match → execute; mismatch → block]
Static: /tienda, /cultura → next.config.ts cache + static CSP (no nonce)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/proxy.ts` | Modify | Nonce gen + request-header stamp + HTML-only nonce CSP (~120 lines, per T-P2-01) |
| `next.config.ts` | Modify | Remove static `script-src 'self'` for HTML scope; keep HSTS/cache headers (~40) |
| `src/app/layout.tsx` | Modify | Read `x-nonce` via `headers()`, pass to provider/scripts (~40) |
| `src/lib/seo/json-ld.ts` + 2 page files | Modify | Accept `nonce?`, render `nonce={nonce}` on JSON-LD scripts |
| `tests/unit/t-csp-nonce-*.test.ts` | Create | Proxy/layout/drift-guard suites (RED→GREEN) |
| `openspec/changes/ecommerce-high-end-constitution/` | Delete | Slice 2 guarded delete after archive-intact check |
| `openspec/changes/que-hay-pendiente-en-engram/design.md` | Create | This file |

## Interfaces / Contracts

`x-nonce: <uuid32>` (request-only, never response). CSP invariant: exactly one `Content-Security-Policy`, `script-src` = `'self' 'nonce-…'` only, no `unsafe-inline`/`strict-dynamic`. Archive precondition: archive copy contains proposal+specs+design+tasks before any delete.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit (vitest) | Nonce uniqueness, req-stamp, CSP contains nonce, no response leak, `unsafe-inline` absent | `t-csp-nonce-proxy/layout/drift-guard` |
| Integration | 4 script sites render unblocked; `/tienda`+`/cultura` keep static cache CSP | Build + header inspection |
| E2E (playwright, where applicable) | Staging curl: single CSP, `x-nonce`⇔CSP match, console zero CSP violations | Manual/staging check in verify gate |

Strict TS (`tsc --noEmit` 0), `pnpm lint` 0, zero TODOs; `pnpm build` 75+ pages.

## Migration / Rollout

No migration. Force-chained: slice 1 PR (~300 lines) → verify → archive `security-csp-nonce`; slice 2 separate commit/PR (pure delete). Rollback slice 1: revert PR (restores static `script-src`); slice 2: restore from git history or archive copy byte-identical.

## Open Questions

- None blocking. Staging URL for the curl check is confirmed at verify time.
