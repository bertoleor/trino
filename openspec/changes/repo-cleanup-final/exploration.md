# Exploration: repo cleanup final

## Current State

Working tree holds ~114 dirty entries (81 modified, 17 unstaged deletions, 33 untracked paths) from uncommitted but PASS-verified S0/S1/S2/S3/followup slices plus S0 tooling (strict flat eslint config, prettier, husky/lint-staged, CI drift gate). `npx tsc --noEmit` is CLEAN (zero errors). `npx eslint .` reports 195 problems (159 errors, 36 warnings); 102 errors auto-fixable. `npx prettier --check .` reports 250 drifted files plus 1 hard YAML syntax error in `openspec/config.yaml:30`. Zero `console.*`, zero TODO/FIXME, zero `as any`, zero unused vars, zero react-hooks findings in `src/`.

## Evidence

### 1. ESLint (`npx eslint .` — read-only): 195 problems, 159 errors, 36 warnings

| Rule | Count | Severity | `--fix` safe |
|------|-------|----------|--------------|
| `sort-imports` | 156 | error | YES (mechanical, zero-semantic) — 102 of all errors fixable |
| `@typescript-eslint/consistent-type-imports` | 3 | error | YES |
| `complexity` (max 12) | 6 | warning | NO — manual refactor |
| `@typescript-eslint/no-non-null-assertion` | 30 | warning | NO — justify-or-refactor |
| unused vars / `no-explicit-any` / react-hooks / `no-console` | 0 | — | — |

Sample file:line evidence:
- `sort-imports`: `src/app/[locale]/cultura/[slug]/page.tsx:2,3,4,6,7`, `src/app/[locale]/layout.tsx:2,5,6`, `src/app/layout.tsx:3,4,6`, `src/proxy.ts:3,5,6,7,9`, `src/components/ui/button.tsx:2`, `src/lib/utils.ts:1`, plus ~25 test files with unsorted `expect` member (`tests/unit/t-s04-shipping-fix.test.ts:1`, `t-s05`, `t-tooling-types`, `t-h01`…`t-l05`, `t-s02`, `t-s03`, etc.)
- `consistent-type-imports`: `src/app/api/bank-proof/url/route.ts:1` (`NextRequest` type-only), `src/app/api/shipping/rates/route.ts:1`, `src/app/api/social/stats/route.ts:1`
- `complexity`: `src/proxy.ts:97` (`proxy`, 20), `src/proxy.ts:43` (`updateSession`, 17), `src/lib/customer360.ts:21` (`getCustomer360`, 17), `src/app/api/shipping/rates/route.ts:9` (`POST`, 17), `src/app/api/internal/audit/route.ts:18` (`POST`, 15), `src/lib/logger.ts:6` (`emit`, 13)
- `no-non-null-assertion`: `src/proxy.ts:46,83`, `src/lib/rate-limit.ts:46,47,58`, `src/lib/supabase/server.ts:8,9`, `src/lib/supabase/client.ts:5,6`, tests `shipping-labels.test.ts:25,26,37`, `t-d03b-international.test.ts:19,20`, `t-s04-shipping-fix.test.ts:70,71`, `t-pr1-next-config-private.test.ts:35,38`

PRE-EXISTING (HEAD) vs worktree: the `sort-imports`/`consistent-type-imports` errors sit mostly in files NOT touched by the worktree diff (e.g. `[locale]/admin/lanzamientos`, `design/page`, `tienda/*`, `auth/actions`, `error.tsx`, `ui/*`, `supabase/*`, `customer360.ts`, `logger.ts`) — i.e. pre-existing code newly surfaced by the worktree-new S0 strict `eslint.config.mjs` (modified, uncommitted). A minority rides on slice-touched files (`src/proxy.ts`, `src/app/api/internal/audit/route.ts`, `src/app/api/shipping/rates/route.ts`, `src/components/product/reviews-list.tsx`). No `git stash` used; determined via `git diff --name-only` cross-reference. Note: task brief mentions 8 COMP-ticketed complexity items; only 6 live `complexity` warnings found — reconcile against `DOCS/checklist/01-complex-functions.md` (untracked) in proposal.

