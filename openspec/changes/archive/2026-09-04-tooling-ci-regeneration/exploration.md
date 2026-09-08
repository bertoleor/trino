# Exploration: tooling-ci-regeneration

**Project**: santisima-trinidad | **Change**: tooling-ci-regeneration | **Mode**: hybrid (Engram + OpenSpec)
**Date**: 2026-09-04 | **Roadmap**: P1 quick-win 1PR ≤400 — docs/ROADMAP-NEXT-SDD.md + archive-report S-02/S-03
**Executor**: sdd-explore (muse-spark-1.2-contributor-free) | **Review budget**: 800 lines (D2), chain stacked-to-main

## Current State

### Database types staleness (0022 → src/types/database.types.ts drift)

`src/types/database.types.ts` (33 lines) is a hand-written placeholder predating B, not a `supabase gen types` output. Contains only `profiles/products/orders` with simplified numeric `price` and no `entitlements`, `customer_360`, `pg_trgm` artifacts. Compared to the real schema (0001 init + 0002 money_int INT + 0003 soft-delete FTS + 0005 entitlements + 0022 `entitlements_role_check` 4-tier CHECK + `has_role(text)` SECURITY DEFINER + `pg_trgm` GIN + `customer_360` VIEW + `get_customer_360(uuid)` + RLS policy `has_role('editor')`):

- Missing tables: `entitlements`, `categories`, `product_variants`, `cart_items`/`carts`, `order_items`, `cultura_posts`, `wishlists`/`reviews`, `processed_events`, `security_logs`/`audit_logs`.
- Missing columns: `products.price_cents`/`currency`/`search_vector`/`deleted_at`, `profiles.avatar_url`/`phone`/`role` CHECK, `orders.total_cents` etc.
- Missing `Views.customer_360` and `Functions.has_role` / `get_customer_360` / `is_admin`.
- Effect: `tsc --noEmit` is currently 0 errors only because code avoids the drifted surfaces (Zod in `src/lib/validations/*` derives loosely, `customer360.ts`/`roles.ts` use `any` casts). False-green risk: a future `supabase gen types --local` will produce ~400-800 lines; tsc may then surface real errors.

Existing guard `tests/unit/t-a05-database-types.test.ts` only asserts file exists, contains `Database` keyword, and `DB-SYNC` marker — does NOT assert schema parity with migrations. Passes vacuously on placeholder.

### Lighthouse CI gate (lighthouserc.json not enforced)

`lighthouserc.json` (13 lines) exists and already asserts `categories:performance` `warn` 0.9 + `largest-contentful-paint` 2500 + `cumulative-layout-shift` 0.1 + `interaction-to-next-paint` 200. But:

- `performance` is `warn` not `error` — does not fail CI.
- `categories:pwa` (roadmap S-02) absent — the 90 pwa gate requested in P1 description is missing.
- No CI job invokes `lhci autorun/assert/upload`. No `.github/workflows/ci.yml` exists; only `migrate-preview.yml` (supabase branch migrations, not LH) and `keepalive.yml`.

So Lighthouse is "present but not enforced" — exactly the warning S-02.

### Supabase image pin (supabase-local / docker pin absent)

No `supabase/config.toml`, no `docker-compose.yml`, no `.supabase/` pin in repo. `migrate-preview.yml` uses `supabase/setup-cli@v1` with `version: latest` (unpinned) and `supabase db reset --linked` against remote preview (no local stack). Roadmap P1 requires `supabase:15.x` (or current 16.x line) pinned so that P3 `k6` + `supabase-local` two-role RLS tests are reproducible. Design open question "config.toml vs docker-compose.yml" is unresolved.

### Tooling surrounding

- `vitest.config.ts`: coverage thresholds 35/30 (global), current 58.13% (39% headroom) — P1 must hold ≥35% (target ≥58% hold per roadmap).
- `package.json`: no `supabase` CLI devdep, no `gen:types` script, no `lhci` devdep.
- `next.config.ts`: `compress:true`, strict CSP `script-src 'self'` (no nonce yet — P2), cache split already landed in W-03.
- Git: HEAD `dcb9a84` (10/10 tasks), branch `main`, 75 pages build, zero docker files at root.

## Affected Areas

