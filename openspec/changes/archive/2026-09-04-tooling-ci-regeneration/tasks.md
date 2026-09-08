# Tasks: tooling-ci-regeneration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~190-250 non-gen + ~600 gen (exempt) |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (stacked-to-main) |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
800-line budget risk: Low

## Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | Pin toolchain + regen types + wire LHCI gate | 1 | Base main `dcb9a84`; tests + docs in same PR |

## Phase 1: Toolchain Pinning (REQ: Deterministic Build Tooling Freshness Gate — Scenario 3)

- [x] 1.1 Create `supabase/config.toml` with `project_id = "santisima-trinidad"`, `[db] major_version = 15`, API/db ports (25 lines). Trace S-03.
- [x] 1.2 Pin `supabase/setup-cli@v1` `version: latest` → `1.142.2` in `.github/workflows/migrate-preview.yml`.

## Phase 2: Types Regeneration (Scenario 1, 4)

- [x] 2.1 Add `package.json` script `"gen:types": "supabase gen types typescript --local --schema public > src/types/database.types.ts"`.
- [x] 2.2 Run `supabase start` then `pnpm gen:types`; regenerates `src/types/database.types.ts` post-0022 (entitlements CHECK, has_role, customer_360, get_customer_360, pg_trgm). Gen-exempt.
- [x] 2.3 Relax `tests/unit/t-a05-database-types.test.ts` line 27 budget `<=150` → `<=800` (regen >500); keep existence/DB-SYNC/marker asserts.
- [x] 2.4 Verify Zod read-only sync (`src/lib/validations/*`) — no drift against new types.

## Phase 3: Lighthouse CI Gate (Scenario 2)

- [x] 3.1 Update `lighthouserc.json`: `categories:performance` `error 0.9`, add `categories:pwa` `warn 0.9` (no manifest/sw — staged), keep LCP 2500 / CLS 0.1 / INP 200 `error`, `numberOfRuns: 3`, `collect.url` `http://localhost:3000/es-AR/tienda`.
- [x] 3.2 Create `.github/workflows/ci.yml`: checkout@v4 + pnpm + `tsc --noEmit` + `eslint` + `vitest run` + `pnpm build` + drift guard `gen types --local | diff --exit-code` + `lhci autorun --assert --upload` artifact.

## Phase 4: TDD Tests + Verification (All scenarios)

- [x] 4.1 Create `tests/unit/t-tooling-types.test.ts` (not `.spec.ts` — match `tests/unit/**/*.test.{ts,tsx}` glob): assert entitlements/customer_360/has_role/get_customer_360 present and >500 lines (TDD RED→GREEN).
- [x] 4.2 Create `tests/unit/t-lhci.test.ts`: assert lighthouserc `categories:pwa` present, `minScore 0.9`, url `/es-AR/tienda`, ci.yml yaml parses.
- [x] 4.3 Gate: `npx tsc --noEmit` 0, `pnpm lint` 0, `pnpm test` ≥361 green, coverage ≥35% hold.
- [x] 4.4 Update `openspec/changes/tooling-ci-regeneration/README` trace note → BUILD TOOLING FRESHNESS (S-02/S-03).

## Acceptance Criteria

- [x] `database.types.ts` >500 lines, diff-clean vs `gen types --local`, tsc 0.
- [x] `lighthouserc.json` performance error 0.9 + pwa warn 0.9; ci.yml LHCI green + artifact.
- [x] `config.toml` `major_version=15`; `migrate-preview.yml` `setup-cli` semver pinned (not `latest`).
- [x] Work-unit commits ≤150 non-gen lines each; zero emojis; zero comments except justified.

## Risks

- Design lists tests as `.spec.ts`; convention + Vitest glob is `*.test.ts` — corrected to `.test.ts` above.
- `pwa` must stay `warn` until P3 manifest/sw ships, else CI red.