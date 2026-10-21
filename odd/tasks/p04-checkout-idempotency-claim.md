> **Búsqueda:** keywords: `p04, checkout, idempotency, toctou, cwe-362, cwe-799, race-condition, duplicate-orders` · clasificación: `odd-feature` · estado: draft · actualizado: 2026-10-21

# ODD Feature — p04-checkout-idempotency-claim

## Objective
Kill the TOCTOU duplicate-order race in `POST /api/checkout` idempotency (audit P-04, HIGH): make the `idempotency_keys` INSERT the atomic claim whose result DECIDES the request, respond idempotently to lost races and replays, fail closed on unknown claim errors, and stop treating a duplicate order insert as 500+DLQ.

## Problem / Why
Audit finding P-04 (HIGH, STATIC, 34-auditor 2026-09-17, card t_89a2faff, CWE-362/799): idempotency was check-then-insert — `SELECT idempotency_keys` then an `INSERT` whose result was never checked. Two concurrent requests sharing one Idempotency-Key both passed the SELECT; the loser's INSERT is rejected by the table PK with 23505, but that error was silently ignored, so the loser proceeded anyway and created a duplicate order (double processing, double confirmation email).

Card nuance corrected with evidence: the "no unique constraint" claim does not hold for the deployed schema. Migration `0020_orders_checkout.sql` creates `idempotency_keys` with `key text primary key` and adds `orders.idempotency_key text unique` on a column that did NOT exist in `0001_init.sql:161-174` (verified — so the `if not exists` footgun never fired), and 0020 is applied in prod (`bd65df0` "reparar migraciones 0020/0021/0022 para deploy verde"; `docs/DATABASE.md` b3 rework re-verified main+prod 2026-10-20 and lists `idempotency_keys`). The live defect is the TOCTOU plus the unchecked claim result — this fix makes the existing PK the actual race barrier instead of leaving its rejection unheard.

## Scope
- In: `src/app/api/checkout/route.ts` (atomic claim block + catch hardening + claim release), `src/lib/checkout/idempotency.ts` (new pure decision helpers), `tests/unit/t-p04-checkout-idempotency.test.ts`, `.changeset/p04-checkout-idempotency-claim.md`, this doc.
- Out: webhook `processed_events` idempotency (P-01/P-02 pattern already handles 23505), claim TTL/cleanup lifecycle (keys accumulate by design, same as today), front-end caller (none exists — verified in P-06 lane), schema/migration changes (constraints verified present in chain + prod).

