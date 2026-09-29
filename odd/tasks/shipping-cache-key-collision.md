> **Búsqueda:** keywords: `s03, shipping, cache-key, collision, weighthash, cwe-706, cwe-20, international` · clasificación: `odd-feature` · estado: closed · actualizado: 2026-09-29

# ODD Feature — shipping-cache-key-collision

## Objective
Eliminate cross-cart cache collisions in the shipping rate caches: two different carts with the same total weight must never share a cached quote.

## Problem / Why
Audit finding S-03 (MEDIUM, STATIC, 34-auditor, CWE-706/CWE-20): the in-module shipping cache in `src/lib/shipping/index.ts` derived its key from `weightHash = sum(items.weight)` only. Distinct item sets with equal total weight collided on one key, so a quote computed for one cart was served to another (wrong price/ETA — carrier prices depend on `items.length` — or stale data). The same flaw existed in `carriers/international.ts` (`hashItems`).

Context: the route (`POST /api/shipping/rates`) already hashes with the composition-sensitive sha256 `shippingHash` (S-01/S-04 work), but on cache MISS it calls `getShippingRates()`, so the colliding in-module cache was still live for every MISS, and `calc.ts`/`rates.ts` callers inherit it. The archived SDD task T-S04 had declared this fixed, but its `hash.ts`/`cache.ts` helpers were never wired into `index.ts`/`international.ts`.

## Scope
- In: `src/lib/shipping/index.ts` (replace `weightHash` with `shippingHash`), `src/lib/shipping/carriers/international.ts` (replace `hashItems` with `shippingHash`), `tests/unit/t-s03-shipping-cache-key.test.ts` (RED first).
- Out: route-level caching (already sha256, untouched), carrier implementations, `hash.ts`/`cache.ts` internals, Redis migration.

## Constraints
- Strict TDD (RED → GREEN), vitest, `sort-imports` ESLint rule (alphabetical, multiple before single), prettier, gitleaks pre-commit, RDD receipt before commit, 400-line work-unit budget (this unit: ~106 staged lines).
- Shared worktree with in-flight sibling tasks (A-01..A-04, S-02, S-05): commit must be surgical (staged only this task's files; S-02's half-work in the same files stays unstaged).

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-s03-shipping-cache-key.test.ts` (4 tests, all failing on pre-change code)
  - evidence: `npx vitest run tests/unit/t-s03-shipping-cache-key.test.ts` → `Tests 4 failed (4)` — key failure: cart `[{20}]` returned `cache: 'HIT'` with the quote cached for `[{10},{10}]` (2026-09-29)
- [x] T2: GREEN — `index.ts` drops `weightHash`, uses `shippingHash(postalCode, items)` (sha256, order-independent, postal-sensitive, bound ≤25 items)
  - evidence: same command → `Tests 4 passed (4)` (2026-09-29)
- [x] T3: GREEN — `carriers/international.ts` drops `hashItems`, uses `shippingHash` in `keyIntl` composition
  - evidence: intl behavioral test (distinct carts same weight → MISS, MISS, then HIT on repeat) green
- [x] T4: gates — eslint 0 on touched files, prettier clean, gitleaks staged clean, sibling suites green
  - evidence: `./node_modules/.bin/eslint <3 files>` exit 0; `prettier --check` "All matched files use Prettier code style!"; `gitleaks protect --staged` "no leaks found"; combined-tree run `t-s03` + `t-s02` suites → `13 passed (13)`

## Accumulated evidence
- 2026-09-29: RED `Tests 4 failed (4)` → GREEN `Tests 4 passed (4)` (isolated); combined tree with S-02's in-flight work: `2 files, 13 passed (13)`; eslint/prettier/gitleaks exit 0; RDD receipt `receipt-85107eadaee6.json` signed over final staged set (re-signed after adding this doc + changeset).

## Accepted changes and rationale
- Reuse `shippingHash` from `cache.ts` instead of `hash.ts`'s `computeShippingHash`: both are identical sha256(postal + sha256(sorted items)), but `cache.ts` carries the S-01 >25-item bound and is the single implementation the route already uses — one source of truth, and the lib cache key now agrees exactly with the route cache key.
- `shippingHash` throws on >25 items: acceptable at this boundary — the route zod schema already caps items at 25 (`MAX_SHIPPING_ITEMS`), and the sibling S-02 task adds the same fail-fast bound at the lib boundary, making the contract explicit.
- Behavioral test uses an aborted `AbortSignal` to force deterministic carrier failure: the oracle is the HIT/MISS of the cache layer, not carrier prices (fake carriers price by `items.length`, which made the collision visible but would couple the test to fixture pricing).

## Next step
- Nothing for this feature. Route-level Redis migration and S-02's lib-boundary validation are sibling-owned lanes.

## Progress
- 2026-09-29: full fix implemented RED→GREEN, gates green, committed as work-unit `fix(s03): shipping cache key sha256 — distinct carts no longer collide` (see git log for hash).