### 2. tsc + prettier

- `tsc --noEmit`: PASS, zero errors.
- `prettier --check`: 250 files drifted + 1 parse error (`openspec/config.yaml:30` — `tdd: true` mis-indented under a `- ` list, pre-existing at HEAD, breaks YAML parsing). Drift clusters: `messages/**` (~32 JSON locale files), `openspec/changes/archive/**` (~60+ SDD reports), `openspec/specs/**` (~16), `openspec/changes/security-csp-nonce/**` (5), `sdd/**` mirrors, `DOCS/**` (~13), root configs (`ARCHITECTURE.md`, `lighthouserc.json`, `next.config.ts`, `playwright.config.ts`, `postcss.config.mjs`). `next-env.d.ts` (generated) MUST go into `.prettierignore`, not be reformatted.

### 3. Imports audit

- Unsorted/unorganized: 156 `sort-imports` hits across ~60 files (biggest mechanical win).
- Unused imports: 0 reported (S0 `no-unused-vars` already green).
- Missing type-only imports: 3 (`consistent-type-imports`, listed above).
- Circular-import risk (spot-check): new untracked modules `src/lib/proxy/`, `src/lib/security/`, `src/lib/cron/`, `src/lib/supabase/typed.ts`, `src/app/api/internal/` interplay with heavily-touched `src/proxy.ts` — no cycle proven in this read-only pass; full `madge`/import-graph check deferred to proposal T-slice.

### 4. Tree audit

(a) Working tree (`git status --porcelain`, 114 entries):
- Slice-owned, KEEP (81 modified): S0 tooling (`eslint.config.mjs`, `package.json`, `next.config.ts`, `lighthouserc.json`, `.github/workflows/migrate-preview.yml`) + S1/S2/S3/followup source + test updates.
- Generated/derived, KEEP with regen note: `pnpm-lock.yaml` (regen: install; use npm/npx, pnpm binary broken), `src/types/database.types.ts` +549 lines (regen: DB-SYNC from Supabase).
- Archive moves pending staging, KEEP (stage as renames): 17 unstaged deletions under `openspec/changes/ecommerce-high-end-constitution/*` + `openspec/changes/client-warnings-fix/tasks.md` ↔ untracked `openspec/changes/archive/`.
- Slice-owned untracked, KEEP: `.editorconfig`, `.github/workflows/ci.yml`, `.husky/`, `.vscode/`, `openspec/specs/`, `sdd/`, `src/app/api/internal/`, `src/lib/{cron,proxy,security}/`, `src/lib/supabase/typed.ts`, `supabase/config.toml`, `src/app/[locale]/admin/{error,loading}.tsx`, 12 new test files (`t-csp-*`, `t-lhci`, `t-perf-hygiene`, `t-s0/s1/s2/s3-*`, `t-tooling-types`, `t-warnings-followup`).
- Needs confirmation: untracked `openspec/changes/security-csp-nonce/` (active change or archive candidate?).
- Candidate cleanup, USER DOCS — NEVER delete without explicit per-path confirm: `DOCS/DOCS/` (nested duplicate dir), `DOCS/PLANS/`, `DOCS/ROADMAP-NEXT-SDD.md`, `DOCS/catalog/`, `DOCS/checklist/`, `DOCS/legal/`.

(b) File tree (structural smells):
- `DOCS/DOCS/` nesting with non-ASCII/spaced names + uppercase extensions (`AGENT CONSTITUTION.MD`, `bahaus y neo bahaus.md`, `marca.md`, `Plan *. MD`) — normalize/denest only with approval.
- `sdd/` (Engram artifact mirror: `client-warnings-fix/`, `ecommerce-high-end-constitution/`) vs `openspec/changes/archive/` — dual-store overlap; keep both, document purpose in proposal.
- Oversized >150 lines (only 3 repo-wide): `src/types/database.types.ts` (549, generated — exempt), `src/app/api/admin/shipping/batch/route.ts` (161 — split candidate), `tests/unit/t-c04-proxy.test.ts` (152 — split candidate).