- `src/types/database.types.ts` — stale placeholder, must be regenerated via `supabase gen types typescript --local` post-0022; generated file excluded from 400 budget per constitution but still review-churny
- `src/lib/validations/*` (cultura-bulk.ts, cultura.ts, money.ts, reviews.ts, wishlist.ts) — Zod sync check read-only; may need tightening if regenerated types expose stricter nullability/enums (price_cents INT, role 4-tier)
- `lighthouserc.json` — add `categories:pwa` assertion ≥0.9 (or 90 depending on LHCI schema), upgrade `categories:performance` from `warn` to `error` if team wants hard gate
- `.github/workflows/ci.yml` — NEW workflow: checkout + pnpm install + `tsc` + `lint` + `vitest run` + LHCI `assert` + artifact `upload` + optional `supabase gen types --local --check` drift guard
- `.github/workflows/migrate-preview.yml` — optionally pin `supabase/setup-cli@v1` version from `latest` to pinned semver (e.g. `1.142.2`) for reproducibility
- `supabase/config.toml` — NEW minimal config pinning `db.major_version = 15` (or `[api] image` / `supabase/supabase:15.x`) — alternatively `docker-compose.yml` pinning `supabase/postgres:15.x` + `supabase/gotrue` etc. Decision documented in proposal
- `package.json` — add scripts `gen:types` (`supabase gen types typescript --local --schema public > src/types/database.types.ts`) and optionally `lhci:assert`; may add `devDependencies` `@lhci/cli` pinned version
- `tests/unit/t-a05-database-types.test.ts` + NEW `tests/unit/t-tooling-types.spec.ts` / `t-lhci.spec.ts` — failing TDD assertions for types parity and lighthouserc shape + workflow yaml lint
- `openspec/specs/performance-scalability` — existing spec already requires `perf ≥90`; if tooling-only, a 1-requirement `Build Tooling Freshness` delta may be added (MODIFIED enforce 90 gate + ADDED types-freshness)

## Approaches

### 1) Types regeneration

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| **A — `supabase gen types --local` (regenerate, commit output)** — run local stack via `supabase start` then `supabase gen types typescript --local --schema public`, commit file as-is; add CI `diff --exit-code` drift guard | Canonical, deterministic, versioned, proves 0022 CHECK/has_role/customer_360; P3 can rely on it; simplest for reviewers (diff shows new tables/functions) | Requires active `supabase` CLI + Docker; output churn 400-800 lines (noisy diff); `config.toml` must exist first | Low |
| **B — `supabase gen types --linked` (remote project)** | No local Docker, quick | Ties CI to remote secrets (`SUPABASE_ACCESS_TOKEN`/`DB_PASSWORD`); non-deterministic across branches; fails offline | Low but coupled |
| **C — Hand-edit placeholder incrementally** | Minimal diff, fast | Reintroduces drift; manual errors on CHECK enums / view columns; defeats "gen" contract; tsc false green persists | Medium/Higher risk |

Recommendation for types: **A** (with generated-file exemption from 400-line budget per constitution `gen` exemption). Optionally keep a `pnpm gen:types` script + CI check `supabase gen types --local | diff -u src/types/database.types.ts -` as the S-03 guard.

### 2) Lighthouse CI gate

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| **A — `lighthouserc.json` `assert` + CI `lhci autorun` (`assert` + `upload`) with `error` threshold 0.9** — keep URL `http://localhost:3000/es-AR/tienda` (already correct locale), `numberOfRuns:3`, `assert` categories:performance 0.9 + pwa 0.9, keep LCP/CLS/INP `error`; `collect` via `startServerCommand: "pnpm build && pnpm start"` or `lhci autorun` against built preview | Enforces 90 gate hard, reuses existing `ci.collect` config, minimal lines (~30 in ci.yml), artifact upload aids triage; roadmap-exact | Can flake on slow runner (perf jitter) — mitigated by `assert` warn→error staged rollout or `minScore:0.85` warn + 0.9 error dual | Low |
| **B — `budget.json` (performance budgets)** | Finer granularity per metric | More files, more config, still needs `assert`; overkill for tooling sprint | Medium |
| **C — External Lighthouse service (Vercel/Calibre)** | No CI flake, field metrics | Cost, violates cost-zero, not stacked-to-main | High / rejected |

