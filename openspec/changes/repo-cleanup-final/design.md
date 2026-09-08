# Design: repo-cleanup-final

## Technical Approach

Mechanical-first, stacked T1→T5 to main. T1/T2 are zero-semantic (import sort, format) with `size:exception`; T3/T4 are manual per-site fixes sequenced after the mechanical baseline; T5 is list-only (no destructive apply). Each slice is independently verifiable and rollbackable via worktree-only `git checkout -- <paths>`; NO commit until all slices verify PASS. Tooling runs via npm/npx (pnpm binary broken per init).

## Architecture Decisions

| # | Option A vs B | Tradeoff | Decision + rationale |
|---|---|---|---|
| D1 T1 scope | Full `eslint --fix` vs rule-scoped fix | Full fix risks semantic drift beyond spec | Rule-scoped: `--fix` limited to `sort-imports` + `@typescript-eslint/consistent-type-imports`; dry-run `--fix-dry-run` first to count (~159). Rationale: matches T1 spec, keeps diff import-only. |
| D2 T2 scope | Repo-wide `prettier --write .` vs touched-scope | Repo-wide churns archive history (250 files) | Touched-scope only: the ~81 `git status` modified paths + `config.yaml`; archives excluded. Rationale: reviewable slices, no history churn. |
| D3 `.prettierignore` | Exclude nothing vs exclude archives+generated | Excluding too much hides drift; too little churns reports | Add `openspec/changes/archive/**`, `openspec/**/verify-report*.md`, `sdd/**`, `DOCS/**`, keep existing build/lock entries. Rationale: archived reports are immutable history. |
| D4 `config.yaml:30` | Rewrite `apply:` block vs minimal indent repair | Rewrite risks schema drift | Minimal repair: convert `tdd: true` + `test_command` into list items (`- tdd: true`) since `apply:` is a YAML sequence; then prove with a YAML parse + prettier read. Rationale: smallest diff unblocking tooling. |
| D5 T3 COMP reconcile | Re-ticket all 6 vs reconcile table | Double-ticketing wastes review | Reconcile table maps 6 live complexity sites against 8 existing COMP tickets 1:1 (reuse/close extras). Non-null (30): guard/`?.` fix per class, ticket-justify only with budget. Rationale: no double-ticket per spec. |
| D6 T4 narrowing | Inline casts vs shared boundary | Inline repeats `as never` smell | Reuse `TypedSupabase`/`isRecord` boundary; zod-governed cultura sites keep fixtures green first. Rationale: follows existing patterns in `src/lib/supabase/*`. |
| D7 T4 proxy catches | Silent catch vs fail-closed+logger | Fail-open is the current security hole (4 sites: `checkHasRole`, `logRbacDeny`×2, entitlements fallback) | Fail-closed + `logger.error` (no secrets), read worktree+HEAD `proxy.ts` first, preserve slice-B logic, co-review note. Rationale: spec mandates deny-by-default. |
| D8 T5 gate | Apply dispositions vs list-only | Any delete/rename without approval risks DOCS loss | List-only: quarantine table with `approval=UNAPPROVED` default; apply limited to table creation + keep-class actions. Rationale: explicit orchestrator constraint. |

## Data Flow

```
T1 (import sort, suite-green proof) ──→ T2 (config fix + prettier touched, --check proof)
  ──→ T3 (complexity/non-null, lint-gate proof) ──→ T4 (casts/proxy/splits, fixture+suite proof)
    ──→ T5 (quarantine table, content-gate proof) ──→ stacked-to-main (no commit until ALL PASS)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/**` (~60 files, import-only) | Modify | T1 `sort-imports` reorder; zero-semantic |
| `openspec/config.yaml` | Modify | T2 `:30` indent repair (`- tdd: true`) |
| `.prettierignore` | Modify | T2 archive/generated exclusions |
| `src/**` touched scope | Modify | T2 `prettier --write` in-scope only |
| 6 complexity sites (`src/proxy.ts`, rates/audit routes, `getCustomer360`, `emit`) | Modify | T3 refactor or COMP-ticket cite |
| 30 non-null sites | Modify | T3 guard/`?.` or justified ticket |
| 10 `as never` sites | Modify | T4 typed narrowing via shared boundary |
| `src/proxy.ts` (4 catches) | Modify | T4 fail-closed + logger, slice-B sequenced |
| `src/app/api/admin/shipping/batch/route.ts` (161), `tests/unit/t-c04-proxy.test.ts` (152) | Modify/split | T4 split with named modules or justify+ticket; `database.types.ts` exempt (regen cmd) |
| `openspec/changes/repo-cleanup-final/quarantine.md` (new) | Create | T5 per-path table only |

## Interfaces / Contracts

Quarantine row: `| path | class (DOCS/sdd/archive-rename/untracked) | proposed disposition (keep/delete/rename) | recoverability (git-recoverable/irreversible) | approval (UNAPPROVED default) |`. Fail-closed catch pattern (only non-obvious snippet):

```ts
catch (err) { logger.error("proxy_deny", { path }); return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
```

## Testing Strategy

| Slice | RED-first guards | Verify commands | Bounds (start/finish/rollback) |
|---|---|---|---|
| T1 | `t-cleanup-guard`: `eslint --fix-dry-run` count = pre-count; suite pass-count before/after identical (any delta = STOP) | `npx eslint . ; npm test ; git diff --stat` | Start: dirty baseline recorded. Finish: 0 sort/type-import errors + suite-green. Rollback: `git checkout -- <T1 files>` |
| T2 | Content guard: `prettier --check` on scope; YAML parse of `config.yaml` | `npx prettier --check <scope> ; npx prettier --write <scope>` then re-check | Start: T1 green. Finish: touched `--check` green, archives untouched. Rollback: revert scope files + `.prettierignore` |
| T3 | Lint-gate guards per site (complexity<12, zero non-null-warn or COMP cite) | `npx eslint <sites> ; npm test` | Start: T2 green. Finish: 6+30 resolved or ticketed, reconcile table 1:1. Rollback: revert site files |
| T4 | Fixture-first: cultura zod fixtures green before narrowing; proxy deny tests (403 + logger, no secret leak) | `npm test tests/unit/t-c04-proxy.test.ts ; npx tsc --noEmit` | Start: T3 green. Finish: 0 `as never`, 4 catches fail-closed, splits ≤150 or justified. Rollback: revert slice files; slice-B logic preserved |
| T5 | Content guard: every row has all 5 columns, all `UNAPPROVED`; tree-diff empty after apply | `git status --porcelain` unchanged except `quarantine.md` | Start: T4 green. Finish: table complete (DOCS/DOCS, `sdd/`, 17 archive-renames, 33 untracked). Rollback: delete `quarantine.md` |

`size:exception` used for T1/T2 only (mechanical, proven zero-semantic). T3–T5 stay within review budget via per-site splits.

## Migration / Rollout

No migration, no feature flags. Stacked-to-main `force-chained`, review budget 800, gate: NO commit until all slices verify PASS. Per-slice rollback is worktree-only revert; nothing pushes until the full stack is green.

## Open Questions

- [ ] `security-csp-nonce/` fate in T5 table: keep vs repoint (needs user approval — defaults UNAPPROVED)?
- [ ] COMP ticket IDs for the 8-vs-6 reconcile — reuse which IDs, close which extras?
- [ ] Oversized split module names for `batch/route.ts` (e.g. `batch/validate.ts` + `batch/execute.ts`) — accept or justify-in-place?
