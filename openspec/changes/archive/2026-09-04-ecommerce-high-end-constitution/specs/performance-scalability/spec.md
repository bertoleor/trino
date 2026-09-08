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
Production MUST enable Brotli (gzip fallback) for text responses >1 KB (HTTP-01). Cache-Control MUST be: `/_next/static` immutable 1y, private data `no-cache no-store`, public catalog `s-maxage 60 swr 300`, HTML `s-maxage 0 must-revalidate` (HTTP-02) with ETags 304 (HTTP-03). Cache stampede MUST be prevented via atomic mutex/XFetch (PERF-05). Every fetch MUST be AbortController-guarded 8-10s (PERF-08). Orphan files MUST be GC weekly (STOR-02). Targets: p95 <2s, initial load <200ms async path (RES-03). Touch targets ≥44×44px via padding, thumb-zone CTAs w-full on mobile (UX-01, Plan tienda §0.1). Zero warnings/errors build gate.

#### Scenario: Stampede on public catalog
- GIVEN cache expired and 200 concurrent requests hit catalog
- WHEN mutex/XFetch strategy applied
- THEN exactly one regenerates; others receive stale copy

#### Scenario: Mobile thumb CTA
- GIVEN PDP on viewport <768px
- WHEN rendered
- THEN "agregar al carrito." button is sticky bottom, w-full, ≥44px, pill radius 50px (marca.md)
