# Delta for concurrency-inventory — client-warnings-fix (W-05)

## MODIFIED Requirements

### Requirement: Pagination, N+1 Prevention, Indexing
All list queries MUST use server-side pagination `LIMIT 25 OFFSET` or cursor and single round-trip join — iterative loop queries are forbidden. FTS MUST use `to_tsvector` + GIN. Every FK MUST have index. Cross-tab cart/auth MUST sync via `BroadcastChannel('auth')` with `storage` event fallback when unavailable (W-05); logout MUST propagate <1s. (Previously: BroadcastChannel mentioned without fallback or latency bound)

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
