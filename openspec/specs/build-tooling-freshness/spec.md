# build-tooling-freshness Specification

## Purpose
Deterministic, reproducible build tooling so generated database types, performance budgets, and the local database toolchain version are enforced on every pull request. Trace: constitution `build-tooling` allowance; archive S-02 (LHCI 90 gate) + S-03 (gen types freshness + Supabase pin).

## Requirements

### Requirement: Deterministic Build Tooling Freshness Gate

The CI pipeline MUST guarantee that generated database types, performance budgets, and the local database toolchain version are deterministic and enforced on every pull request.

The system MUST regenerate `src/types/database.types.ts` via `supabase gen types typescript --local --schema public` against migration `0022`, and `npx tsc --noEmit` MUST pass with 0 errors and the file MUST be diff-clean against a fresh regeneration.

The CI workflow MUST run `lhci autorun --assert` where `lighthouserc.json` asserts `categories:performance` with `error` at `0.9` and `categories:pwa` with `error` at `0.9`, with `numberOfRuns: 3` against `http://localhost:3000/es-AR/tienda`. The pwa assertion MAY be staged at `warn` if no `manifest.json`/service worker exists yet, with an explicit follow-up task.

The local database toolchain MUST be pinned: `supabase/config.toml` MUST declare `[db] major_version = 15`, and `migrate-preview.yml` MUST pin `supabase/setup-cli` to a semver release (not `latest`).

#### Scenario: Types regeneration is diff-clean and type-safe

- GIVEN migration `0022_client_warnings_fix.sql` is applied locally
- WHEN `pnpm gen:types` regenerates `database.types.ts`
- THEN the file exceeds 500 lines and contains `entitlements` CHECK tiers, `has_role`, and `customer_360` VIEW
- AND `npx tsc --noEmit` reports 0 errors
- AND re-running the generator produces no diff

#### Scenario: LHCI asserts performance and pwa at 0.9

- GIVEN `lighthouserc.json` with `categories:performance` `error 0.9` and `categories:pwa` `error 0.9`
- WHEN the `ci.yml` workflow runs `lhci autorun --assert`
- THEN a run below 0.9 on either category fails the build
- AND LCP 2500 / CLS 0.1 / INP 200 thresholds remain at `error`
- AND the LHCI report is uploaded as a build artifact

#### Scenario: Supabase toolchain is version-pinned

- GIVEN `supabase/config.toml` and `.github/workflows/migrate-preview.yml`
- WHEN CI provisions the Supabase CLI or starts the local stack
- THEN `major_version` resolves to 15 and `setup-cli` resolves to a pinned semver (e.g. `1.142.2`), never `latest`

#### Scenario: Drift guard rejects stale generated types

- GIVEN a PR that edits the schema without regenerating types
- WHEN the CI drift guard runs `gen types --local | diff --exit-code`
- THEN the build MUST fail with a non-zero exit, surfacing the drift