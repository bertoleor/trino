# Verification Report

**Change**: tooling-ci-regeneration
**Version**: Build Tooling Freshness (1 delta requirement, 4 scenarios)
**Mode**: Standard (Strict TDD signaled, but no apply-progress artifact with TDD Cycle Evidence table present — see Notes)

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 12 |
| Tasks complete (working tree) | 11 |
| Tasks incomplete | 1 (4.4 README trace note — no README artifact exists) |
| Task checkboxes in tasks.md | 0 checked / 12 unchecked (stale — see WARNING) |

## Build & Tests Execution

**Build**: ✅ Passed (75 pages, static + dynamic routes render without error)

**Type-check**: ✅ Passed — `npx tsc --noEmit` → 0 errors
```text
npx tsc --noEmit
TSC_EXIT=0
```

**Tests**: ✅ 376 passed / ❌ 0 failed / ⚠️ 0 skipped (80 files)
```text
pnpm test  (cross-env TEMP=E:/temp ... vitest run)
Test Files  80 passed (80)
     Tests  376 passed (376)
```

**Coverage**: 58.13% statements / 61.49% lines → ✅ Above threshold (≥35% hold, ≥58% target held exactly)
```text
Statements : 58.13% (475/817)
Lines      : 61.49% (428/696)
```

**Lint**: ❌ FAILED — 1 error
```text
pnpm lint  →  eslint
src/types/database.types.ts
  152:1  error  File has too many lines (542). Maximum allowed is 150  max-lines
✖ 1 problem (1 error, 0 warnings)
```

## Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Deterministic Build Tooling Freshness Gate | 1. Types regeneration diff-clean + type-safe | `t-tooling-types.test.ts` (8 tests: >500 lines, entitlements 4-tier, has_role, customer_360, get_customer_360, search_vector, price_cents) | ✅ COMPLIANT (tsc 0; file 546 lines) |
| (same) | 2. LHCI asserts performance+pwa 0.9 | `t-lhci.test.ts` (perf error 0.9, pwa warn 0.9, LCP/CLS/INP error, url /es-AR/tienda, ci.yml lhci autorun --assert --upload) | ✅ COMPLIANT (pwa staged `warn` — allowed by spec "MAY be staged") |
| (same) | 3. Supabase toolchain version-pinned | (no covering test) | ❌ UNTESTED — but static evidence confirms: `config.toml` major_version=15, `migrate-preview.yml` setup-cli `1.142.2` |
| (same) | 4. Drift guard rejects stale types | `t-lhci.test.ts` (ci.yml gen types --local + diff --exit-code) | ✅ COMPLIANT |

**Compliance summary**: 3/4 scenarios compliant (1 UNTESTED but statically implemented)

## Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Regenerate database.types.ts post-0022 | ✅ Implemented | 546 lines, contains entitlements (4-tier CHECK), has_role, customer_360, get_customer_360, search_vector tsvector, price_cents |
| tsc 0 errors | ✅ Implemented | `npx tsc --noEmit` exit 0 |
| lighthouserc.json assert 0.9 + pwa | ✅ Implemented | performance `error 0.9`, pwa `warn 0.9`, LCP/CLS/INP `error`, numberOfRuns 3, url /es-AR/tienda |
| ci.yml workflow | ✅ Implemented | 3 jobs (build-lint-test, types-drift, lighthouse) with tsc/eslint/vitest/build/lhci autorun --assert --upload/drift guard |
| config.toml major_version=15 | ✅ Implemented | `[db] major_version = 15`, project_id, ports |
| setup-cli pinned semver | ✅ Implemented | `migrate-preview.yml` `version: 1.142.2` (not latest) |
| Relax t-a05 budget | ✅ Implemented | `<=800` budget assertion |

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| AD-01 gen types --local (not --linked) | ✅ Yes | `gen:types` script uses `--local --schema public`; ci.yml drift guard uses `--local` |
| AD-02 lhci autorun --assert --upload | ✅ Yes | ci.yml lighthouse job runs `lhci autorun --assert --upload.target=temporary-public-storage` |
| AD-03 config.toml major_version=15 + setup-cli semver | ✅ Yes | both pinned as designed |
| Test naming .spec.ts → .test.ts | ✅ Yes | tasks.md risk note corrected; files are `.test.ts` matching Vitest glob |

## Issues Found

**CRITICAL**:
1. `pnpm lint` FAILS: regenerated `src/types/database.types.ts` (542 lines) exceeds the `max-lines: 150` eslint rule in `eslint.config.mjs`. The design/tasks declared the generated file "exempt from 400 budget" (PR review budget) but never added an eslint override/ignore for the generated file. This breaks: (a) task 4.3 `pnpm lint 0`, (b) proposal success criteria `pnpm lint 0/0`, (c) the `ci.yml` `Lint` step (`pnpm eslint .`) — the entire CI gate will fail on every PR. No globalIgnores entry or per-file `max-lines` override exists for `src/types/database.types.ts`.

**WARNING**:
1. `tasks.md` shows all 12 checkboxes `- [ ]` unchecked, and no `apply-progress` artifact exists — task completion is not recorded in the tracked artifacts despite work being present in the working tree. This blocks clean archive gating (stale-checkbox reconciliation not yet done).
2. Task 4.4 (README trace note → BUILD TOOLING FRESHNESS) appears incomplete — no README artifact in `openspec/changes/tooling-ci-regeneration/`.
3. Scenario 3 (toolchain pin) has no covering test — implemented and statically correct, but not runtime-asserted (suggestion-level, since no test was scoped for it).
4. Git state: all work is UNCOMMITTED in the working tree (HEAD still `dcb9a84`). No commit/PR exists yet ("PR1 complete" per dependency note refers to working tree, not committed history).

**SUGGESTION**:
1. Add `src/types/database.types.ts` to `globalIgnores` (or a targeted `max-lines: off` override) in `eslint.config.mjs`, mirroring the existing `.next/**`, `next-env.d.ts` ignores.

## Strict TDD Note

Strict TDD was signaled (`cross-env TEMP=E:/temp vitest run`). The strict-tdd-verify module was reviewed but NOT fully applied because no `apply-progress` artifact with a "TDD Cycle Evidence" table exists for this change. TDD evidence (RED→GREEN cycle) is therefore unverifiable from artifact trail; test files do exist and pass (376 green) and cover scenarios 1, 2, 4 with triangulation ≥3. If Strict TDD compliance must be enforced, the missing apply-progress TDD evidence table is itself a CRITICAL gating gap to report back to the orchestrator.

## Verdict

**FAIL**

`pnpm lint` fails on the regenerated `database.types.ts` (max-lines 150 exceeded), which breaks the declared lint-0 gate and the ci.yml Lint step. Fix (eslint ignore/override for generated file) is required before archive.