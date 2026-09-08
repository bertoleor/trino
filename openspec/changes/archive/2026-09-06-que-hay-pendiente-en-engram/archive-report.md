# Archive Report: que-hay-pendiente-en-engram

**Change**: `que-hay-pendiente-en-engram` (Clear Pending Work)
**Archived**: 2026-09-06 → `openspec/changes/archive/2026-09-06-que-hay-pendiente-en-engram/`
**Mode**: both (Engram `sdd/que-hay-pendiente-en-engram/archive-report` + OpenSpec filesystem archive)
**Verdict**: ARCHIVED as **intentional-with-warnings** (orchestrator-approved partial: task 3.2 staging curl deferred to deploy; no CRITICAL behavioral issues)
**security-csp-nonce folder**: NOT touched — its separate archive is a follow-up; this change only unblocks it (slice-1 verify PASS WITH WARNINGS).

## Artifact Traceability (Engram observation IDs)

| Artifact | Engram ID | Filesystem |
|----------|-----------|------------|
| explore | #904 (`sdd/que-hay-pendiente-en-engram/explore`) | `exploration.md` |
| proposal | #905 (`sdd/que-hay-pendiente-en-engram/proposal`) | `proposal.md` |
| spec | #906 (`sdd/que-hay-pendiente-en-engram/spec`) | `specs/security-resilience/spec.md`, `specs/change-hygiene/spec.md` |
| design | #907 (`sdd/que-hay-pendiente-en-engram/design`) | `design.md` |
| tasks | #908 (`sdd/que-hay-pendiente-en-engram/tasks`) | `tasks.md` (reconciled, see below) |
| apply-progress | #909 (`sdd/que-hay-pendiente-en-engram/apply-progress`) | n/a (Engram-only; resolves slice-1 verify C-1 process gap) |
| verify-report | #910 (`sdd/que-hay-pendiente-en-engram/verify-report`) | `verify-report.md` (+ Appendix S2) |
| init | #827 (`sdd-init/santisima-trinidad`, hybrid/both) | `openspec/config.yaml` |
| archive-report | this report | `archive-report.md` (this file) |

## Task Completion Gate — Reconciliation Record

Persisted `tasks.md` showed stale unchecked boxes for completed work. Exceptional mechanical
reconciliation performed at archive time with orchestrator approval ("close the change per
SKILL.md", both slices PASS WITH WARNINGS, warnings carried by name) and proof from
apply-progress (#909) + verify-report (#910 + `verify-report.md`):

- **3.1 → [x]**: stale. Verify proves full suite 399/399 (83 files) + build 75/75 + tsc 0 + eslint 0.
- **3.3 → [x]**: stale. Verify verdict PASS WITH WARNINGS satisfies the gate; PR1 boundary
  (start = static CSP, finish = nonce live + green, rollback = revert PR1) recorded.
- **3.2 → [ ] KEPT UNCHECKED, annotated DEFERRED**: genuinely pending, not stale. Staging
  `curl -sI` (single CSP, `x-nonce`⇔CSP match, zero console violations) cannot run in sandbox;
  static + unit + build evidence holds (exactly-one emission asserted, global CSP removed,
  static routes pinned). **Must run at staging deploy** before final sign-off if the team gate
  requires it. This single deferral is the reason for the intentional-with-warnings marking.
- **Phase 4 (4.1–4.3)**: all [x], each substantively confirmed by Appendix S2.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| security-resilience | Updated | 1 ADDED requirement (CSP Nonce Close-Out Verification, 3 scenarios); all prior requirements preserved |
| change-hygiene | Created | Full spec copied from delta (2 requirements, 3 scenarios); no prior main spec existed |

Source of truth updated:
- `openspec/specs/security-resilience/spec.md`
- `openspec/specs/change-hygiene/spec.md`

Merge is purely additive — no destructive delta, no `rules.archive` warning triggered
(`database.types.ts`/Zod rule N/A: no schema changes in this change).

## Final State (uncommitted — PR boundaries for orchestrator, nothing staged/committed by archive)

- **PR1 (slice 1, CSP nonce close-out)**: 6 impl files
  (`src/proxy.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/providers.tsx`,
  `src/lib/seo/json-ld.ts`, `src/lib/security/csp.ts` + 4 page wirings) + 3 suites
  (`t-csp-nonce-proxy`, `t-csp-nonce-layout`, `t-csp-drift-guard`: 23/23) + 4 pages.
  Slice-1 code uncommitted; suites green; `security-csp-nonce` archive now unblocked.
- **PR2 (slice 2, guarded delete)**: 15 paths under
  `openspec/changes/ecommerce-high-end-constitution/` removed (unstaged delete);
  archive `2026-09-04-ecommerce-high-end-constitution/` authoritative superset (21 files,
  15/15 raw byte-identical); restore proven via git blobs + archive fallback, not executed.

## Warnings Carried (do NOT fix in archive)

- **W-S2-1**: extra unstaged tracked deletion `openspec/changes/client-warnings-fix/tasks.md`
  outside the 15-path scope (recoverable, byte-identical to its archive copy).
  Disposition: exclude from PR2 or restore in follow-up.
- **W-S2-2**: `DOCS/checklist/01-complex-functions.md` lines 3/554 dangle at the deleted path.
  Disposition: repoint to `openspec/changes/archive/2026-09-04-ecommerce-high-end-constitution/tasks.md`
  in a follow-up docs change.
- **W-2 / 3.2**: staging curl single-CSP check deferred to deploy (see above).
- **Env note**: `pnpm` binary broken in sandbox; `npm`/`npx` equivalents used, tests unedited.
- Slice-1 verify C-1 (missing apply-progress TDD table) is process-only and now superseded:
  Engram apply-progress #909 contains the TDD Cycle Evidence table.

## Follow-ups (not this change)

1. Run staging `curl -sI` single-CSP / `x-nonce`⇔CSP / console-zero-violations check at deploy.
2. Repoint DOCS checklist lines 3/554 to the archive path.
3. Resolve `client-warnings-fix/tasks.md` attribution (exclude from PR2 or `git restore`).
4. Archive `security-csp-nonce` as its own follow-up cycle (readiness noted: slice-1 PASS WITH WARNINGS).

## Verification (Step 4)

- [x] Main specs updated correctly (additive only, prior requirements preserved)
- [x] Change folder moved to `openspec/changes/archive/2026-09-06-que-hay-pendiente-en-engram/`
- [x] Archive contains proposal, specs (2 domains), design, exploration, tasks (reconciled), verify-report, archive-report
- [x] Archived `tasks.md`: 3.1/3.3 reconciled with proof; 3.2 unchecked-but-deferred with explicit orchestrator approval recorded above
- [x] Active `openspec/changes/` no longer lists this change (only `archive/`, `security-csp-nonce/`)
- [x] `security-csp-nonce/` folder untouched; no git staging/commit/restore performed

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived (intentional-with-warnings
for the single deferred staging check). Ready for the next change.
