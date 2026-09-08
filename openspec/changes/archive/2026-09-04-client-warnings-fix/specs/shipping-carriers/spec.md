# Delta for shipping-carriers — client-warnings-fix (W-07)

## MODIFIED Requirements

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
