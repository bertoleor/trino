# Proposal: tooling-ci-regeneration

## Intent
Bundle S-02/S-03 hygiene left as warnings in 2026-09-04 archive into one tooling-only PR. Fixes `database.types.ts` 33-line placeholder vs 0022 real schema (entitlements 4-tier CHECK, `has_role` DEFINER, pg_trgm GIN, `customer_360` VIEW → tsc false-green), enforces Lighthouse CI gate (lighthouserc.json has `performance: warn 0.9` but no `pwa 90` and no `ci.yml`), and pins Supabase image (`supabase/config.toml` missing, `setup-cli@latest` unpinned) to unblock P3 `k6` + `supabase-local` two-role RLS. Cost-zero, no product/migration/UI churn.

## Scope

### In Scope
- Regenerate `src/types/database.types.ts` via `supabase gen types typescript --local --schema public` post-0022 (gen-exempt from 400) + Zod sync check read-only on `src/lib/validations/*`
- Update `lighthouserc.json`: promote `categories:performance` `warn→error` 0.9, add `categories:pwa` `error` 0.9, keep LCP 2500 / CLS 0.1 / INP 200 `error`, `numberOfRuns: 3`, URL `http://localhost:3000/es-AR/tienda`
- New `.github/workflows/ci.yml`: checkout@v4 + pnpm setup + `tsc --noEmit` + `lint` + `vitest run` + `lhci autorun --assert --upload` + artifact; optional drift guard `gen types --local | diff --exit-code`
- New `supabase/config.toml`: `project_id = "santisima-trinidad"`, `[db] major_version = 15`, pinned `supabase/setup-cli@v1` semver (e.g. `1.142.2`) in `migrate-preview.yml`
- `package.json`: scripts `gen:types`, `lhci:assert`; devDep `@lhci/cli` pinned `0.14.x`
- Tests: `t-tooling-types.spec.ts` (entitlements/customer_360/has_role) + `t-lhci.spec.ts` (assertions shape) — TDD triangulation ≥3

### Out of Scope
- New capabilities, product features, migrations, UI/mobile 44px, `k6`/500 seeds, `ecommerce-client-v2` (backlog)
- CSP nonce (P2), P3 RLS/k6 harden, `budget.json`, accessibility/seo gates, external Lighthouse services

## Capabilities

> Contract with sdd-spec. Researched `openspec/specs/` (13 caps: performance-scalability, observability-health, etc.). No product requirement changes.

### New Capabilities
- None — tooling-only, build freshness gate; constitution allows `build-tooling` without new cap.

### Modified Capabilities
- None — `performance-scalability` already requires perf ≥90 and `observability-health` logger gates; LHCI/types enforcement is CI wiring, not spec behavior change. Optional 1-req `Build Tooling Freshness` delta deferred to Open Questions.

