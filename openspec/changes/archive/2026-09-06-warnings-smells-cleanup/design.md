# Design: Warnings & Smells Cleanup

## Technical Approach

Stack S0→S1→S2→S3 onto main, each ≤400 lines, independently verifiable and revertible. S0 lands first and freezes the lint/format baseline all later slices are measured against. Touch-only Prettier throughout: each slice formats solely files it edits. Only intentional behavior change: S3 cron fail-closed.

Flow: `S0 baseline → S1 validation/hygiene → S2 casts/segments → S3 security`; each slice runs RED tests → GREEN → verify gates → next.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| simple-import-sort vs native sort-imports | plugin auto-fixes nicer, +1 dep | REJECT plugin; native `sort-imports` + member-syntax sort (cost-zero) |
| sonarjs vs native complexity trio | sonarjs richer, heavy dep | REJECT; native `complexity(12,warn)` + `max-depth(4)` + `max-params(4)` |
| tailwind class-sort plugin | churn across 154 dirty files, TW v4 risk | REJECT; recorded |
| husky+lint-staged vs CI-only | hook needs 2 free devDeps | ACCEPT (both MIT, zero-cost): staged-only `eslint --fix` + `prettier --write` |
| pnpm vs npx invocation | pnpm binary broken in this env | scripts use bare bins (`eslint .`); run docs give `pnpm exec X \|\| npx X` fallback |
| central guards vs local narrowing (as-never) | one god-type over heterogenous clusters | LOCAL narrowing per cluster; one shared minimal `TypedSupabase` interface for supabase rpc/from sites only |
| shared cron auth vs per-route edit | 3 duplicated guards | NEW `src/lib/cron/auth.ts:isCronAuthorized(req)`; all 3 routes delegate |

ESLint flat additions (atop `next/core-web-vitals` + `next/typescript`): `no-explicit-any:error`, `no-unused-vars:error`, `consistent-type-imports:error`, `no-non-null-assertion:warn` (per-site justification), keep `no-console:error`, `max-lines:150`, emoji ban. `lint` script fixed `eslint`→`eslint .` (bare `eslint` currently exits 0 — real gap). Prettier ratified as-is (already `arrowParens:always`) + VS Code `formatOnSave` + new `.editorconfig` (lf/utf-8/2-space/trim). CI: new step in `ci.yml` fails on eslint errors/warnings + `prettier --check` on touched files via `git diff --name-only`.

154 Prettier failures: NEVER bulk `--write`. Strategy: capture `prettier --check .` list once; each slice formats only files it edits; wholesale normalization allowed only for an explicit exception list recorded in tasks.

## Slices

**S0 tooling-config** (config-only, no src behavior): touch `eslint.config.mjs`, `package.json` (scripts + husky/lint-staged devDeps + lint-staged block), `.husky/pre-commit`, `.editorconfig`, `.vscode/settings.json`, `.github/workflows/ci.yml`; NEW `tests/unit/t-s0-tooling-config.test.ts` asserting config contents (rules/scripts/hook/editorconfig strings). RED-first: tests written against not-yet-edited configs, then GREEN. Verify: `tsc --noEmit`, `eslint .`, hook simulation on a fixture, `vitest run t-s0`. Bounds: start=main HEAD, finish=S0 tip; rollback reverts S0 alone.

**S1 cultura/hygiene**: `cultura.ts:7` body → TipTap loose schema (`z.looseObject({type:z.literal('doc'),content:z.array(z.unknown())}).optional()` — strict root, loose leaves). Fixture gate FIRST: `vitest run t-e02 t-e04 t-e05` green, then tighten, re-run + new string-body-reject test. Void-baits (36 non-security): grep `^\s*void ` per file; dead strings/`void 44`/`void locale` deleted, real-handling sites get code. Disables: virtual-list incompatible-library → remove if green, else keep+ticket; both set-state-in-effect → refactor effect→handler, else justify+ticket. Catches→`logger.{error|warn}`: request-path (cron/api/proxy helpers) = `error`; fallbacks (fx last-rate, clipboard/share) = `warn`; fields `route` + `String(error)` only. Verify: tsc/eslint/`t-e02..t-e05` + logger-spy test. Rollback: revert S1, S0 stays.

**S2 casts/segments**: ~30 `as never` → local narrowing (minimal typed casts + runtime checks); supabase rpc/from clusters share NEW `src/lib/supabase/typed.ts`; `database.types.ts` keeps `globalIgnores` + ratified `/* generated — do not edit */` exception comment. Segments (touched routes only): NEW `src/app/[locale]/admin/error.tsx` + `src/app/[locale]/admin/loading.tsx` reusing root `error.tsx` + Bauhaus skeleton; untouched routes out. Verify: narrowing + segment render tests, `as never` grep count drops. Rollback: revert S2 only.

**S3 security** (slice-B coordinated): `proxy.ts:45` delete (sameSite already computed in `setAll`) reusing `isAdminCookie` inline; `:87` delete `void best` (`bestRole` supersedes); `:136` delete audit string (real audit via `enqueueSecurityAudit`). Sequencing: (a) S3-after-B-merge rebase (cleaner, recommended) or (b) single combined owner-approved review (faster, couples diffs). Cron: all 3 routes delegate to `isCronAuthorized` — unset secret allows ONLY when `NODE_ENV==='development' && CRON_ALLOW_UNSET_SECRET==='true'`, else 401. Tests: matrix (prod-unset→401 regardless of flag; dev+flag→pass; dev-unflagged→401). Verify: cron matrix + tsc/eslint/build + diff-purity check (only void/cron-auth lines). Rollback: revert S3 first (reverse S3→S2→S1).

## File Changes

| File | Action | Slice |
|---|---|---|
| `eslint.config.mjs`, `package.json`, `.husky/pre-commit`, `.editorconfig`, `.vscode/settings.json`, `.github/workflows/ci.yml` | Modify/Create | S0 |
| `tests/unit/t-s0-tooling-config.test.ts` | Create | S0 |
| `src/lib/validations/cultura.ts`, ~17 void/catch/disable files | Modify | S1 |
| `src/lib/supabase/typed.ts`, cast files, `[locale]/admin/error.tsx` + `loading.tsx` | Create/Modify | S2 |
| `src/lib/cron/auth.ts`, 3 cron routes, `src/proxy.ts` | Create/Modify | S3 |

```ts
// src/lib/cron/auth.ts — the only behavior change
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return process.env.NODE_ENV === 'development'
      && process.env.CRON_ALLOW_UNSET_SECRET === 'true';
  return req.headers.get('authorization') === `Bearer ${secret}`;
}
```

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Config (S0) | rules/scripts/hook/editorconfig present | vitest file-content assertions (t-s0 style) |
| Unit (S1–S3) | schema reject, logger calls, narrowing, cron matrix | vitest RED-first |
| Gates (all) | tsc 0, eslint 0/0, prettier touched-clean, build (S3) | shell verify per slice |

## Migration / Rollout

No migration. Stacked-to-main, NO commit until all slices verify PASS (force-chained gate). Cron fail-closed is the sole behavior change; dev bypass documented where cron auth is configured.

## Open Questions

- [ ] virtual-list disable removable without hook, or ticket-justified keep? (probe in tasks)
- [ ] wholesale-Prettier exception list: empty by default unless a slice proves need