## Constraints
- Stacked on `fix/p06-checkout-auth` (PR #17 open): same file; the P-06 feature doc explicitly scoped P-04 out.
- Strict TDD: `t-p04` suite RED on pre-change code, GREEN after.
- vitest (`pnpm test`, `TEMP=E:/temp` on Windows), `tsc --noEmit` exit 0, eslint 0 new problems; POST already carries the `complexity` disable (note extended to mention the claim branches).
- No front-end caller of `/api/checkout` exists → the additive contract change (replay now returns `{status:'already_processed', order}` instead of a bare `{status:'already_processed'}`) breaks nobody.
- RLS: `orders` select policy "own orders" (`0001_init.sql:250`, `auth.uid() = user_id`) backs the replay fetch; `idempotency_keys` has no RLS (0004 enables it only on audit/security logs) so the session user can claim and release keys.

## Design
- Claim = fast-path SELECT for replays + INSERT whose result feeds `decideIdempotencyClaim(existingKey, insertError)` → `'won' | 'lost' | 'failed'`:
  - `'won'` → proceed to order insert (single owner of the key).
  - `'lost'` (existing key, or 23505 race loser) → 200 `{status:'already_processed', order: <existing|null}` fetched `.eq('idempotency_key', key).eq('user_id', user.id)` (user-scoped on top of RLS).
  - `'failed'` (any other claim error) → fail-closed 500 `idempotency claim failed` — at-most-once beats availability in payments; never process without a won claim.
- Orders insert catch: `isUniqueViolation(e)` (23505 on `orders.idempotency_key`, defense-in-depth for constraint drift) → idempotent replay 200, never DLQ.
- Non-duplicate order-insert failure → release the claim (`DELETE idempotency_keys WHERE key = …`) BEFORE the existing DLQ+500 path, so a client retry with the same key is not stuck as `already_processed` with no order behind it. Release happens only after the 23505 branch: a duplicate must never free the key.
- Known limit (documented, follow-up): a claim whose order insert failed AND whose release also failed leaves a stuck key; the retry then gets `already_processed` with `order: null`. Logged via `logger.error`, same residual risk class as today but strictly narrower.

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-p04-checkout-idempotency.test.ts` on pre-change code
  - evidence: `pnpm test tests/unit/t-p04-checkout-idempotency.test.ts` → `Tests 10 failed | 1 passed (11)` (2026-10-21 05:35; the single pass is the guard-order test, which pins the pre-existing order). Two intermediate runs (05:40, 05:42) timed out the route-import smoke at 20s during post-install host churn — t-p06's identical route-import smoke passed 12/12 in 0.83s once the host settled (05:45), so flake, not code.
- [x] T2: `src/lib/checkout/idempotency.ts` — `decideIdempotencyClaim`, `isUniqueViolation` (pure race state machine)
  - evidence: pure-decision + narrowing tests green (11/11, 2026-10-21 05:54, `Tests 11 passed (11)`, duration 3.31s)
- [x] T3: route wiring — atomic claim block, fail-closed branch, replay fetch, catch hardening, claim release
  - evidence: contract tests green in the same 11/11 run (guard order, checked claim insert, lost/failed branches, 23505-before-DLQ, release-after-dup-check)
- [x] T4: full suite + `tsc --noEmit` + eslint on changed files (gates re-run 2026-10-21 by 34-auditor after run-1486 timeout; host 82-100% load)
  - evidence: suite p04 standalone `Tests 11 passed (11)` EXIT=0 (07:13:52, 13.51s; first attempt hit the known route-import smoke 20s flake, same class documented in T1); `tsc --noEmit` EXIT=0 (07:19); eslint changed files EXIT=0 (08:00); prettier --check changed files EXIT=0 (08:02); full suite 607 tests `590 passed | 14 failed | 3 skipped` (07:26) — 14/14 failures are `Test timed out` (grep count 14, zero assertion failures, none in code touched by this change); 13/14 files re-ran fully GREEN in isolation (batch retry `104 passed | 3 skipped`, 07:41); the 14th (t-imports-guard) errors at suite level `spawnSync cmd.exe ETIMEDOUT` — it runs `npx eslint . -f json` with a 300s spawnSync cap that measured >560s under load, while direct eslint on the changed files is EXIT=0 (import order, the guard's subject, proven clean).
- [x] T5: changeset `.changeset/p04-checkout-idempotency-claim.md` (work-unit commit + push + stacked PR base `fix/p06-checkout-auth` tracked in ticket t_89a2faff)

## Verification
- RED: `Tests 10 failed | 1 passed (11)` (2026-10-21 05:35, worktree fix/p04-checkout-idempotency, pre-change code)
- GREEN new suite: `Test Files 1 passed (1), Tests 11 passed (11)` (2026-10-21 05:54; re-verified 07:13 EXIT=0)
- typecheck: `tsc --noEmit` EXIT=0 (07:19) · eslint changed files: 0 problems (08:00) · prettier --check: all pass (08:02)
- full suite: `590 passed | 14 failed | 3 skipped (607)` (07:26) — 14/14 host-load timeouts, zero assertion failures; 13 files GREEN in isolation; t-imports-guard `spawnSync cmd.exe ETIMEDOUT` (300s cap, >560s measured under load) — environmental; direct eslint EXIT=0 covers its subject
- gate logs: profiles/34-auditor/cache/scratch/gate-p04-*.log (suite, suite2, tsc, eslint, prettier, full, retry14, imports, eslintfull)

