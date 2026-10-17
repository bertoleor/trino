> **Búsqueda:** keywords: `s01, shipping-rates, dos, rate-limit, cwe-770, cwe-400, body-cap` · clasificación: `odd-feature` · estado: closed · actualizado: 2026-09-28

# ODD Feature — shipping-rates-dos-hardening

## Objective
Harden `POST /api/shipping/rates` against anonymous resource-exhaustion (DoS): per-route rate limit, body size cap, zod validation before hashing, bounded in-memory cache.

## Problem / Why
Audit finding S-01 (HIGH, STATIC, 34-auditor): the endpoint is unauthenticated, ran with no per-route rate limit, no body size cap, and hashed raw client items before validating them. On cache MISS it fans out to external carriers and, on failure, queries `global_settings`. An anonymous attacker could spam requests to drive repeated external fetches, CPU-bound hashing, and unbounded in-memory cache growth (the `mem` Map in `src/lib/shipping/cache.ts` had no eviction; keys embed a client-controlled `x-session-id` header of unbounded length). CWE-770 / CWE-400 / OWASP A05:2021.

Note: the global proxy (`src/proxy.ts:185`) already applies a generic `public 60/m` per-IP tier to every path — the finding predates it or considers 60/m × carrier fan-out still excessive. This change adds a stricter endpoint-specific budget and the missing input bounds.

## Scope
- In: `src/app/api/shipping/rates/route.ts` (guards), `src/lib/validations/shipping.ts` (new zod schema), `src/lib/rate-limit.ts` (new `shipping` tier 20/m), `src/lib/shipping/cache.ts` (mem eviction + hash input bound), tests.
- Out: proxy/global tier changes, auth requirement for the endpoint (it is intentionally public for checkout shipping quotes), carrier implementations, admin batch route.

## Constraints
- Strict TDD (RED first), vitest runner with `TEMP=E:/temp` (Windows), eslint gates (sort-imports native rule: syntax groups multiple→single, then first-member case-sensitive), complexity warn at 12 (route keeps its justified COMP-12 disable), max-lines 150 per file.
- Stacked on `fix/a01-auth-turnstile` (in-flight sibling work in the worktree, NOT committed by this task).

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-s01-shipping-dos.test.ts` (12 tests, all failing on pre-change code)
  - evidence: `pnpm vitest run tests/unit/t-s01-shipping-dos.test.ts` → `Tests 12 failed (12)` (2026-09-28)
- [x] T2: zod schema `src/lib/validations/shipping.ts` — `shippingRatesRequestSchema` (postalCode 1..32, items ≤25, finite non-negative weight/dims, unknown keys stripped)
  - evidence: behavioral tests in T1 suite; `pnpm typecheck` exit 0
- [x] T3: `shipping` rate-limit tier (20/60s) in `src/lib/rate-limit.ts` + applied first-thing in the route with 429 + headers
  - evidence: `t-c01-rate-limit.test.ts` 8/8 green; route regex assertions green
- [x] T4: body cap 32KB via content-length (413) + invalid JSON (400) + zod 422 BEFORE hash; `x-session-id` capped to 128 chars
  - evidence: T1 suite 12/12 green after change
- [x] T5: cache.ts — `MAX_MEM_ENTRIES=1000` FIFO eviction on `cacheSet`, `shippingHash` throws on >25 items
  - evidence: T1 eviction test (first key evicted after 1200 sets) green
- [x] T6: gates — eslint 0 errors on touched files, `pnpm typecheck` exit 0
  - evidence: `./node_modules/.bin/eslint <5 files>` exit 0; `tsc --noEmit` exit 0

## Accumulated evidence
- 2026-09-28: RED run `Tests 12 failed (12)` → GREEN run (T1 suite isolated) `Tests 12 passed (12)`
- 2026-09-28: sibling suites green in one batch: t-l04, t-s04, t-warnings-t3-guard, t-c01, t-d03, t-s1-hygiene → `7 passed (7)` files, `47 passed (47)` tests (with `TEMP=E:/temp` override; without it, Windows TMP contamination caused spurious timeouts)
- 2026-09-28: `pnpm typecheck` exit 0; eslint on 5 touched files exit 0

## Accepted changes and rationale
- Route keeps the `complexity` disable with ticket `repo-cleanup-final/COMP-12` ("pre-existing 17"): the t-warnings-t3-guard test pins that exact disable+ticket; removing it would break the guard. Refactor of the route's branching is T4-owned elsewhere.
- Added `shipping` tier at 20/m rather than reusing `public` 60/m: a cache-MISS request costs 1-3 external carrier calls + hashing; 20/m per IP still leaves huge headroom for a real cart flow (users quote a handful of postal codes per checkout).
- 413 via `content-length` header check only: reading the stream to measure would defeat the cap's purpose (the body is already buffered by the platform); header-check is the standard cheap gate, documented as best-effort.
- `x-session-id` truncated to 128 instead of validated strictly: it is only a cache-key component; truncation bounds key size without breaking legit clients.
- Eviction is FIFO (insertion-order Map), not true LRU: entries are 60s-TTL shipping quotes; FIFO is simpler and sufficient for a bounded working set.

## Next step
- Nothing for this feature. If resumed: the only deferred item is the route complexity refactor (T4-owned, ticket repo-cleanup-final/COMP-12).

## Progress
- 2026-09-28: full hardening implemented RED→GREEN, gates green, committed as work-unit `fix(s01): shipping rates anti-DoS hardening` (see git log for hash).
