> **Búsqueda:** keywords: `s02, shipping, items, bound, zod, cwe-20, cwe-770, input-validation` · clasificación: `odd-feature` · estado: closed · actualizado: 2026-09-29

# ODD Feature — shipping items bound (S-02)

## Objective
Bound and validate the `items` array at EVERY layer it crosses: route (S-01, already shipped), lib boundary (`getShippingRates` / `getInternationalRates`), and hash — with a single source of truth for the bound so it cannot drift.

## Problem / Why
Audit finding S-02 (MEDIUM, STATIC, 34-auditor, CWE-20/CWE-770): `items` was taken from the request body with no schema validation, no per-element type check, no count limit and no max size. The array drove CPU-bound hashing (`shippingHash`), price math (`items.length`) and was forwarded unvalidated to carrier fetches. S-01 (commit 327d609) already added the route-level zod guard + hash bound. S-02 closes the residual gaps that survived S-01:

1. **Lib boundary unguarded** — `getShippingRates` (index.ts) and `getInternationalRates` (international.ts) accepted any array shape/size from any non-route caller, reintroducing the DoS path at the lib tier.
2. **Bound duplication drift risk** — `cache.ts` re-declared `MAX_HASH_ITEMS = 25` next to the schema's `MAX_SHIPPING_ITEMS = 25`; a one-sided edit would break legit carts at the hash layer or silently loosen the bound.

## Scope
- In: `src/lib/validations/shipping.ts` (export `shippingItemsSchema`), `src/lib/shipping/index.ts` (`assertShippingItems` + fail-fast in `getShippingRates`), `src/lib/shipping/carriers/international.ts` (same assert), `src/lib/shipping/cache.ts` (import bound, drop local constant), tests.
- Out: route handler (S-01 owns it, untouched here), rate-limit tiers (A-04 owns), carrier implementations, admin batch route.

## Constraints
- Strict TDD (RED first), vitest 4 + `TEMP=E:/temp` (Windows), eslint gates (native sort-imports: member + declaration order), max-lines 150, prettier via lint-staged at commit.
- SHARED TREE: sibling workers active in the same worktree during this task — S-03 (t_1edd7bfe, same assignee) swapped `weightHash`→`shippingHash` in the two lib files; A-04 (t_698a6d2e) works in `rate-limit.ts`/`proxy.ts`. Hotspot flagged on both cards before editing.

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-s02-shipping-items-bound.test.ts` (9 tests)
  - evidence: `pnpm vitest run tests/unit/t-s02-shipping-items-bound.test.ts` → `Tests 5 failed | 4 passed (9)` (2026-09-29 03:29) — the 5 failures are exactly the S-02 gaps
- [x] T2: export `shippingItemsSchema` (bounded array) from `src/lib/validations/shipping.ts`; `shippingRatesRequestSchema` reuses it
- [x] T3: `assertShippingItems()` in `src/lib/shipping/index.ts` (shared zod schema), fail-fast first line of `getShippingRates` BEFORE hash/cache/carrier fan-out
- [x] T4: same assert wired in `getInternationalRates` (`carriers/international.ts`) BEFORE hash/cache/DHL fetch
- [x] T5: `cache.ts` imports `MAX_SHIPPING_ITEMS` (single source of truth); local `MAX_HASH_ITEMS` removed
- [x] T6: gates — eslint 0 on the 5 touched files, tsc clean (repo tsc fails only in `src/proxy.ts`, A-04's in-flight unstaged file, not part of this commit's tree)

## Accumulated evidence
- 2026-09-29 03:29: RED run → `Tests 5 failed | 4 passed (9)`
- 2026-09-29 04:38: GREEN combined tree → `t-s02 + t-s03 + t-s01` = `Test Files 3 passed (3)`, `Tests 25 passed (25)` (includes sibling S-03's 4 cache-key tests)
- 2026-09-29 04:38: shipping siblings `t-s04 + t-d03 + t-d03b + t-l04` → `Tests 18 passed (18)`
- 2026-09-29 04:43: `eslint <5 files>` → exit 0 (2 sort-imports errors found and fixed first)
- 2026-09-29 04:41: `tsc --noEmit` → sole error `src/proxy.ts(166,5) TS2304 enqueueSecurityAudit` (A-04's unstaged in-flight file; all other output empty). Commit-tree cleanliness argument: HEAD~ typecheck was 0 (S-01 evidence), every tsc error lives in files NOT staged by this commit, staged files import nothing from the unstaged set.

## Accepted changes and rationale
- **Lib boundary THROWS on invalid items** (route answers 422 via its own zod; direct lib callers get a synchronous error before any carrier fetch). Rationale: the lib cannot guess a caller's error contract; fail-fast is the only DoS-safe default at this tier.
- **`assertShippingItems` lives in index.ts and is reused by international.ts** rather than importing the raw schema in both. One enforcement point, one error message, no bespoke bounds.
- **Bound is inclusive (≤25)**: schema `.max(25)` and `shippingHash` `>` check agree; test pins the boundary with exactly-25 acceptance and 26 rejection.
- **Sibling carry**: the committed `index.ts`/`international.ts` include S-03's `shippingHash` swap (interleaved in the same functions; not separable by hunks). Credited in the commit message; S-03's own commit then carries its test + ODD. Combined tree verified green as a unit.

## Next step
- Nothing for this feature. Full-repo `tsc` gate re-run belongs to whichever sibling commit lands last (A-04's proxy.ts must compile before its commit; S-03 carries the cache-key test).

## Progress
- 2026-09-29: S-02 closed RED→GREEN, combined-tree suites 25/25 + 18/18, eslint 0, committed as work-unit `fix(s02)` (SHA recorded below after commit).
