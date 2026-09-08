# Delta for change-hygiene

## ADDED Requirements

### Requirement: T5 quarantine table schema

The spec MUST define a per-path table with columns path, current class, proposed disposition, recoverability, approval status defaulting to UNAPPROVED (Trace: staged-only, recoverability).

#### Scenario: Table complete, none approved by default

- GIVEN candidates `DOCS/DOCS/`, `DOCS/PLANS/`, `ROADMAP-NEXT-SDD.md`, `catalog/`, `checklist/`, `legal/`, `security-csp-nonce/`
- WHEN the table is reviewed
- THEN every path has all five columns and approval reads UNAPPROVED until the user signs

### Requirement: T5 approval gate with keep-class criteria

No destructive apply SHALL occur without per-path user approval; keep-class MUST cover slice-owned, generated-with-regen-command, and legit-new paths (Trace: no unapproved destruction).

#### Scenario: Destructive action blocked

- GIVEN a row proposing delete/rename still UNAPPROVED
- WHEN apply is attempted
- THEN the action is refused and the tree is unchanged
