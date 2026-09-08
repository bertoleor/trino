# Delta for change-hygiene

## ADDED Requirements

### Requirement: Pending Attribution Close-Out (W-S2-1)

The system MUST record an explicit exclude-or-restore decision for pending W-S2-1 before any commit lands, with file:line evidence in the change tasks.

#### Scenario: Exclude-or-restore recorded

- GIVEN pending W-S2-1 is carried uncommitted
- WHEN slice A is verified
- THEN tasks.md records "excluded" with rationale or "restored" with file:line proof

### Requirement: DOCS Dangling Reference Repoint (W-S2-2)

`DOCS/checklist/01-complex-functions.md` MUST NOT reference the removed `openspec/changes/ecommerce-high-end-constitution/` path; lines 3 and 554 MUST point at the archive copy.

#### Scenario: Dangling links repointed

- GIVEN lines 3/554 reference the deleted active path
- WHEN slice A is applied
- THEN both lines resolve to the archive path and no stale reference remains

### Requirement: Checklist Closable Items Close-Out

Each closable §8 checklist item MUST close with file:line evidence; product acceptance items (§1-6) MUST stay open as non-gates.

#### Scenario: Closable item closed with evidence

- GIVEN a §8 item marked closable in the proposal
- WHEN slice A is verified
- THEN the item is checked with a file:line citation a reviewer can open

### Requirement: Archive Readiness Gate (security-csp-nonce)

`openspec/changes/security-csp-nonce/` MUST meet archive criteria (proposal, spec, design, tasks present; verify suite green) before slice A is declared PASS.

#### Scenario: Archive queue unblocked

- GIVEN slice A passes tests and build
- WHEN the archive check runs on `security-csp-nonce`
- THEN all four artifacts exist and the change is archivable with no residue in active changes
