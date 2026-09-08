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
Each carrier client MUST wrap fetch in `AbortController` timeout 8s; after 3 consecutive failures in 60s circuit MUST open (fail-fast), after 30s probe half-open (RESILIENCIA-01). Labels/tracking MUST be obtained exclusively via carrier APIs (LOG-01) with print format selector A4 PDF or ZPL (LOG-02). Admin batch MUST group `paid` orders by postal_code (LOG-03) with p-limit bulk and SSE progress for >100 rows (JOBS-02). Shipping cost display MUST appear before final payment step (Plan tienda §5).

#### Scenario: Circuit opens
- GIVEN 3 failures in 60s for OCA
- WHEN next rate request targets OCA
- THEN it fails fast without network and returns fallback or alternate carrier

#### Scenario: Batch labels A4/ZPL
- GIVEN admin selects 45 orders for CP 1425 and format ZPL
- WHEN batch requested
- THEN system generates ZPL via Andreani API in batches of 10 via p-limit and streams progress
