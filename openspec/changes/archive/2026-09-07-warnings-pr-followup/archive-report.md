# Archive Report: warnings-pr-followup

**Change**: warnings-pr-followup
**Archived**: 2026-09-07 → `openspec/changes/archive/2026-09-07-warnings-pr-followup/`
**Verdict**: Follow-up verified PASS WITH WARNINGS, then polished to fully green on the 10-file scope. Zero CRITICAL issues. SDD cycle complete.
**Mode**: both (OpenSpec filesystem + Engram) — NO git stage/commit/restore performed by archive.

## Phase Deviation (intentional, orchestrator-directed)

`explore` / `proposal` / `spec` / `design` / `tasks` phases were explicitly SKIPPED for this change.
This is an orchestrator-directed micro-followup to `warnings-smells-cleanup`, not a standalone change:

- Scope was fixed and tiny: 8 ticket-justified complexity disables (COMP-1…8) + fx `rows as never` narrowing via `toTypedSupabase`/`isRecord`.
- The guard test `tests/unit/t-warnings-followup.test.ts` (133 lines, 7 tests) serves as the spec — the verify report maps every scope requirement to a passing runtime test (guard-test-as-spec pattern).
- Orchestrator explicitly instructed archive to persist final state with this deviation noted and its rationale recorded, NOT re-litigated. This report is that record.

Missing artifacts (`exploration.md`, `proposal.md`, `specs/`, `design.md`, `tasks.md`) are therefore INTENTIONAL, not gaps. The archive is marked complete with this documented deviation.

## Engram Traceability (observation IDs)

| Artifact | Topic key | ID |
|----------|-----------|----|
| init | sdd-init/santisima-trinidad | #827 |
| explore | — (skipped, see deviation) | — |
| proposal | — (skipped, see deviation) | — |
| spec | — (skipped; guard-test-as-spec) | — |
| design | — (skipped; S2 boundary pattern reused) | — |
| tasks | — (no tasks artifact; gate vacuous, see below) | — |
| apply-progress (polish) | sdd/warnings-pr-followup/apply-progress | #969 |
| verify-report | sdd/warnings-pr-followup/verify-report | #968 |
| prior archive (parent change) | sdd/warnings-smells-cleanup/archive-report | #949 |

## Task Completion Gate

No `tasks.md` / tasks observation exists for this micro-followup — there was no task-planning phase by design (see deviation). Gate result: VACUOUS PASS — zero unchecked implementation tasks exist because zero implementation tasks were planned.

Completion is proven instead by executed evidence:

- Verify report completeness table: 9/9 DONE (COMP-1…8 placement + fx narrowing + guard test 7/7).
- Apply-progress polish (#969): 10-file scope fully green after polish (guard 7/7, tsc 0, eslint 0/0, prettier 10/10 clean).
- No stale checkboxes can exist; the archived audit trail contains no unchecked tasks.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| — | None | No delta specs exist in `openspec/changes/warnings-pr-followup/specs/` (guard-test-as-spec pattern). No merge performed; no main spec touched. |

Main specs already reflect the parent change (`warnings-smells-cleanup` synced 4 domains on 2026-09-06). This follow-up adds no requirements — ticket-disables and the fx narrowing are implementation-level, covered by the guard test. `rules.archive` "warn before destructive merge": not triggered (nothing merged). `rules.archive` "database.types.ts regenerated / Zod synced": N/A — no schema change; `database.types.ts` regen explicitly excluded per orchestrator decision.

## Final State (post-polish, per orchestrator context)

- 8 COMP ticket-disables placed + justified (COMP-1…8, each directly above its flagged function, ticket + pre-existing value carried).
- fx `rows as never` narrowed via `toTypedSupabase`/`isRecord` (`rows.filter(isRecord)` boundary; zero `as never` lines).
- Guard: 7/7 (`tests/unit/t-warnings-followup.test.ts`, unedited at verify; re-run green after polish).
- `npx tsc --noEmit`: 0 errors.
- `npx eslint` on the 10 follow-up files: 0 errors, 0 warnings (1 pre-polish `sort-imports` error in `fx/route.ts` fixed by import reorder).
- `npx prettier --check` on the 10 follow-up files: clean (8/10 pre-polish drift reformatted; `fx/route.ts` + guard test already clean).
- Nothing staged/committed (verified at both verify and polish time).

## Decisions Log (orchestrator decisions — recorded, NOT re-litigated)

1. **size:exception GRANTED for PR-S1** — conditional on S1-isolated stack + per-file hunk review.
2. **complexity → ticket-disables** — refactor deferred to follow-up tickets COMP-1…8 (this change implements exactly that).
3. **keepalive `?secret=` removal** — tightening; note in PR-S3 description.
4. **PR-S2 excludes `database.types.ts` regen** — DB-SYNC drift belongs elsewhere.
5. **PR-S3 combined slice-B owner review** — shared `proxy.ts`.
6. **Full suite pre-merge required** — sharded/longer-timeout recommended (suite exceeds 120s single-shot; 3 timing flakes pass 15/15 in isolation, unrelated).
7. **Repo-wide eslint/prettier gates red independent of follow-up** — 160 pre-existing errors noted, not attributed to this change.

## PR-Cut Sequence (orchestrator cuts — archive does NOT create PRs/commits)

- Isolated stacks PR-S0 → PR-S1 → PR-S2 → PR-S3 to main, in sequence (boundaries per parent archive report 2026-09-06).
- Follow-up hunks ride with their owning PRs, or as one micro-PR at orchestrator discretion. Archive performed zero git operations.

## Release Condition

- size:exception granted (PR-S1, conditional above) ✅
- Complexity gate satisfied via COMP-1…8 ticket-disables ✅ (this follow-up)
- Full suite + staging probes pre-merge REQUIRED ⏳ (orchestrator gate at merge time)
- Repo-wide lint/format gates remain red from pre-existing drift — not attributed to this change; merge decision owns that tension.

## Archive Contents

- proposal.md — intentionally absent (deviation recorded above)
- specs/ — intentionally absent (guard-test-as-spec)
- design.md — intentionally absent (S2 boundary reused)
- tasks.md — intentionally absent (no planning phase; gate vacuous pass)
- verify-report.md ✅ (PASS WITH WARNINGS, CRITICAL: None)
- archive-report.md ✅ (this file)
- Active `openspec/changes/warnings-pr-followup/` removed ✅
