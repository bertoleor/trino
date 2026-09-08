# Delta for cultura-blog (Slice S1 — validation)

## Scope note

S0 (`tooling-config`) lands first and defines the rules this delta is measured against. Touch-only holds: Prettier applied solely to files this slice edits. Proposal file NOT rewritten; drift recorded in `tooling-config/spec.md`.

## ADDED Requirements

### Requirement: Cultura body strictness with fixtures-first gate

`body` in `src/lib/validations/cultura.ts` MUST NOT use `z.any()`; it MUST validate as structured TipTap JSON (rejecting non-conforming payloads) while every existing cultura fixture/test payload MUST continue to validate unchanged (fixtures run green BEFORE the tightening lands).

#### Scenario: Fixtures-first gate

- GIVEN existing cultura fixtures and tests
- WHEN the strict schema is applied
- THEN all fixture payloads validate and the cultura suite is green

#### Scenario: Malformed body rejected

- GIVEN a payload with `body` as a plain string or arbitrary shape
- WHEN validated
- THEN validation fails with a field-level error, no 500

### Requirement: Non-security void-bait removal

The 36 non-security `void`-bait lines (actions, shipping/cache, api routes, cultura-calendar, cultura-sync) MUST be removed by deleting dead expressions or replacing them with real handling; behavior MUST NOT change beyond minimal handling. `proxy.ts:45,87,136` are EXCLUDED (owned by S3/slice-B).

#### Scenario: Dead void removed

- GIVEN a `void "string"` bait with no side effect
- WHEN the slice lands
- THEN the line is gone, `tsc` + `eslint` stay 0, tests green

### Requirement: eslint-disable triage

Each of the 3 disables (`virtual-list`, `cookie-consent`, `analytics-consent`) MUST be removed or kept with an inline justification + ticket; zero unjustified disables MUST remain.

#### Scenario: Triage complete

- GIVEN the 3 disable sites
- WHEN lint runs after the slice
- THEN each site is either disable-free or carries justification + ticket

### Requirement: Empty catches become structured logs

All ~15 swallowed `catch {}` sites MUST call `src/lib/logger.ts` (existing utility, no new dependency) with level + route (contract defined in `observability-health` delta); catch blocks MUST NOT stay empty and MUST NOT log PII/secrets.

#### Scenario: Swallowed error surfaces

- GIVEN a failing `share.ts` clipboard call
- WHEN the catch runs
- THEN `logger.warn` emits with route and error string, UI behavior unchanged
