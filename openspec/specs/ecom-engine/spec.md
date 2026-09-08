# ecom-engine Specification

## Purpose
Complete commerce engine for esoteric catalog: anon cart+merge, ENUM state machine, price integrity, abandoned cart, entitlements. Brand: trino., Neo-Bauhaus "forma sigue a función" (bahaus doc), triple taxonomy marca.md §3. Trace: ECOM-01..07, AUTH-02/03, DB-04/05, JOBS-01.

## Requirements

### Requirement: Anonymous Cart and Merge
Cart MUST persist in DB from first add via `carts(session_id UUID, user_id FK nullable)` + `cart_items`; prohibited localStorage-only (ECOM-01). On login, anon cart MUST merge with user cart summing same SKU capped at stock (ECOM-02). All mutations MUST use optimistic update + rollback toast (UX-03/04) with 44px targets (UX-01).

#### Scenario: Guest adds then logs in
- GIVEN anon session with 2× SKU A
- WHEN user logs in having 1× SKU A in DB cart
- THEN merged cart has 3× (or stock max) without duplication

#### Scenario: Optimistic add rollback
- GIVEN stock 1 and user adds 1
- WHEN backend rejects 409 stock exhausted
- THEN UI reverts quantity and shows error toast in locale

### Requirement: Order State Machine and Price Integrity
Orders MUST use strict ENUM `draft→pending→pending_verification→authorized→processing→shipped→delivered→canceled→refunded` with server-validated transitions; prohibited boolean flags (ECOM-03). Prices MUST use `sale_price_cents + sale_start/end UTC`; discount % computed at render `((base-sale)/base*100)` (ECOM-04). DOC-01 footer disclaimer MUST appear on every internal receipt PDF. Abandoned carts unmodified >4h MUST be identified by pg_cron hourly job and dispatched via QStash→Resend (ECOM-05, JOBS-01) in recipient locale.

#### Scenario: Invalid state jump
- GIVEN order `pending`
- WHEN client requests transition to `shipped`
- THEN 422 "invalid_transition"

#### Scenario: Abandoned cart >4h
- GIVEN cart updated 5h ago with items and no order
- WHEN pg_cron hourly job runs
- THEN system queues locale-aware reminder email; admin Abandoned Carts view shows it

### Requirement: Esoteric Catalog Taxonomy and Consent
Catalog MUST support triple taxonomy per marca.md §3: type (tarot, velas...), tradition (wicca, budismo...), intention (amor, protección...). Filters MUST be combinable, not separate menus. Every tradition-linked product SHOULD include origin/context block and disclaimer where legally advisable (marca.md §4). Consent banner MUST gate analytics/marketing cookies with granular categories (PRIV-01). Search MUST support fuzzy typo tolerance via FTS+pg_trgm (DB-07).

#### Scenario: Triple filter
- GIVEN user selects intention=protección + tradition=wicca
- WHEN PLP query executes
- THEN results intersect both facets via FTS+filter in one round-trip
