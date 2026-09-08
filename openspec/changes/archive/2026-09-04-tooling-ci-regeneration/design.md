# Design: tooling-ci-regeneration

## Technical Approach

Tooling-only PR (S-02/S-03 hygiene). Three coupled but independently verifiable work units: (1) regenerate `src/types/database.types.ts` post-0022 via `supabase gen types --local` (deterministic, diff-clean), (2) wire LHCI assert-only gate (`lighthouserc.json` + new `.github/workflows/ci.yml`), (3) pin the Supabase toolchain (`supabase/config.toml` `major_version=15` + `setup-cli@v1` semver `1.142.2`). No product/migration/UI churn, cost-zero. Maps to 1 delta requirement: `Deterministic Build Tooling Freshness Gate`.

## Architecture Decisions

### AD-01: `gen types --local` vs `--linked`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `--linked` (remote project) | No local Docker; needs `SUPABASE_ACCESS_TOKEN`/`DB_PASSWORD` secrets, non-deterministic across branches, fails offline | Rejected |
| Hand-edit placeholder incrementally | Minimal diff; reintroduces drift, manual CHECK/enum errors, defeats gen contract, tsc false-green persists | Rejected |
| `gen types --local` (supabase start → gen) | Canonical, deterministic, versioned, proves 0022 CHECK/has_role/customer_360; requires Docker + `config.toml` first | **Chosen** |

Rationale: exploration recommends A. `--local` guarantees diff-clean reproducibility (spec scenario 1) and unblocks P3 supabase-local two-role RLS. `--linked` ties CI to secrets; hand-edit reintroduces the exact drift this change fixes. Must create `supabase/config.toml` before `supabase start`.

### AD-02: Lighthouse CI — `lhci autorun --assert --upload` + minimal `ci.yml`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `budget.json` per-metric budgets | Finer granularity; more config, still needs assert — overkill | Rejected |
| External Lighthouse (Vercel/Calibre) | No CI flake; costs money, not stacked-to-main | Rejected |
| `lighthouserc.json` assert + `ci.yml` `lhci autorun --assert --upload` | Enforces 0.9 hard, ~45-line workflow, artifact aids triage, reuses existing collect config | **Chosen** |

Promote `categories:performance` `warn→error` 0.9, add `categories:pwa` `error` 0.9 (staged `warn` fallback — see open questions), keep LCP 2500 / CLS 0.1 / INP 200 `error`, `numberOfRuns:3`, URL `http://localhost:3000/es-AR/tienda`. Pin `@lhci/cli` semver in devDeps.

### AD-03: Pin `supabase/config.toml` `major_version=15` + `setup-cli@v1` semver

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Workflow-only `services:` pin | Zero repo file; pin invisible to local dev, drifts local/CI | Rejected |
| `docker-compose.yml` pin postgres/gotrue/postgrest | Explicit; >150 lines, duplicates CLI config, more to maintain | Rejected |
| Minimal `supabase/config.toml` (`[db] major_version=15`) + `setup-cli` `version: 1.142.2` | Canonical surface, smallest diff (1 toml), P3 inherits pin | **Chosen** |

Rationale: exploration recommends A. `config.toml` is the OpenSpec answer; `setup-cli` semver pin in `migrate-preview.yml` is collateral for reproducibility (spec scenario 3).

## Data Flow

```
PR opened
  └─▶ ci.yml (checkout@v4 → pnpm setup → build)
        ├─ tsc --noEmit (fail if types drifted)
        ├─ lint
        ├─ vitest run (coverage ≥35% hold)
        ├─ drift guard: supabase gen types --local | diff --exit-code  (S-03)
        └─ lhci autorun --assert --upload (startServer "pnpm build && pnpm start")
              → lighthouserc.json assert performance+pwa 0.9 → artifact upload

migrate-preview.yml (migration paths)
  └─ supabase/setup-cli@v1 (version 1.142.2) → db reset --linked

local dev
  └─ pnpm gen:types → supabase start → gen types --local > src/types/database.types.ts
```

