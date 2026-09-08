# performance-scalability Specification

## Purpose
Mobile-first performance for 500 SKUs under massive concurrency, cost-zero. Bauhaus principle: every visual element MUST have functional purpose (bahaus doc §1). Trace: PERF-01..08, HTTP-01..03, IDX-01..03, STOR-01/02, DB-06/07, Plan tienda §9.

## Requirements

### Requirement: Pagination, Virtualization, and Image Pipeline
Server pagination MUST default 25 rows, max 100 (PERF-01). Lists expecting >50 offscreen elements MUST use `@tanstack/react-virtual` (PERF-02). Images MUST be WebP/AVIF via Edge Function with BlurHash placeholder; original never served (PERF-07). Uploads >2 MB MUST use presigned URL direct to Storage (PERF-06) under `/{org}/{entity}/{uuid}.{ext}` with 10 MB/file, 1 GB/tenant limits (STOR-01). Heavy list fetches MUST be dynamically imported (PERF-03).

#### Scenario: Gallery scroll at 500 products
- GIVEN PLP with 500 SKUs
- WHEN user scrolls
- THEN only viewport nodes are in DOM via virtualizer; Lighthouse perf stays ≥90

#### Scenario: Large image upload
- GIVEN admin uploads 8 MB photo
- WHEN upload initiated
- THEN backend returns presigned URL; upload bypasses Next server; BlurHash generated

### Requirement: Compression, Caching, and Stall Prevention
Production MUST enable Brotli (gzip fallback) for text responses >1 KB (HTTP-01). Cache-Control MUST be: `/_next/static` immutable 1y, private data `private, no-cache, no-store` for `/admin/*` `/account/*` `/api/*` (W-03), public catalog `s-maxage 60 swr 300`, HTML `s-maxage 0 must-revalidate` (HTTP-02) with ETags 304 (HTTP-03). Cache stampede MUST be prevented via atomic mutex/XFetch (PERF-05). Every fetch MUST be AbortController-guarded 8-10s (PERF-08). Orphan files MUST be GC weekly (STOR-02). Targets: p95 <2s, initial load <200ms async path (RES-03). Touch targets ≥44×44px via padding, thumb-zone CTAs w-full on mobile (UX-01, Plan tienda §0.1). Zero warnings/errors build gate.

#### Scenario: Stampede on public catalog
- GIVEN cache expired and 200 concurrent requests hit catalog
- WHEN mutex/XFetch strategy applied
- THEN exactly one regenerates; others receive stale copy

#### Scenario: Private route no-store verified
- GIVEN GET `/account` behind auth
- WHEN headers inspected
- THEN `private, no-cache, no-store` present

### Requirement: Fuzzy Search via pg_trgm
Extension `pg_trgm` MUST be enabled via migration `0022`; `products.name/search_vector` SHALL have `GIN pg_trgm` + `similarity` indexes alongside FTS GIN (W-06). Search MUST use `ILIKE '%term%'` + `similarity() >0.3` fallback when `tsvector` yields 0, proving typo tolerance. `LIKE` without `ILIKE` for case-insensitive is forbidden.

#### Scenario: pg_trgm typo tolerance
- GIVEN product "medialuna" queried as "medialunaa"
- WHEN search executes `ILIKE + similarity`
- THEN returned with similarity 0.45 via pg_trgm (LIKE alone would miss)

#### Scenario: LIKE vs ILIKE case proof
- GIVEN query "MEDIALUNA" upper
- WHEN search runs
- THEN ILIKE matches; LIKE would fail — test asserts ILIKE used

### Requirement: Cultura Images via next/image

Cultura list and detail views MUST render covers with `next/image` (AVIF/WebP, `sizes` for mobile-first breakpoints, `alt` preserved); raw `<img>` for covers is forbidden. No new WCAG surface: existing `alt` text is kept, sizes match layout.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Cultura cover optimized

- GIVEN `cultura/page.tsx` and `cultura/[slug]/page.tsx` covers
- WHEN rendered on a 390px viewport
- THEN a right-sized AVIF/WebP is served with intact `alt` and no layout shift

### Requirement: Heavy-List Dynamic Imports

Lists expecting >50 offscreen elements MUST load their virtualizer/heavy-list code via `next/dynamic` (ssr-safe); static import of heavy list bundles on first paint is forbidden.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Deferred heavy list

- GIVEN a heavy list route
- WHEN first paint completes
- THEN the virtualizer chunk loads on demand and initial JS stays within budget

### Requirement: Zero console.* and Dead-Code Removal

Touched files MUST contain zero `console.*` (the `console.log` inside `admin/easter` inline script included) and `src/proxy.ts` MUST NOT contain `void`-string dead code (`void "security_logs…"`, `void (isAdminCookie…)`, `void best`).

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Lint proves clean

- GIVEN the hardened slice
- WHEN `console.*`/`void "` patterns are searched in touched files
- THEN zero matches are found

### Requirement: File-Size and Strict-TS Compliance

Every touched file MUST stay ≤150 lines (split or justify with a waiver) and compile under strict TS with zero TODOs; no new paid dependencies are permitted.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Touched files compliant

- GIVEN the slice diff
- WHEN line count, `tsc --noEmit`, and TODO search run
- THEN all touched files are ≤150 lines, type-clean, and TODO-free
