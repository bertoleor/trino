# tooling-config Specification

## Purpose

Extreme, cost-zero lint/format baseline with automation so every later slice is verifiably clean. Trace: constitution zero-warnings gate; `openspec/config.yaml` style constraints.

*Created from `warnings-smells-cleanup` full spec on 2026-09-06 (NEW domain, additive-only archive).*

## Requirements

### Requirement: Strict TypeScript ESLint gate

Flat config MUST keep `next/core-web-vitals` + `next/typescript` green and set as error: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`; `consistent-type-imports` as error; `@typescript-eslint/no-non-null-assertion` as warn-or-error with written justification per site. `no-console` stays error; existing `max-lines 150` and emoji `no-restricted-syntax` stay. Any `eslint-disable` MUST carry a justification + ticket reference or be removed.

#### Scenario: Any-gate blocks merge

- GIVEN a PR adds `z.any()` or `as any`
- WHEN `pnpm lint` runs
- THEN it exits non-zero naming the file, line, and rule

#### Scenario: Unjustified disable fails

- GIVEN an `eslint-disable` without ticket reference
- WHEN lint runs
- THEN it fails until justification is added or the disable removed

### Requirement: Import order and complexity limits

Imports MUST be auto-sorted (`simple-import-sort` or native rule IF the plugin is cost-zero and dependency-justified, else `sort-imports` + member-syntax sort). Complexity MUST be bounded (`complexity` + `max-depth` + `max-params` native; `sonarjs` plugin ONLY IF cost-zero and justified, else the decision is recorded in `design.md`). `database.types.ts` generated-file ignore stays with ratified exception comment.

#### Scenario: Unsorted import fixed on commit

- GIVEN a staged file with unsorted imports
- WHEN the pre-commit hook runs
- THEN imports are auto-fixed and the commit proceeds clean

#### Scenario: Paid/heavy plugin rejected

- GIVEN a proposed plugin with install cost or paid tier
- WHEN evaluated
- THEN it is rejected and the native-rule alternative is recorded

### Requirement: Extreme Prettier baseline

Prettier MUST enforce `printWidth 100, singleQuote, semi, trailingComma es5, endOfLine lf` (already in `.prettierrc.json`) plus `arrowParens always`; Tailwind class-sorting plugin ONLY IF cost-zero and justified, else the rejection is recorded. `.vscode/settings.json` (currently `{}`) MUST set `formatOnSave` + default formatter Prettier; a new `.editorconfig` MUST declare `lf, utf-8, 2-space indent, trim trailing whitespace`.

#### Scenario: Save formats automatically

- GIVEN a developer saves a `.ts` file in VS Code
- WHEN format-on-save runs
- THEN the file matches `prettier --check` with no manual step

### Requirement: Pre-commit and CI automation

Husky + lint-staged MUST run `eslint --fix` + `prettier --write` on staged files only at pre-commit (justify this choice in design: staged-only keeps slices ≤400 lines). `package.json` MUST expose working `lint`, `format`, `format:check` scripts. CI MUST fail on `eslint` errors/warnings and on `prettier --check` drift for touched files.

#### Scenario: Staged-only hook

- GIVEN 3 staged + 10 unstaged dirty files
- WHEN committing
- THEN only the 3 staged files are linted/formatted; unstaged files untouched

#### Scenario: CI drift gate

- GIVEN a PR with a Prettier-dirty touched file
- WHEN CI runs
- THEN the check fails with the file list

### Requirement: Touch-only rollout and done criteria

Config MUST land first (S0). The 154 failures MUST be fixed touch-only inside owning slices; wholesale normalization of a file is allowed ONLY on the exception list with rationale. Done: `tsc` 0 errors, `eslint` 0 errors 0 warnings repo-wide, `prettier --check` passes on all touched files, hook verified by a simulated staged run.

#### Scenario: Bulk reformat rejected

- GIVEN a slice running bare `prettier --write .`
- WHEN reviewed
- THEN it is rejected unless every file is on the exception list

#### Scenario: Done gate green

- GIVEN S0 applied
- WHEN `tsc`, `eslint .`, and `prettier --check` on touched files run
- THEN all report zero issues and the hook simulation passes
