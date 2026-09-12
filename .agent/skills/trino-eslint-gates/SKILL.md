---
name: trino-eslint-gates
description: >
  trino. extreme cost-zero lint/Typescript/format gates. Trigger: When a PR might fail lint, add
  any/console/emoji, exceed complexity or line limits, needs an eslint-disable, unsorted imports, or
  Prettier drift. Run before committing.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. ESLint / Tooling Gates

Trace: tooling-config, build-tooling-freshness, change-hygiene. Config in `eslint.config.mjs`,
`.prettierrc.json`, `.editorconfig`, `vitest.config.ts`.

## Rules Set as ERROR (from eslint.config.mjs)

- `max-lines` — **max 150**, skipBlankLines + skipComments. Any touched file >150 lines must be
  split or justified with a waiver.
- `no-console` — error. Zero `console.*` anywhere (incl. admin easter inline script).
- **Emoji ban** — `no-restricted-syntax` `Literal[value=/[\u{1F300}-\u{1FAFF}]/u]` (CQ-08). No
  emojis in code.
- `@typescript-eslint/no-explicit-any` — **error**. No `z.any()`, no `as any`.
- `@typescript-eslint/no-unused-vars` — error.
- `@typescript-eslint/consistent-type-imports` — error. Use `import type { ... }`.
- `sort-imports` — **error**, with `memberSyntaxSortOrder: ['none','all','multiple','single']`.
  Imports MUST be auto-sorted (pre-commit hook fixes staged files).

## Rules Set as WARN

- `@typescript-eslint/no-non-null-assertion` — warn; each `!` needs written justification.
- Complexity trio (native, not sonarjs — paid/heavy plugin rejected): `complexity` warn **12**,
  `max-depth` warn **4**, `max-params` warn **4**.

## eslint-disable Policy

Any `eslint-disable` MUST carry a **justification + ticket reference** or be removed. Zero
unjustified disables (known sites: virtual-list, cookie-consent, analytics-consent — each must be
removed or justified). A bare `// eslint-disable-next-line` with no ticket fails lint.

## Ignore List (globalIgnores)

`.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `coverage/**`, `src/types/database.types.ts`.
Generated-types ignore keeps its ratified exception comment.

## Pre-commit / CI Automation (change-hygiene)

- **husky + lint-staged** run `eslint --fix` + `prettier --write` on **staged files only** at
  pre-commit (keeps slices ≤400 lines). Unstaged files untouched.
- CI MUST fail on eslint errors **and warnings**, and on `prettier --check` drift for touched files.
- Done gate: `tsc` 0 errors, `eslint .` 0 errors 0 warnings repo-wide, `prettier --check` passes on
  touched files.

## Prettier Baseline (.prettierrc.json)

`printWidth 100, singleQuote, semi, trailingComma es5, endOfLine lf, arrowParens always, tabWidth 2`.
Markdown `proseWrap preserve`. `.editorconfig`: lf, utf-8, 2-space indent, trim trailing whitespace.

## Build / Freshness Gate (build-tooling-freshness)

- Regenerate DB types `pnpm gen:types` against migration `0022`; `tsc --noEmit` 0 errors; file
  diff-clean vs fresh regen (drift guard fails the build on schema edits without regen).
- Supabase toolchain pinned: `[db] major_version = 15`, setup-cli pinned semver (never `latest`).

## Traps

- **Warnings fail CI too**, not just errors — a PR introducing an ESLint warning fails the pipeline.
- **Bulk reformat is rejected** — `prettier --write .` on a whole repo is allowed ONLY on an
  exception list with rationale. Touch-only.
- **`as unknown as` / `as any` money escapes are doubly banned** (see `trino-money-arithmetic`).
- **Consistent type imports** — mixing value/type imports in a single default import fails.
- **`noUncheckedIndexedAccess`** means `arr[i]` is `T | undefined` at typecheck — `tsc --noEmit`
  will flag unhandled access even if lint passes.
- Paid/heavy plugins (sort-import-sort, sonarjs, tailwind classes): rejected unless cost-zero AND
  justified; else record the native alternative. Cost-zero means no paid tier and no heavy extra
  dependency.