## Approach
Single PR ≤400 (non-generated) stacked-to-main off `dcb9a84`, `gen` exemption for types churn. (1) Create `supabase/config.toml` (A: `[db] major_version=15`), add `gen:types` script, `supabase start` then `gen types --local`, verify `tsc 0` diff-clean. (2) Wire LHCI assert-only (A): update `lighthouserc.json` thresholds `error 0.9`, create `ci.yml` (~45 lines) with `startServerCommand: "pnpm build && pnpm start"`, `upload` artifacts. (3) Pin `setup-cli` semver collateral. Estimator 120–200 lines non-gen + ~600 gen (exempt); per-file ≤150, cost-zero.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/database.types.ts` | Modified | Regen via `--local`; ~400-800 lines, exempt |
| `src/lib/validations/*` | Read-only | Zod sync check; tighten nullability if drift |
| `lighthouserc.json` | Modified | Add pwa 0.9 error, promote performance warn→error |
| `.github/workflows/ci.yml` | New | LHCI assert+upload + build/lint/test gate |
| `.github/workflows/migrate-preview.yml` | Modified | Pin `setup-cli` from `latest` to semver |
| `supabase/config.toml` | New | Pin `major_version 15` (canonical) |
| `package.json` | Modified | Scripts `gen:types` + `lhci:assert`, devDep `@lhci/cli` |
| `tests/unit/t-tooling-types.spec.ts` | New | Types parity TDD |
| `tests/unit/t-lhci.spec.ts` | New | lighthouserc + workflow yaml lint |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Types churn noise (key reorder, comments) | High | `--local` deterministic, diff-review not hand-edit, gen-exemption |
| LHCI flake on runner (perf jitter) | Med | `numberOfRuns:3` median, `assert` only, artifact `upload`, staged warn→error |
| Pin mismatch CLI vs CI (15 vs 16) | Low | Pin both `major_version` + `setup-cli` semver, sync to roadmap, verify `supabase start` |
| tsc false-green → sudden errors after regen | Med | `tsc --noEmit` in CI, Zod read-only check before merge |
| pwa 90 fails without manifest/sw | High | Staged `warn` or defer to P3; open question explicit |

## Rollback Plan
`git revert <commit>` — single commit PR. If LHCI `error 0.9` flakes post-merge, downgrade to `warn` in `lighthouserc.json` without reverting types/config; types revert is `git checkout main -- src/types/database.types.ts`. No migration to roll back, no data loss.

## Dependencies
- Migration `0022_client_warnings_fix.sql` (CHECK/has_role/pg_trgm/customer_360) landed
- `supabase` CLI + Docker for `--local` gen; `@lhci/cli` 0.14.x; `actions/checkout@v4`, pnpm 11.25
- Unblocks P2 `security-csp-nonce` and P3 `client-mobile-perf` (roadmap order)

## Success Criteria
- [ ] `src/types/database.types.ts` >500 lines, contains `entitlements`, `customer_360` VIEW, `has_role`/`get_customer_360`, diff-clean vs `gen types --local`
- [ ] `pnpm build` 75/75, `pnpm lint` 0/0, `npx tsc --noEmit` 0, `pnpm test` ≥359 green (target ≥361), coverage ≥35% hold ≥58% (`vitest.config.ts`)
- [ ] `lighthouserc.json` asserts `categories:performance` + `categories:pwa` `error 0.9`, LCP/CLS/INP `error`, `ci.collect.url` includes `/es-AR/tienda`, `ci.yml` LHCI step green + artifact uploaded
- [ ] `supabase/config.toml` `major_version = 15`, `migrate-preview.yml` `setup-cli` pinned semver (not `latest`)
- [ ] Single commit ≤400 non-gen lines, stacked-to-main off `dcb9a84`, gen-exempt documented

## Open Questions
- **pwa now vs warn/defer**: repo has no `manifest.json`/`sw.js` → `pwa 0.9 error` will fail; ship as `warn` or add minimal manifest in P1?
- **perf warn→error staged**: promote to `error` now or `warn` first iteration if runner flake?
- **spec delta vs tooling-only**: add 1-req `Build Tooling Freshness` delta under `performance-scalability` or mark `None` (constitution `build-tooling`)?
- **15 vs 16 pin**: `major_version 15` per roadmap vs `16` current Supabase line?
- **gen exemption confirm**: ~600 generated lines exempt from 400 budget per constitution?

## Proposal question round
Interactive mode: 4 product questions to sharpen PRD before spec. Answer, skip, correct framing, or request second round.

1. **pwa gate scope**: P1 adds `categories:pwa 0.9` but repo has no PWA assets — should P1 treat pwa as `warn` (signal only) until P3 ships `manifest.json`/`sw`, or include minimal manifest now to make `error` green?
2. **perf gate hardness**: CI `performance 0.9` at `error` may flake on slow runners — do you prefer staged rollout (`warn` → `error` after 1 green week) or hard `error` from day one?
3. **spec traceability**: Tooling-only PR needs no product spec change — do you want an auditable 1-req delta (`Build Tooling Freshness`) or keep `None` and rely on verify PASS gates?
4. **pin string 15 vs 16**: Roadmap pins `15.x`; Supabase now offers `16`. Should P1 lock `15` (stable for P3 k6) or bump to `16`?

Assumptions pending review: tooling-only (`None` caps) with optional delta flagged, `15` pin, `gen` exemption, staged `pwa warn` fallback if `error` fails. Correct or run second round?
