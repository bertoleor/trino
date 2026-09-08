# Delta for tooling-config

## ADDED Requirements

### Requirement: T1 import-order mechanical done criteria

Imports MUST reach 0 `sort-imports` + 0 `consistent-type-imports` errors repo-wide after `eslint --fix`; the diff MUST be zero-semantic proven by full suite green (Trace: zero-warnings gate).

#### Scenario: Mechanical sort lands clean

- GIVEN 156 sort + 3 type-import errors pre-fix
- WHEN `eslint --fix` runs then `eslint .` + full suite run
- THEN lint reports 0/0 and suite is green with no behavior diff

#### Scenario: Size exception bounded

- GIVEN T1 touches ~60 files over 400-line budget
- WHEN reviewed under granted size:exception
- THEN diff contains only import-order lines, no logic change

### Requirement: T2 prettier touched-scope with archive exclusion

Prettier `--check` MUST pass on touched scope; archived reports MUST be excluded via `.prettierignore` (Trace: format baseline).

#### Scenario: Touched scope green, archives untouched

- GIVEN 250 drifted files incl. `archive/**` + `sdd/**`
- WHEN T2 sweep runs with `.prettierignore` exclusions
- THEN touched scope is `--check` clean and no archive file is reformatted

### Requirement: T2 config.yaml parse fix

`openspec/config.yaml:30` MUST parse and be readable by tooling after the indent fix (Trace: tooling reads config).

#### Scenario: Config parses

- GIVEN `tdd: true` mis-indented under a list
- WHEN fixed and `config.yaml` parsed
- THEN parse succeeds with no error