### 5. Smells sweep (read-only grep, `src/`)

- `as never`: 10 hits — `src/proxy.ts:77,80,90,120`, `src/components/shared/share-sheet.tsx:10`, `src/lib/rate-limit.ts:62`, `src/app/api/checkout/route.ts:46`, `src/app/api/webhooks/mercadopago/route.ts:69,75,84`.
- `as any`: 0. `console.*`: 0. TODO/FIXME: 0.
- Empty `catch {}` (fail-open): 4, all in `src/proxy.ts:25,37,40,86` — highest-priority smell (auth/session path).

### Approaches

1. **Mechanical-first chained cleanup** — T1 `eslint --fix` (sort-imports + type-imports), T2 prettier scope + ignore + config.yaml fix, T3 warnings (non-null + complexity), T4 smells + splits, T5 tree staging/renames. Pros: each slice verifies independently, fits ≤400-line budget. Cons: 5 slices of review overhead. Effort: Medium.
2. **Single big-bang cleanup commit** — one pass, one review. Pros: one review. Cons: violates force-chained ≤400-line rule and 800 budget (T1 alone touches ~60 files; prettier touches 250); unreviewable; gate forbids. Effort: High-risk.
3. **Warnings-only, defer tree** — skip DOCS/denest and archive staging. Pros: smaller. Cons: leaves maintainer's explicit "clean tree" goal unmet. Effort: Low but incomplete.

### Recommendation

Approach 1 (mechanical-first chained cleanup), sliced as:
- **T1 — imports sort + type-only (mechanical `--fix`)**: `sort-imports` (156) + `consistent-type-imports` (3). `eslint --fix` SAFE for both. FLAG: touches ~60+ files → needs `size:exception` approval upfront despite zero-semantic nature.
- **T2 — prettier drift + parser fix**: fix `openspec/config.yaml:30` YAML error first (blocks parsing), add `.prettierignore` for generated (`next-env.d.ts`, `database.types.ts`), then `prettier --write` scoped. Split T2a (code/config) / T2b (docs/archive/md/json) if >400 lines. `--fix` SAFE.
- **T3 — warnings by rule (manual)**: 30× `no-non-null-assertion` (justify-with-comment or refactor) + 6× `complexity` (extract helpers; `proxy:20`, `updateSession:17`, `getCustomer360:17`, rates `POST:17`, audit `POST:15`, `emit:13`) + reconcile 8 COMP tickets vs 6 live. NOT `--fix` safe.
- **T4 — smells + oversized splits**: 10× `as never` → typed alternatives, 4× empty-catch in `proxy.ts` → real error handling, split `batch/route.ts` (161) and `t-c04-proxy.test.ts` (152). NOT `--fix` safe.
- **T5 — tree cleanup**: `git add -A` archive renames, per-path approval list for `DOCS/DOCS` denest/renames, confirm fate of `openspec/changes/security-csp-nonce/`. NO deletions without explicit per-path approval.

### Risks

- T1/T2 line counts dwarf the 400-line slice limit by file count (not by semantic weight) — requires pre-approved `size:exception` for mechanical slices or further per-directory splits.
- `sort-imports --fix` reorders across 81 already-modified files → rebase/merge friction with the uncommitted slice stack; run T1 BEFORE any commit of the stack, verify suite green after.
- Prettier --write on 250 files (incl. archived SDD reports) may churn historical artifacts — T2b should either exclude `openspec/changes/archive/**` + `sdd/**` via `.prettierignore` or get explicit approval.
- `openspec/config.yaml` YAML error may break OpenSpec tooling reads — fix in T2 regardless.
- DOCS deletions/renames touch user-authored content (incl. non-ASCII filenames) — strict per-path approval gate, recoverable via git but needs user confirm.

### Ready for Proposal

Yes — proceed to `sdd-propose` for `repo-cleanup-final` with the 5-slice plan above; orchestrator should secure upfront: (a) `size:exception` for mechanical T1/T2, (b) per-path delete/rename approval list for T5, (c) ruling on `security-csp-nonce/` fate and archive/`sdd/**` prettier scope.
