# Proposal: repo-cleanup-final

## Intent

114 dirty entries plus 195 eslint problems and 250 prettier-drifted files block a reviewable stack. Reach strict-eslint-green + clean tree so T1→T5 (stacked-to-main) and the CI drift gate are trustworthy.

## Scope

### In Scope
- T1: `eslint --fix` sort-imports (156) + consistent-type-imports (3), mechanical only
- T2: prettier sweep + fix `openspec/config.yaml:30` YAML error; archives excluded via `.prettierignore`
- T3: 6 complexity refactors + 30 non-null fix-or-justify + COMP-ticket reconcile (8 vs 6)
- T4: 10 `as never` narrowings, 4 `src/proxy.ts` fail-open catches, split-or-justify 2 oversized files
- T5: QUARANTINE LIST ONLY — per-path delete/rename/keep table

### Out of Scope
- Behavior changes; refactor beyond the 2 splits; reformatting archived reports
- Commits (NO commit until all slices verify PASS); T5 apply without per-path approvals

## Capabilities

### New Capabilities
- None — pure hygiene, no new behavior.

### Modified Capabilities
- `tooling-config`: import order, prettier baseline, complexity/non-null gates
- `change-hygiene`: stale-duplicate/archive-readiness, DOCS repoint
- `security-resilience`: `proxy.ts` fail-open catches → real handling

## Approach

Mechanical-first T1→T5, each verifiable. T1/T2 request `size:exception` (mechanical, zero-semantic). T2 decision: `archive/**` + `sdd/**` excluded — churning history is out. T4 proxy work coordinated with slice-B owner. T5 needs explicit per-path approval before apply.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/**` (~60 files) | Modified | Import sort; warning + smell fixes |
| `openspec/config.yaml:30` | Modified | YAML indent fix (blocks parsing) |
| `.prettierignore` | Modified | Exclude generated + archived reports |
| `DOCS/`, `sdd/`, `openspec/changes/archive/` | Listed only | T5 quarantine table |
| `batch/route.ts`, `t-c04-proxy.test.ts` | Modified | Split-or-justify (>150 lines) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| T1/T2 exceed 400 lines | High | `size:exception`, mechanical-only proof |
| Reorder friction on 81 modified files | Med | T1 before any commit; suite green |
| History churn via prettier | Low | `.prettierignore` excludes archives |
| DOCS content loss | Low | Per-path approval; git-recoverable |

## Rollback Plan

Per-slice `git checkout -- <paths>`; worktree-only since nothing commits until all slices verify PASS.

## Dependencies

- S0 strict `eslint.config.mjs` + CI drift gate (in tree); slice-B owner state for `proxy.ts`
- Cost-zero: no new deps or services. Constitution: zero-warnings gate, 150-line limit, staged-only hooks.

## Success Criteria

- [ ] `tsc` 0 errors; `eslint .` 0 errors 0 warnings
- [ ] `prettier --check` green; `config.yaml` parses
- [ ] T5 table complete; zero unapproved destructive actions
- [ ] All slices verify PASS before any commit

## Proposal question round

Non-interactive: confirm (1) `size:exception` T1/T2, (2) archive exclusion, (3) `security-csp-nonce/` fate, (4) T5 approvals. Assumed: exclusion ok; T5 list-only.
