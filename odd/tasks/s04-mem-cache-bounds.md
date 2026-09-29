> **Búsqueda:** keywords: `s04, mem-cache, unbounded-map, eviction, cwe-400, cwe-770, bounded-map` · clasificación: `odd-feature` · estado: `in-progress` · actualizado: 2026-09-29

# ODD Feature — s04-mem-cache-bounds

## Objective
Bound every module-level in-memory cache Map flagged by audit finding S-04 (CWE-400/CWE-770) so sustained traffic with distinct keys can no longer grow them until OOM on a long-running instance.

## Problem / Why
Audit S-04 (34-auditor, MEDIUM, STATIC): the module-level rate Maps in `src/lib/shipping/cache.ts:15`, `src/lib/shipping/index.ts:10`, `src/lib/shipping/carriers/international.ts:8`, `src/lib/social/cultura-sync.ts:11` and the rate-limit `memoryStore` (`src/lib/rate-limit.ts:17`) were unbounded — entries expired lazily on read only, so distinct-key traffic grew the Maps without limit (OOM DoS vector on a long-running instance).

Verified against HEAD (f1acd4d) before touching anything — the finding was partially stale:
- `shipping/cache.ts` — ALREADY bounded by S-01 (commit 327d609): `MAX_MEM_ENTRIES=1000` + FIFO `evictIfNeeded()` on every `cacheSet`.
- `rate-limit.ts` `memoryStore` — ALREADY bounded by sibling A-04 (commit 233a354, branch `fix/a04-rate-limit-fail-closed`): extracted to `src/lib/rate-limit/memory-store.ts`, `MEMORY_STORE_CAP=1000` + TTL purge + oldest-first eviction, guarded by `t-a04-store-eviction.test.ts`.
- `social/cultura-sync.ts` — ALREADY bounded by sibling S-05 (commit f1acd4d): `MAX_MEM_DEDUP=1000` + FIFO, guarded by `t-s05-cultura-dedup.test.ts`. (Note: audit cited path `src/lib/cultura-sync.ts`; the file lives at `src/lib/social/cultura-sync.ts` and never existed at the cited path.)
- `shipping/index.ts:10` MEM and `carriers/international.ts:7` MEM — STILL unbounded. This change bounds exactly these two.
- Collateral scan: `social/graph.ts:13` keeps a module-level Map keyed by a 3-value platform enum (~4 possible keys, `clearSocialCache` exported) — bounded de facto, out of scope. `shipping/labels.ts` Maps are function-local/transient — not a finding. `rate-limit.ts:60 limiterCache` is keyed by 6 static tiers — bounded de facto.

## Scope
- In: `src/lib/bounded-map.ts` (new shared helper), `src/lib/shipping/index.ts`, `src/lib/shipping/carriers/international.ts`, `tests/unit/t-s04-mem-cache-bounds.test.ts`, changeset, this doc.
- Out: rate-limit memoryStore (A-04 owns), cultura-sync dedup (S-05 owns), cache.ts (S-01 done), social/graph.ts (bounded de facto), any carrier behavior change, route changes.

## Constraints
- Strict TDD (RED→GREEN), vitest 4 runner with `TEMP=E:/temp TMP=E:/temp TMPDIR=E:/temp` (Windows TMP contamination otherwise causes spurious timeouts — documented in the S-01 ODD).
- eslint: `sort-imports` error, `max-lines` 150/file, complexity warn 12; prettier canonical.
- HOTSPOT: siblings S-02/S-03 had `index.ts`/`international.ts` dirty and uncommitted in the main checkout mid-flight (S-02 zod bound + S-03 shippingHash key). All S-04 work executed in isolated worktree `.worktrees/s04` (branch `fix/s04-mem-cache-bounds`, base f1acd4d) so this commit cannot sweep sibling work. Diff regions are disjoint (siblings: imports/hash; S-04: cap + eviction calls) — later merges should auto-resolve; if a conflict arises the intent synthesis is: keep the sibling import/hash lines, keep the eviction call directly above each `MEM.set`.

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-s04-mem-cache-bounds.test.ts` (6 tests)
  - evidence: `vitest run tests/unit/t-s04-mem-cache-bounds.test.ts` → `Tests 6 failed (6)` (2026-09-29 05:44, worktree s04)
- [x] T2: GREEN — `src/lib/bounded-map.ts` shared helper (`MAX_RATE_MEM_ENTRIES=1000`, `evictOldestIfNeeded` FIFO via Map insertion order)
- [x] T3: wire eviction at all 5 `MEM.set` sites (2 in index.ts, 3 in international.ts) + re-export the cap from both modules + test-observability exports (`clearShippingMem`/`shippingMemSize`/`clearIntlMem`/`intlMemSize`)
  - evidence: `vitest run tests/unit/t-s04-mem-cache-bounds.test.ts` → `Tests 6 passed (6)` (2026-09-29 05:58)
- [x] T4: gates — typecheck, eslint, prettier on touched files
  - evidence: `tsc --noEmit` exit 0; `eslint <4 files>` exit 0; `prettier --check <4 files>` all green post `--write` (2026-09-29 06:34)
- [x] T5: full suite sanity in worktree (100 files)
  - evidence: `vitest run` → 551/552 green, single `t-g02-reviews` timeout = load flake (passes isolated: 4/4 twice); later full runs under concurrent sibling load showed 4-5 non-deterministic timeout flakes in 3 disjoint sets, ALL passing isolated — consistent with documented host-load flakiness, none related to S-04 files (2026-09-29 06:26)

## Accumulated evidence
- 2026-09-29 05:34 RED (first form): `Tests 4 failed (4)` — missing caps/exports
- 2026-09-29 05:44 RED (final form): `Tests 6 failed (6)` — helper missing, 5 set-sites unwired, observability exports missing
- 2026-09-29 05:58 GREEN: `Tests 6 passed (6)` — cap, FIFO eviction at every set site, bounded size under churn (oldest evicted, newest kept, both domestic and international, success and fallback paths)
- 2026-09-29 06:20 `t-imports-guard` + `t-s1-hygiene` isolated: 10/10 green (guard suites that read the touched files)
- 2026-09-29 06:34 prettier re-check after --write: 4/4 canonical; suite re-run 6/6 green

## Accepted changes and rationale
- Shared helper (`src/lib/bounded-map.ts`) instead of a 4th/5th inline FIFO copy: single auditable mechanism, S-02 "single source of truth for bounds" doctrine; smaller diff in the two hotspot files.
- Cap 1000, matching every precedent in this codebase (S-01 cache.ts, A-04 memory-store, S-05 dedup) — one consistent bound policy.
- Test-observability exports instead of exposing the Maps: keeps the Maps module-private while letting the eviction suite reset/inspect them.
- Entry TTL (60s) stays lazily enforced on read: entries are cheap shipping quotes; adding a sweeper would add complexity for no measurable gain at cap 1000.

## Next step
- Merge `fix/s04-mem-cache-bounds` after the in-flight siblings (S-02/S-03) land their commits — diff regions are disjoint, expect auto-merge.

## Progress
- 2026-09-29: implemented RED→GREEN in isolated worktree, gates green, committed as work-unit `fix(s04): bound module-level rate Maps`.
