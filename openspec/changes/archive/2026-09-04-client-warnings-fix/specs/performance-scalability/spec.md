# Delta for performance-scalability — client-warnings-fix (W-03, W-06)

## MODIFIED Requirements

### Requirement: Compression, Caching, and Stall Prevention
Production MUST enable Brotli (gzip fallback) >1 KB. Cache-Control MUST be: `/_next/static` immutable 1y, private data `private, no-cache, no-store` for `/admin/*` `/account/*` `/api/*` (W-03), public catalog `s-maxage 60 swr 300`, HTML `s-maxage 0 must-revalidate` with ETags 304. Cache stampede MUST use mutex/XFetch. Every fetch MUST be AbortController 8-10s. Targets p95<2s. (Previously: private no-store not enforced per route)

#### Scenario: Stampede on public catalog
- GIVEN cache expired + 200 concurrent catalog hits
- WHEN mutex/XFetch applied
- THEN one regenerates; others get stale

#### Scenario: Private route no-store verified
- GIVEN GET `/account` behind auth
- WHEN headers inspected
- THEN `private, no-cache, no-store` present

## ADDED Requirements

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
