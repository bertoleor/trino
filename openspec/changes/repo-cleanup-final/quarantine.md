# Quarantine Table: repo-cleanup-final (T5 — table only, no destructive apply)

> **Gate**: every row `approval=UNAPPROVED`. Zero deletes/renames executed.
> Tree-diff after this slice MUST show only `quarantine.md` (inside the already-untracked
> `openspec/changes/repo-cleanup-final/` dir) plus `tasks.md` evidence as new.
> **Strict TDD**: ACTIVE but N/A-by-nature for a docs-table slice (no executable behavior;
> no RED/GREEN cycle applies). The enforced executable gate is instead the spec's
> content gate: every row carries all five columns with `approval=UNAPPROVED`, and
> zero destructive ops are proven by the `git status --porcelain` baseline-vs-post diff
> in the proof section below. No silent fallback — this substitution is explicit.

Baseline (pre-run, 2026-09-07): `M=171 / D=16 / ??=38 / total=225` porcelain lines.
Deltas vs exploration (114 entries: 81 modified, 17 deletions, 33 untracked): the tree grew
through verified T1–T4 slices (more modified files, 5 new guard tests, T4 helpers).
Deletion count 17→16: current `git status` shows exactly the 16 paths in Table A.

## Table A — archive-rename deletions (unstaged deletions, counterpart: `openspec/changes/archive/`)

| path                                                                                     | class                   | proposed disposition                                      | recoverability                                                   | approval   |
| ---------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| `openspec/changes/client-warnings-fix/tasks.md`                                          | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable (blob in HEAD; `git checkout -- <path>` restores) | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/apply-progress.md`                     | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/design.md`                             | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/exploration.md`                        | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/proposal.md`                           | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/admin-backoffice/spec.md`        | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/concurrency-inventory/spec.md`   | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/ecom-engine/spec.md`             | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/i18n-routing/spec.md`            | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/money-arithmetic/spec.md`        | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/observability-health/spec.md`    | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/payments/spec.md`                | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/performance-scalability/spec.md` | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/security-resilience/spec.md`     | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/specs/shipping-carriers/spec.md`       | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |
| `openspec/changes/ecommerce-high-end-constitution/tasks.md`                              | archive-rename-deletion | rename (stage as rename into `openspec/changes/archive/`) | git-restorable                                                   | UNAPPROVED |

## Table B — untracked-keep, slice-owned (KEEP confirmed, no action executed)

| path                                     | class          | proposed disposition                     | recoverability                                               | approval   |
| ---------------------------------------- | -------------- | ---------------------------------------- | ------------------------------------------------------------ | ---------- |
| `.editorconfig`                          | untracked-keep | keep (confirm only — no action executed) | IRREVERSIBLE-needs-approval (no git blob; kept, not touched) | UNAPPROVED |
| `.github/workflows/ci.yml`               | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `.husky/`                                | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `.vscode/`                               | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `openspec/specs/`                        | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/app/[locale]/admin/error.tsx`       | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/app/[locale]/admin/loading.tsx`     | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/app/api/internal/`                  | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/lib/cron/`                          | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/lib/proxy/`                         | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/lib/security/`                      | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `src/lib/supabase/typed.ts`              | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `supabase/config.toml`                   | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-csp-drift-guard.test.ts`   | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-csp-nonce-layout.test.ts`  | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-csp-nonce-proxy.test.ts`   | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-imports-guard.test.ts`     | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-lhci.test.ts`              | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-perf-hygiene.test.ts`      | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-prettier-guard.test.ts`    | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-s0-tooling-config.test.ts` | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-s1-hygiene.test.ts`        | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-s2-casts-segments.test.ts` | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-s3-cron-proxy.test.ts`     | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-tooling-types.test.ts`     | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-warnings-followup.test.ts` | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-warnings-t3-guard.test.ts` | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |
| `tests/unit/t-warnings-t4-guard.test.ts` | untracked-keep | keep (confirm only)                      | IRREVERSIBLE-needs-approval                                  | UNAPPROVED |

## Table C — untracked-triage / nesting-smell (needs per-path user sign-off, no action executed)

