# concurrency-inventory Specification

## Purpose
Prevent double-sell under massive concurrency for 500 SKUs. Trace: CONCURRENCIA-01, DB-06, DB-03, IDX-01, PERF-04.

## Requirements

### Requirement: Two-Level Concurrency Control
Level 1 (admin/catalog edits): MUST use OCC — client sends `expected_updated_at`; backend rejects with 409 Conflict if DB `updated_at` newer. Level 2 (inventory/payment): MUST use `SERIALIZABLE` or `SELECT ... FOR UPDATE` row lock inside a single transaction for stock decrement. Double-sell MUST be impossible under concurrent checkout. (Trace: CONCURRENCIA-01)

#### Scenario: Admin OCC conflict
- GIVEN editor A and B load product `updated_at=T1`
- WHEN A saves (T2) then B saves with T1
- THEN B receives 409 with "reload_required"

#### Scenario: Concurrent checkout exhausts stock
- GIVEN variant stock=1 and two users checkout simultaneously
- WHEN both transactions attempt `FOR UPDATE` decrement
- THEN one commits (stock 0, order `pending`), other aborts and user sees "Sin stock" empathetically

### Requirement: Pagination, N+1 Prevention, Indexing
All list queries MUST use server-side pagination `LIMIT 25 OFFSET` or cursor (PERF-01) and single round-trip join (DB-06) — prohibited iterative queries in loops. FTS for search MUST use `to_tsvector` + GIN (DB-07). Every FK MUST have index (IDX-01). Cross-tab cart/auth MUST sync via BroadcastChannel (PERF-04).

#### Scenario: Admin product list at 500 SKUs
- GIVEN 500 products in DB
- WHEN admin opens /admin/products
- THEN only 25 rows fetched via server pagination; EXPLAIN ANALYZE cost <10k

#### Scenario: Cross-tab logout
- GIVEN user logged in two tabs
- WHEN they log out in tab A
- THEN tab B redirects to /login via BroadcastChannel immediately