Recommendation for LHCI: **A** assert-only. Keep thresholds at 0.9 `error` for `performance`+`pwa`, retain LCP/CLS/INP `error`. Do NOT widen to `accessibility/best-practices/seo` categories yet — those are P3 concerns (44px thumb, CSP etc.) and would break gate. Pin `@lhci/cli` to exact semver (e.g. `0.14.x`) in devDeps.

### 3) Supabase image pin

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| **A — `supabase/config.toml` (`[db] major_version = 15`) + pin `supabase/supabase:15.x` in workflow** — create minimal `supabase/config.toml` with `project_id = "santisima-trinidad"`, `[api] port`, `[db] major_version`, `port = 54322`; CI job `supabase/setup-cli@v1` with `version: 1.142.2` (pinned, not latest), optionally `services: postgres:15-alpine` if not using supabase local | Canonical Supabase CLI surface, future `supabase start` uses same pin, P3 `supabase-local + k6` inherits it; smallest diff (1 toml) | Requires consensus on 15 vs 17; `supabase/config.toml` generation adds boilerplate | Low |
| **B — `docker-compose.yml` pin `supabase/postgres:15.x` + `supabase/gotrue` + `postgrest` etc.** | Explicit Docker pin, CI can `docker compose up -d` | Larger compose to maintain (network, volumes), duplicates CLI config, more lines (>150) | Medium |
| **C — Workflow-only pin via `services:` without repo file** | Zero repo file, fastest | Pin invisible to local dev, drifts between local & CI; P3 k6 local then diverges | Low but drift |

Recommendation for pin: **A** (minimal `supabase/config.toml`), plus pinning `setup-cli` version in `migrate-preview.yml` as collateral. Document decision in proposal Design § Pin decision (table above). If team prefers no supabase local yet, a 5-line `docker-compose.yml` pinning only `postgres:15-alpine` for `gen types --local` is a fallback, but `config.toml` is the OpenSpec answer.

## Recommendation

Proceed with **P1 as a single PR ≤400 (tooling-only, `gen` exemption)** stacked-to-main off `dcb9a84`, comprising exactly 3 tasks (collapsible to 2 if lines allow):

1. **Regenerate `database.types.ts` + Zod drift check** — create `supabase/config.toml` (A), add `package.json` `gen:types` script, run `supabase gen types typescript --local --schema public > src/types/database.types.ts`, verify `npx tsc --noEmit` 0 errors and `diff` clean; add TDD `t-tooling-types.spec.ts` asserting `entitlements`/`customer_360`/`has_role`/`get_customer_360` appear in generated file and file >500 lines vs current 33.
2. **Wire Lighthouse CI gate 90 — `lighthouserc.json` + `ci.yml`** — promote `categories:performance` `warn→error`, add `categories:pwa` `error` 0.9, keep LCP/CLS/INP; create `.github/workflows/ci.yml` with `actions/checkout@v4` + `pnpm` setup + `build` + `lhci autorun --assert --upload` + artifact `lhci` results; add `tests/unit/t-lhci.spec.ts` asserting `assert.assertions` contains `categories:pwa` and `minScore 0.9` and `ci.collect.url` includes `/es-AR/tienda`.
3. **Pin Supabase image + doc decision** — if not merged into (1), pin `supabase/setup-cli@v1` from `latest` to pinned semver in `migrate-preview.yml`, assert via workflow yaml lint test; doc decision table in proposal.

Spec delta: treat as **tooling-only — delta optional**. If team wants traceability, add single Modified requirement under `performance-scalability` (or `observability-health`): `Build Tooling Freshness — database.types.ts SHALL match supabase gen types --local post-0022; Lighthouse SHALL assert performance≥90 and pwa≥90 in CI` with 2 scenarios (Given stale types / When gen runs / Then file matches; Given CI / When lhci assert runs / Then thresholds ≥90). Otherwise mark as `build-tooling` with no spec churn — constitution allows `build-tooling` cap for this. Proposal should state `no spec delta` vs `1-requirement delta` as open question.

TDD strict: pre-write failing specs before any file edit (triangulation ≥3 cases per task). Estimator 120-200 lines non-generated + ~600 generated types (exempt) — stays ≤400 for non-generated per file ≤150 (ci.yml ~45, lighthouserc.json Δ +2, config.toml ~25, package.json Δ +3, 2 test files ~60 each).

## Risks

