# shipping-carriers Specification

## Purpose
Multi-carrier Argentine shipping (Andreani / Correo Argentino / OCA) via Strategy pattern with quota-safe caching. Trace: ECOM-06, LOG-01..03, RES-02, RES-03, PERF-05, PRIV-05, Plan tienda §4.12.

## Requirements

### Requirement: Carrier Strategy and Quota Protection
The system MUST expose `POST /api/shipping/rates {postal_code, items:[{weight, dims}], carrier?}` behind a carrier Strategy interface with implementations for Andreani, Correo Argentino, OCA. Rate results MUST be cached in Upstash Redis per `session+postal_code+weightHash` with `s-maxage 60, stale-while-revalidate 300` (HTTP-02). Uncontrolled bulk loops are prohibited (RES-02): calls MUST use `p-limit` concurrency + exponential backoff+jitter (max 5 retries); 429 triggers DLQ fallback. When all carriers fail / circuit open, response MUST fallback to `global_settings.fixed_shipping_cents` (CMS-01). (Trace: ECOM-06, LOG-01, RES-02, RESILIENCIA-01, HTTP-02, CMS-01)

#### Scenario: Cached quote
- GIVEN same session requests CP 1425 twice within 60s
- WHEN second request hits API
- THEN no external call; cached JSON returned; `X-Cache: HIT`

#### Scenario: Carrier outage fallback
- GIVEN Andreani/Correo/OCA all return 5xx or open circuit
- WHEN rates requested
- THEN API returns fixed cost from `global_settings` with `source:"fallback"` and logs warning

### Requirement: Circuit Breaker and A4/ZPL Labels
Each carrier client MUST wrap fetch in `AbortController` 8s; after 3 fails/60s circuit MUST open, after 30s half-open probe. Labels/tracking MUST be via carrier APIs with format selector A4 PDF or ZPL (W-07). Admin batch MUST group `paid` orders by `postal_code`, run via `p-limit 10` concurrency, and stream `SSE` progress for >100 rows; ZPL SHALL concatenate per `postal_code` group, A4 SHALL paginate one label per page.

#### Scenario: Circuit opens
- GIVEN 3 OCA failures in 60s
- WHEN next rate request targets OCA
- THEN fails fast fallback without network

#### Scenario: Batch labels A4/ZPL grouped by postal_code (45 orders)
- GIVEN admin selects 45 paid orders CP 1425+1426 format ZPL
- WHEN batch requested
- THEN grouped by `postal_code`, generated via `p-limit 10`, streamed via SSE; 45 ZPL blobs returned grouped

#### Scenario: SSE progress >100 rows
- GIVEN 120 orders batch A4
- WHEN generation starts
- THEN client receives `event: progress {completed,total}` per 10; final event `done {urls}`

#### Scenario: Label format selector
- GIVEN same 2 orders format A4 vs ZPL
- WHEN requested
- THEN A4 returns PDF bytes; ZPL returns `^XA` text — content-type differs
