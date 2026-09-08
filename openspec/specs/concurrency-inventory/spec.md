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
All list queries MUST use server-side pagination `LIMIT 25 OFFSET` or cursor and single round-trip join — iterative loop queries are forbidden. FTS MUST use `to_tsvector` + GIN. Every FK MUST have index. Cross-tab cart/auth MUST sync via `BroadcastChannel('auth')` with `storage` event fallback when unavailable (W-05); logout MUST propagate <1s.

#### Scenario: Admin product list at 500 SKUs
- GIVEN 500 products in DB
- WHEN admin opens /admin/products
- THEN only 25 rows via server pagination; EXPLAIN cost <10k

#### Scenario: Cross-tab logout via BroadcastChannel
- GIVEN user logged in tabs A and B
- WHEN logout in A posts `BroadcastChannel('auth') {type:'logout'}`
- THEN B redirects to /login <1s without reload

#### Scenario: Storage fallback when BroadcastChannel unavailable
- GIVEN Safari private mode blocks BroadcastChannel
- WHEN logout occurs
- THEN `localStorage.setItem('auth:logout', Date.now())` triggers `storage` event and B logs out <1s

#### Scenario: Cart sync across tabs
- GIVEN cart added in tab A
- WHEN BroadcastChannel sync fires
- THEN tab B merges cart state without N+1 refetch