- **Types churn noise** — `supabase gen types` output reorders keys and adds comments each run; mitigate with `--local` deterministic, `diff` review (not hand-edit), and generated-file exemption; never commit `--linked` output.
- **LHCI perf flake on CI runner** — lab perf varies by runner CPU/throttle; mitigate with `assert` only (no hard `budget` fail), `numberOfRuns:3` median, `upload` artifact for triage, tolerate `warn` hold on first iteration if `error` too flaky (constitution allows `warn` → staged `error`).
- **Image pin mismatch (CLI vs CI)** — `setup-cli@latest` + `config.toml` `major_version 15` vs actual runner `postgres:15.x` may diverge if 16 lands; mitigate by pinning both `setup-cli` semver and `major_version`, sync to `docs/ROADMAP-NEXT-SDD.md` pin string, verify `supabase start` locally before PR.
- **tsc false-green → sudden errors after regen** — regenerated types may tighten nullability (`price_cents` INT vs `price` numeric) and break `validations/*` or `customer360.ts` Zod coercions; mitigate with `--noEmit` in CI and a Zod sync read-only check before merge.
- **No existing ci.yml — first green must prove full gate** — mitigate by modeling `ci.yml` on Next's `build` gate (already 75/75) and verifying `pnpm test` 359/359 hold and coverage ≥58% (not just ≥35%).
- **PWA 90 gate may fail without manifest/service-worker** — repo has no `manifest.json`/`sw.js`; adding `categories:pwa` 0.9 without pwa assets will always fail; mitigation: scope P1 pwa assert to `warn` initially or defer to P3, OR add minimal `public/manifest.json` + `next-pwa` if team accepts; proposal must call this out as open question — roadmap says `assert pwa/category` but pwa assets may be out of P1 scope.
- **Scope creep past 400** — P3 temptation (k6, 500 seeds, mobile thumb 44px) must be deferred; hard budget is the gate — overflow parks to backlog `ecommerce-client-v2`.

## Ready for Proposal

**Yes** — sufficient context to run `sdd-propose tooling-ci-regeneration`.

**Proposal inputs to carry forward:**

- Intent: bundle S-02 (LHCI 90) + S-03 (gen types after 0022) + supabase image pin (S-03 open question) as one tooling-only PR stacked-to-main off `dcb9a84`.
- Scope files: `lighthouserc.json`, `.github/workflows/ci.yml` (new), `src/types/database.types.ts` (regen), `supabase/config.toml` (new pin), `package.json` (scripts), `src/lib/validations/*` read-only, 2 test files.
- Approach baseline: `supabase gen types --local` (A), LHCI assert (A), config.toml pin (A).
- Spec trace: `performance-scalability` LHCI 90; `observability-health` types freshness; optionally 1-requirement delta `Build Tooling Freshness` 2 scenarios.
- Risks + mitigations as above; no product/migration/UI churn; cost-zero.
- Verify PASS gates: `pnpm build` 75/75, lint 0, tsc 0, tests ≥359 green (target ≥361 with new tests), coverage ≥35% hold ≥58%, `database.types.ts` diff clean vs gen, CI LHCI assert green with thresholds 90 (warn→error staged).
- Dependencies: none — P1 unblocks P2 `security-csp-nonce` and P3 `client-mobile-perf`; must land first.
- Open questions to resolve in proposal: (a) pwa 90 assert now vs warn/defer until manifest exists, (b) performance `warn→error` now vs staged, (c) spec delta vs tooling-only with no delta, (d) `supabase:15` vs `16` pin string, (e) `gen` lines exemption confirmation per constitution.

## Sources

- `docs/ROADMAP-NEXT-SDD.md` P1 §Scope/Approach/Success + `openspec/changes/archive/2026-09-04-client-warnings-fix/archive-report.md` §Next SDD Suggestion S-02/S-03 + `verify.md` S-02/S-03 warnings + `supabase/migrations/0022_client_warnings_fix.sql` (CHECK 4-tier, has_role DEFINER, pg_trgm, customer_360, get_customer_360) + `src/types/database.types.ts` (33-line placeholder) + `lighthouserc.json` (performance warn + LCP/CLS/INP) + `.github/workflows/{migrate-preview,keepalive}.yml` (no ci.yml) + `supabase/seed.sql` + `vitest.config.ts` 35/30 + `package.json` 359 tests baseline.
