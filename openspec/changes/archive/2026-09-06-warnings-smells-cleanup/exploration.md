## Exploration: warnings and code smells cleanup

### Current State

The worktree carries uncommitted slices A/B/C + hardening (proxy, turnstile, audit route, CSP, env, rate-limit, cultura pages, reviews-list, easter, json-ld, layout, providers, next.config + tests). Against that worktree, the hard gates are green: `npx tsc --noEmit` exit 0, `npx eslint . --no-warn-ignored` exit 0, `npm run build` exit 0 (green). The real debt is **below the gates**: 154 files fail `prettier --check` (systemic, never enforced), 39 `void`-bait lines across ~20 files, 3 fail-open `if (!secret) return true` cron guards (pre-existing, `git diff` empty on those files), 1 `z.any()` in `src/lib/validations/cultura.ts:7` (pre-existing), 3 `eslint-disable` comments, ~15 swallowed `catch {}` blocks, and ~30 `as never` / `as unknown` casts. Zero `console.*` calls exist in `src/` — the easter inline-script `console.log` was already excised by uncommitted work; only the specified word-copy (`console trino…` text) remains, which is behavior — keep. The `void`-strings at `src/proxy.ts:45,87,136` are pre-existing (confirmed via `git diff -- src/proxy.ts`: they are context lines, untouched by slice-B) and live in a slice-B security file — coordinate, don't duplicate.

### Affected Areas

- `src/proxy.ts:45,87,136` — 3 pre-existing `void`-string bait lines in slice-B security file (coordinate with slice-B owner)
- `src/app/api/cron/keepalive/route.ts:8`, `src/app/api/cron/fx/route.ts:6`, `src/app/api/cron/cultura-sync/route.ts:8` — fail-open `if (!secret) return true` (pre-existing, no diff)
- `src/lib/validations/cultura.ts:7` — `body: z.any().optional()` (pre-existing strict-TS violation)
- `src/lib/actions/cart.ts:5`, `src/lib/actions/reviews.ts:6,63`, `src/lib/actions/cultura-bulk.ts:47`, `src/lib/actions/wishlist.ts:6-7`, `src/lib/shipping/cache.ts:5`, `src/app/api/shipping/rates/route.ts:3-4`, `src/app/api/health/ready/route.ts:13,36`, `src/app/api/admin/shipping/batch/route.ts:43,94,117-118`, `src/components/admin/cultura-calendar.tsx:27`, `src/lib/social/cultura-sync.ts:16-17`, and 8 more files — remaining 36 `void`-bait lines
- 154 files repo-wide — `prettier --check` failures (all uncommitted-touched `src/` files included; systemic, never enforced)
- `src/components/shared/virtual-list.tsx:18`, `src/components/shared/cookie-consent.tsx:23`, `src/components/shared/analytics-consent.tsx:9` — 3 `eslint-disable` comments
- `src/proxy.ts:25,37,40,89`, `src/lib/share.ts:27`, `src/lib/money/fx.ts:7`, `src/lib/shipping/cache.ts:10`, `src/app/sitemap.ts:28`, plus 6 more — ~15 empty `catch {}` swallowing errors
- `src/types/database.types.ts` (549 lines) — exceeds 150-line limit but explicitly ignored in `eslint.config.mjs:21`; generated via `supabase gen types` (constitution exception to confirm)
- `src/app/error.tsx` + `src/app/global-error.tsx` exist; no segment-scoped `error.tsx` (admin, `[locale]`), `loading.tsx` only for tienda/cultura — missing granularity
- `.npmrc` (pnpm `store-dir`/`cache-dir` keys) + `packageManager: pnpm@11.25.0` vs broken pnpm binary — every npm/npx invocation emits 2 config warnings; `lucide-react ^1.39.0` major looks anomalous vs lockfile (not verified, no install run)

### Approaches

1. **Gate-first slices (S1: violations, S2: dead code/size, S3: security/API hygiene)** — S1 removes `z.any`, `void`-baits in non-security files, and confirms zero-console/TODO (fast, mechanical, ≤400-line slices); S2 splits nothing (only generated file exceeds 150 lines — confirm exception instead) and dedups `as never` clusters; S3 hardens the 3 cron fail-opens + documents `enqueueSecurityAudit` fire-and-forget as intentional.
   - Pros: respects force-chained ≤400-line slices and 800 budget; defuses scope conflict on `proxy.ts` by isolating it to S3 with slice-B owner coordination; each slice independently verifiable via existing `t-perf-hygiene` + grep collectors.
   - Cons: Prettier reformat (154 files) dwarfs the budget if done as code churn — must be a formatting-only slice or excluded.
   - Effort: Low (S1) / Medium (S2) / Medium (S3)