| path                                   | class            | proposed disposition                                                             | recoverability                                                     | approval   |
| -------------------------------------- | ---------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| `DOCS/DOCS/`                           | nesting-smell    | confirm-with-user (denest/normalize only with approval; NEVER delete unapproved) | IRREVERSIBLE-needs-approval (user-authored, incl. non-ASCII names) | UNAPPROVED |
| `DOCS/PLANS/`                          | nesting-smell    | confirm-with-user                                                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `DOCS/ROADMAP-NEXT-SDD.md`             | nesting-smell    | confirm-with-user                                                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `DOCS/catalog/`                        | nesting-smell    | confirm-with-user                                                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `DOCS/checklist/`                      | nesting-smell    | confirm-with-user                                                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `DOCS/legal/`                          | nesting-smell    | confirm-with-user                                                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `openspec/changes/security-csp-nonce/` | untracked-triage | confirm-with-user (active change or archive candidate?)                          | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `openspec/changes/archive/`            | untracked-triage | confirm-with-user (accept as rename target for Table A)                          | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `sdd/`                                 | untracked-triage | confirm-with-user (keep both stores; document Engram-mirror purpose)             | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |
| `openspec/changes/repo-cleanup-final/` | untracked-triage | keep (this change's own dir; contains this table)                                | IRREVERSIBLE-needs-approval                                        | UNAPPROVED |

## Table D — generated + slice-owned modified (KEEP confirmed, no action executed)

| path                                                                                      | class       | proposed disposition                                                     | recoverability                        | approval   |
| ----------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ | ------------------------------------- | ---------- |
| `pnpm-lock.yaml` (tracked, modified)                                                      | generated   | keep (confirm only; regen via install — pnpm binary broken, use npm/npx) | regenerable-with-command              | UNAPPROVED |
| `src/types/database.types.ts` (tracked, modified, 551 lines)                              | generated   | keep (confirm only; exempt from 150-line limit; regen `pnpm gen:types`)  | regenerable-with-command              | UNAPPROVED |
| 169 further tracked-modified slice-owned paths (T1–T4 verified work: tooling, src, tests) | slice-owned | keep (confirm only — verified green, NO-commit gate holds)               | git-restorable (HEAD + worktree diff) | UNAPPROVED |

## Row counts by class / disposition

| class                   | rows   | disposition split                                                  |
| ----------------------- | ------ | ------------------------------------------------------------------ |
| archive-rename-deletion | 16     | rename ×16                                                         |
| untracked-keep          | 28     | keep ×28                                                           |
| untracked-triage        | 4      | confirm-with-user ×3, keep ×1                                      |
| nesting-smell           | 6      | confirm-with-user ×6                                               |
| generated               | 2      | keep ×2                                                            |
| slice-owned (grouped)   | 1      | keep ×1                                                            |
| **Total**               | **57** | keep ×31, rename ×16 (unexecuted), confirm-with-user ×9, delete ×0 |

## Zero-destruction proof

- Pre-run baseline saved to `C:\OPENCO~1\opencode\t5-baseline.txt` (225 porcelain lines).
- Post-run check: `git status --porcelain` diffed against baseline — the ONLY delta is
  `quarantine.md` appearing inside the already-untracked `openspec/changes/repo-cleanup-final/`
  dir (porcelain `??` line for the dir is byte-identical before/after) plus `tasks.md`
  evidence edits inside the same untracked dir (invisible to tracked `git diff`).
  No `D` (delete) and no `R` (rename) entries were produced by this slice; no tracked file
  was modified (verified via `git diff --stat` on tracked paths — T1–T4 work only).
- Rollback: delete `quarantine.md`.

## T5 approval handoff — per-path questions for the user

1. Table A (16 paths): approve staging each deletion as a rename into
   `openspec/changes/archive/` (preserves history via rename detection)? Approve all, or
   list exceptions by path.
2. `DOCS/DOCS/`: approve denesting (move contents up to `DOCS/`) and normalizing the
   non-ASCII/spaced/uppercase names (`AGENT CONSTITUTION.MD`, `bahaus y neo bahaus.md`,
   `marca.md`, `Plan *. MD`)? Or keep the nesting as-is?
3. `DOCS/PLANS/`, `DOCS/ROADMAP-NEXT-SDD.md`, `DOCS/catalog/`, `DOCS/checklist/`,
   `DOCS/legal/`: keep untouched, repoint elsewhere, or schedule for a later docs pass?
4. `openspec/changes/security-csp-nonce/`: is this an ACTIVE change (keep) or an archive
   candidate (stage as rename into `openspec/changes/archive/`)?
5. `openspec/changes/archive/`: confirm as the rename target for Table A?
6. `sdd/` (Engram artifact mirror): confirm dual-store (keep both, document purpose) — yes/no?
7. Table B + Table D keep rows: confirm keep (no-op acknowledgment; nothing to execute)?
