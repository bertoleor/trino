# change-hygiene Specification

## Purpose

Keep `openspec/changes/` unambiguous: one active folder per in-flight change, archive as source of truth. No UI touched; no new accessibility surface.

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
