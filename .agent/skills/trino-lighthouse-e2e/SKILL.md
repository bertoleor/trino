---
name: trino-lighthouse-e2e
description: >
  Performance and E2E gates for trino.: LHCI budgets, Playwright e2e, performance & scalability
  invariants. Trigger: When running/adding e2e tests, Lighthouse CI, perf budgets, or touching
  performance-scalability/observability invariants.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Lighthouse / E2E / Performance Gates

Trace: performance-scalability (PERF-01..08, HTTP-01/02, STOR-01, UX-01), observability-health,
build-tooling-freshness S-02.

## LHCI Budgets (lighthouserc.json)

`lhci autorun --assert` against `http://localhost:3000/es-AR/tienda`, `numberOfRuns: 3`. Assertions:

- `categories:performance` → **error, minScore 0.9**
- `categories:pwa` → warn minScore 0.9 (warn because manifest/SW not yet present; keep follow-up
  task)
- `largest-contentful-paint` → error, **max 2500ms**
- `cumulative-layout-shift` → error, **max 0.1**
- `interaction-to-next-paint` → error, **max 200ms**

A run below 0.9 on performance **fails the build**. Report uploaded as a CI artifact. Run:
`pnpm lhci:assert`.

## E2E (Playwright — `tests/e2e/`)

- `baseURL: http://localhost:3000/**`, fullyParallel, `retries:2` on CI, trace on-first-retry, HTML
  reporter.
- Every admin button binds to a wired Server Action — **zero dead buttons** is a Playwright smoke
  (see `trino-admin-backoffice`).
- Trigger: run `pnpm test:e2e` alongside unit tests before merge.

## Perf Invariants (from performance-scalability spec)

### Pagination & virtualization

- Server pagination default 25 rows, **max 100** (PERF-01).
- Lists with >50 offscreen elements MUST use `@tanstack/react-virtual`, loaded via **`next/dynamic`
  (ssr-safe)** — static import of heavy list bundles on first paint is forbidden (PERF-02/03).

### Image pipeline

- WebP/AVIF via Edge Function, **BlurHash** placeholder, original never served (PERF-07).
- Uploads >2 MB via **presigned URL direct to Storage** — never through the Next server (PERF-06).
  Limits: 10 MB/file, 1 GB/tenant under `/{org}/{entity}/{uuid}.{ext}`.
- Cultura covers MUST use `next/image` (AVIF/WebP, `sizes` for mobile breakpoints, `alt` preserved)
  — raw `<img>` for covers is forbidden.

### Caching & compression

- Brotli (gzip fallback) on text >1 KB (HTTP-01).
- `/_next/static` immutable 1y; private data `private, no-cache, no-store` for `/admin/*`
  `/account/*` `/api/*`; public catalog `s-maxage 60 swr 300`; HTML `s-maxage 0 must-revalidate`
  with ETags 304.
- **Cache stampede prevention** via atomic mutex/XFetch (PERF-05) — on cache expiry + concurrent
  hits, exactly one regenerates, others get stale copy.
- Every fetch **AbortController-guarded 8-10s** (PERF-08).
- Orphan files GC weekly (STOR-02).
- Targets: **p95 <2s**, initial load async path <200ms (RES-03). Touch targets ≥44×44px.

## Observability coupling (observability-health)

- Build **zero warnings/errors** gate — run `pnpm build` + `pnpm lint`; any warning fails CI.
- Custom metrics: Customer 360 `route:/admin/customers/[id] duration` w/ alert p95>1s; DLQ counter.
- Health endpoints: `GET /api/health` (DB 2s / Redis 1s / Storage 2s → 200 ok or 503 identifying
  failed check), plus `/api/health/live` and `/api/health/ready`.
- ErrorBoundary wraps root layout + `/checkout`, `/admin/*`, data-fetching components (global
  fallback full reload, local inline).
- Every touched route needs error/loading contract (`error.tsx`/`loading.tsx` Bauhaus skeleton).

## Test thresholds (vitest)

Unit/integration in `tests/` (`vitest.config.ts`), coverage provider v8. Current incremental
thresholds: lines 35 / functions 30 / branches 30 / statements 35; critical files (env.ts,
logger.ts, validations/**: 30). Coverage intentionally incremental — do NOT treat as 90/80 (that
archived target doesn't apply yet). Every suite MUST include sad paths (timeout, 500, expired
session, empty state).

## Traps

- **Warnings fail the build gate** — zero-warning is enforced, not aspirational.
- **Lighthouse p95/LCP are hard `error` thresholds** — a perf regression fails CI, don't ship it.
- **Heavy-list chunk must be dynamically imported** — static lazy-imports on first paint still blow
  the JS budget.
- **Server pagination max 100** — never return 500 rows in one page.
- **PWA assertion is warn, not error** (no manifest/SW yet) — don't silently upgrade it to error or
  downgrade it.
- Coverage is incremental (30-40), not archival 90/80 — guard against someone tightening thresholds
  prematurely or relaxing them.
