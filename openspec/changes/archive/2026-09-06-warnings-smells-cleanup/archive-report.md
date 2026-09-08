# Archive Report: warnings-smells-cleanup

**Change**: warnings-smells-cleanup
**Archived**: 2026-09-06 → `openspec/changes/archive/2026-09-06-warnings-smells-cleanup/`
**Verdict**: All four slices verified PASS WITH WARNINGS. Zero CRITICAL issues. SDD cycle complete.
**Mode**: both (OpenSpec filesystem + Engram) — NO git stage/commit performed by archive.

## Engram Traceability (observation IDs)

| Artifact | Topic key | ID |
|----------|-----------|----|
| init | sdd-init/santisima-trinidad | #827 |
| explore | sdd/warnings-smells-cleanup/explore | #926 |
| proposal | sdd/warnings-smells-cleanup/proposal | #929 |
| spec (4 domains) | sdd/warnings-smells-cleanup/spec | #932 |
| design (S0–S3 stacked) | sdd/warnings-smells-cleanup/design | #934 |
| tasks (force-chained) | sdd/warnings-smells-cleanup/tasks | #935 |
| apply-progress (S0+S1+S2+S3 merged) | sdd/warnings-smells-cleanup/apply-progress | #938 |
| verify-report (S0+S1+S2+S3 merged) | sdd/warnings-smells-cleanup/verify-report | #939 |

## Task Completion Gate

All 21 implementation tasks `[x]`: 0.1–0.6 (S0), 1.1–1.6 (S1), 2.1–2.4 (S2), 3.1–3.5 (S3).
The single unchecked box in `tasks.md` is the Global gate "NO commit until S0→S3 all verify PASS"
— a commit gate, not implementation work. It held through archive (nothing staged at close).

## Specs Synced (ADDITIVE-only, normative preserved)

| Domain | Action | Details |
|--------|--------|---------|
| tooling-config | Created | NEW main spec `openspec/specs/tooling-config/spec.md` (5 requirements, 8 scenarios, S0 full spec) |
| cultura-blog | Updated | 4 ADDED (body strictness, void-bait removal, disable triage, empty-catch logging) |
| observability-health | Updated | 2 ADDED (converted-catch logging contract, segment error/loading coverage) |
| security-resilience | Updated | 2 ADDED (cron fail-closed + dev fallback, proxy.ts void remediation) |

No MODIFIED/REMOVED/RENAMED deltas existed — merge is purely additive, non-destructive
(`rules.archive` "warn before destructive merge": not triggered).
`rules.archive` "database.types.ts regenerated / Zod synced": N/A — no DB schema change;
`database.types.ts` deliberately untouched by S2 (DB-SYNC drift belongs to another slice);
cultura Zod strictness is validation-layer only, covered by fixtures-first gate (t-e02/t-e04/t-e05 9/9).

## Slice Results (all uncommitted, nothing staged)

- **S0 tooling baseline**: t-s0 16/16, hook staged-only proven, ~120 lines → PR-S0 → main.
- **S1 hygiene**: t-s1 7/7, fixtures 9/9, full 86f/450t, ~1407 lines → PR-S1 → main (after S0).
- **S2 casts/segments**: t-s2 11/11, full 87f/461t, 131+/48- → PR-S2 → main (after S1).
- **S3 security**: t-s3 9/9, full 88f/470t, ~150 lines, slice-B preserved → PR-S3 → main (after S2/B).

## PR Boundaries (stacked-to-main, force-chained)

- PR-S0: S0 tip; rollback = revert S0 files + `pnpm remove husky lint-staged`.
- PR-S1: start = S0 tip; rollback = revert 31 tracked S1 files + delete t-s1 test (S0 stays).
- PR-S2: start = S1 tip; rollback = revert 8 tracked + delete 4 new S2 files (S0/S1 stay).
- PR-S3: start = S2 tip; rollback = revert 3 cron routes + 4 proxy.ts hunks + delete `auth.ts` + t-s3 test (reverse S3→S2→S1).

## Carried Warnings / Decisions (recorded, NOT fixed by archive)

1. **PR-S1 size:exception** — recommended CONDITIONAL on PR-S1 cut from an S1-isolated stack with per-file-hunk review (bulk is touch-only prettier normalization). NOT granted by verify; pending orchestrator grant.
2. **complexity-warn vs CI `--max-warnings 0` tension** — S1 6 + S2 2 carried pre-existing warns will flag the S0 CI drift gate on touched files. Orchestrator choice: (a) refactor, (b) ticket-justified disables, or (c) scope gate to errors-only for pre-existing-warn lines.
3. **Isolated-stack PR cutting** — PR-S1/S2/S3 MUST be cut from isolated stacks: exclude foreign hunks (CSP-nonce/perf slices on S1 paths), exclude `database.types.ts` regen from PR-S2, exclude slice-B hunks from PR-S3 unless combined review.
4. **keepalive `?secret=` removal** — tightening (query secrets leak in logs); external callers relying on it → 401. Note in PR-S3 description.
5. **Combined slice-B owner review for PR-S3** (shared `proxy.ts`).
6. **TDD-table formalities** (S0–S3 informal RED→GREEN records), **fx `rows as never` follow-up** (last S3-owned remainder), **full suite pre-merge required**.

## NO-Commit-Gate Release Condition

Commit allowed ONLY after orchestrator: (1) grants PR-S1 size:exception, (2) adjudicates
complexity-gate tension, (3) full suite pre-merge green, (4) PRs cut from isolated stacks
per boundaries above, in sequence PR-S0 → PR-S1 → PR-S2 → PR-S3.

## Archive Contents

- proposal.md ✅ (untouched, drift recorded in specs per design)
- specs/ (4 domains) ✅
- design.md ✅
- tasks.md ✅ (21/21 implementation tasks complete; global commit gate held)
- exploration.md ✅
- verify-report.md ✅ (S0+S1+S2+S3, CRITICAL: None)
- Active `openspec/changes/warnings-smells-cleanup/` removed ✅