## File Changes

| File | Action | Description | Lines |
|------|--------|-------------|-------|
| `src/types/database.types.ts` | Modify (regen) | `supabase gen types --local --schema public` post-0022; real schema, `entitlements`, `has_role`, `customer_360`, `get_customer_360`. Generated → exempt from 400 budget | ~600 (exempt) |
| `supabase/config.toml` | Create | `project_id="santisima-trinidad"`, `[db] major_version=15`, API ports | ~25 |
| `lighthouserc.json` | Modify | `performance` warn→error, add `categories:pwa` (error|warn 0.9), keep LCP/CLS/INP | +2 |
| `.github/workflows/ci.yml` | Create | checkout@v4 + pnpm + build + tsc + lint + vitest + drift guard + `lhci autorun --assert --upload` + artifact | ~45 |
| `.github/workflows/migrate-preview.yml` | Modify | `setup-cli@v1` `version: latest` → `1.142.2` | +1 |
| `package.json` | Modify | scripts `gen:types`, `lhci:assert`; devDep `@lhci/cli` pinned | +4 |
| `tests/unit/t-tooling-types.spec.ts` | Create | Types parity TDD (entitlements/customer_360/has_role/get_customer_360, >500 lines) | ~60 |
| `tests/unit/t-lhci.spec.ts` | Create | lighthouserc assert shape + workflow yaml lint | ~60 |
| `tests/unit/t-a05-database-types.test.ts` | Modify | Drop `≤150-line` assertion (regen >500); keep existence/DB-SYNC/marker | ~-5 |

All non-gen files ≤150 lines. Total non-gen ≈190, gen ~600 exempt.

## Interfaces / Contracts

**lighthouserc.json assert shape**

```jsonc
{
  "ci": {
    "collect": { "url": ["http://localhost:3000/es-AR/tienda"], "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["error", { "minScore": 0.9 }],  // staged "warn" if no manifest/sw
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interaction-to-next-paint": ["error", { "maxNumericValue": 200 }]
      }
    }
  }
}
```

**package.json scripts**

```jsonc
"gen:types": "supabase gen types typescript --local --schema public > src/types/database.types.ts",
"lhci:assert": "lhci autorun --assert"
```

**supabase/config.toml**

```toml
project_id = "santisima-trinidad"
[api]
port = 54321
[db]
major_version = 15
port = 54322
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Types parity (entitlements/customer_360/has_role/get_customer_360 present, >500 lines), lighthouserc assert shape (`categories:pwa` present, minScore 0.9, url includes `/es-AR/tienda`), ci.yml yaml parse + steps | `t-tooling-types.spec.ts`, `t-lhci.spec.ts` (Vitest, TDD triangulation ≥3) |
| Toolchain | Drift guard rejects stale types | CI `supabase gen types --local \| diff --exit-code` non-zero on divergence |
| Coverage | Hold ≥35% global (current 58%) | `vitest run --coverage` gate unchanged |

`npx tsc --noEmit` 0, `pnpm lint` 0, `pnpm test` ≥361 green. `t-a05` 150-line budget assertion MUST be relaxed (regen >500 lines) — flag to verify.

## Migration / Rollout

No migration. Rollout: single stacked-to-main PR off `dcb9a84`. Rollback: `git revert <commit>`. If LHCI `error 0.9` flakes post-merge, downgrade `categories:performance`/`pwa` to `warn` in `lighthouserc.json` without reverting types/config. Types rollback: `git checkout main -- src/types/database.types.ts`.

## Open Questions

- [ ] **pwa 0.9 error vs warn**: repo has no `manifest.json`/`sw.js` → `error` will fail. Spec allows staged `warn` + explicit follow-up task. Default: `warn` with P3 follow-up.
- [ ] **`t-a05` 150-line assertion**: regenerated file >500 lines violates existing budget test — must be relaxed in same PR; confirm acceptable.
- [ ] **15 vs 16 pin**: `major_version=15` per roadmap vs current Supabase `16` line — confirm pin string.