2. **Big-bang `prettier --write .` + all fixes in one change** — single pass over everything.
   - Pros: one-shot zero-warnings state.
   - Cons: violates force-chained ≤400-line slices and the 800 review budget; formatting churn obscures security-file diffs (`proxy.ts` etc.); conflicts with uncommitted slices' pending review.
   - Effort: High (review cost, not work cost)

### Recommendation

Approach 1 with explicit scope guards: S1 (zero-warning gate violations: `z.any` → `z.unknown()`/`z.record`, non-security `void`-baits, `eslint-disable` triage, empty-`catch` logging via `src/lib/logger.ts`), S2 (cast-cluster cleanup + `database.types.ts` generated-file exception ratified + segment `error.tsx`/`loading.tsx` gaps), S3 (`proxy.ts:45,87,136` + 3 cron fail-opens, coordinated with slice-B owner, not duplicated). Prettier: do NOT bulk `--write`; enforce `format:check` in CI going forward and format only files each slice touches (keeps slices ≤400 lines). No `npm install` (pnpm binary broken); record `.npmrc`/packageManager mismatch as a tracked follow-up, not this change.

### Risks

- `src/proxy.ts` edits collide with uncommitted slice-B security review — S3 must be sequenced after slice-B lands or owned by the same author.
- Cron fail-open fix (`return true` → 401/deny) can break local/dev cron invocations that rely on unset `CRON_SECRET` — needs env fallback documented, not silent behavior change.
- `z.any()` → stricter schema may reject existing cultura payloads — check fixtures/tests before tightening.
- Bulk Prettier formatting inside slices would blow the 400-line slice cap and pollute security diffs — enforce touch-only formatting.
- `tsconfig` lacks `noUnusedLocals`/`noUnusedParameters` — unused imports are invisible to the `tsc` gate; rely on eslint `next/typescript` rules only.

### Ready for Proposal

Yes — proceed to `sdd-propose` with change `warnings-smells-cleanup`, slices S1/S2/S3 as above, force-chained stacked-to-main, budget 800. Tell the user: gates are green so this is hygiene, not breakage; the only security-sensitive items (proxy void-strings, cron fail-opens) are pre-existing and sequenced last with owner coordination.

### Collectors (commands run, read-only)

- `npx tsc --noEmit` → exit 0, no output (strict + `noUncheckedIndexedAccess`; note: no `noUnusedLocals`/`noUnusedParameters`)
- `npx eslint src --no-warn-ignored` → exit 0; `npx eslint . --no-warn-ignored` → exit 0 (`no-console:error`, `max-lines:150`, `database.types.ts` ignored)
- `npx prettier --check src tests` → 154 files with style issues (`Code style issues found in 154 files`); touched uncommitted files all included
- `npm run build` → exit 0; warnings: npm `store-dir`/`cache-dir` unknown-config warns (2, pre-existing `.npmrc`/pnpm mismatch) + Next `Warning: Custom Cache-Control headers detected for /_next/static/(.*)` (from `next.config.ts` uncommitted headers); route table shows `ƒ Proxy (Middleware)`, no deprecation warnings
- No `npm install` run per instructions; lockfile evidence only (`pnpm-lock.yaml` present, `packageManager pnpm@11.25.0`)

### Counts

| Class | Count | Pre-existing vs uncommitted |
|---|---|---|
| TS errors | 0 | — (gate green) |
| ESLint errors/warnings | 0 | — (gate green) |
| `console.*` in `src/` | 0 calls (word-copy in easter text only — specified behavior, keep) | uncommitted work excised the inline `console.log` |
| TODO/FIXME/HACK | 0 | — |
| Prettier warns | 154 files | systemic pre-existing; touched files still unformatted |
| `void`-bait lines | 39 matches / ~20 files (proxy.ts 3) | all pre-existing (diff-confirmed for proxy.ts, cron, cultura, cart, reviews) |
| Fail-open `if (!secret) return true` | 3 cron routes | pre-existing; `turnstile.ts:7` correctly fail-closed (`return false`) |
| `z.any` / `as any` / ts-ignore | 1 (`cultura.ts:7`) | pre-existing |
| `eslint-disable` | 3 | pre-existing |
| Empty `catch {}` | ~15 sites | pre-existing |
| `as never` / `as unknown` | ~30 sites | mostly pre-existing (proxy.ts casts touched by uncommitted refactor) |
| Files >150 lines (`src/`) | 1 (`database.types.ts`, 549, eslint-ignored generated) | pre-existing |
| Build warnings | 2 classes (npm config ×2, Next Cache-Control ×1) | npm config pre-existing; Cache-Control from uncommitted `next.config.ts` |
