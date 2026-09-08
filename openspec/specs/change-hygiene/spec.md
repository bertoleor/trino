# change-hygiene Specification

## Purpose

Keep `openspec/changes/` unambiguous: one active folder per in-flight change, archive as source of truth. No UI touched; no new accessibility surface.

Synced from `que-hay-pendiente-en-engram` delta spec on 2026-09-06 (new capability — no prior main spec existed).

## Requirements

### Requirement: Single Source of Truth for Archived Changes

The archive copy of a completed change MUST be authoritative. Active `openspec/changes/` MUST list only in-flight work.

#### Scenario: Stale duplicate detected

- GIVEN `openspec/changes/ecommerce-high-end-constitution/` exists alongside its archive copy
- WHEN the change list is audited
- THEN the duplicate is flagged stale and the archive copy is declared authoritative

### Requirement: Safe Stale-Duplicate Removal

The system MUST delete the stale duplicate only after proving the archive copy is intact and restorable. The delete MUST be a pure removal with no behavior change.

#### Scenario: Guarded delete

- GIVEN the archive copy is verified intact (proposal, spec, design, tasks present)
- WHEN the stale `openspec/changes/ecommerce-high-end-constitution/` folder is deleted
- THEN `openspec/changes/` contains no duplicate and routing resolves unambiguously

#### Scenario: Accidental delete is recoverable

- GIVEN the duplicate was deleted in error
- WHEN restored from git history or the archive copy
- THEN all original artifacts return byte-identical

### Requirement: Pending Attribution Close-Out (W-S2-1)

The system MUST record an explicit exclude-or-restore decision for pending W-S2-1 before any commit lands, with file:line evidence in the change tasks.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Exclude-or-restore recorded

- GIVEN pending W-S2-1 is carried uncommitted
- WHEN slice A is verified
- THEN tasks.md records "excluded" with rationale or "restored" with file:line proof

### Requirement: DOCS Dangling Reference Repoint (W-S2-2)

`DOCS/checklist/01-complex-functions.md` MUST NOT reference the removed `openspec/changes/ecommerce-high-end-constitution/` path; lines 3 and 554 MUST point at the archive copy.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Dangling links repointed

- GIVEN lines 3/554 reference the deleted active path
- WHEN slice A is applied
- THEN both lines resolve to the archive path and no stale reference remains

### Requirement: Checklist Closable Items Close-Out

Each closable §8 checklist item MUST close with file:line evidence; product acceptance items (§1-6) MUST stay open as non-gates.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Closable item closed with evidence

- GIVEN a §8 item marked closable in the proposal
- WHEN slice A is verified
- THEN the item is checked with a file:line citation a reviewer can open

### Requirement: Archive Readiness Gate (security-csp-nonce)

`openspec/changes/security-csp-nonce/` MUST meet archive criteria (proposal, spec, design, tasks present; verify suite green) before slice A is declared PASS.

*Synced from `pre-commit-hardening` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Archive queue unblocked

- GIVEN slice A passes tests and build
- WHEN the archive check runs on `security-csp-nonce`
- THEN all four artifacts exist and the change is archivable with no residue in active changes
