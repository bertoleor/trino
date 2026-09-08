# Delta for cultura-blog

## ADDED Requirements

### Requirement: T4 as-never narrowings fixtures-first

Each of the 10 `as never` sites MUST be replaced by a typed narrowing; where Zod governs, fixtures MUST run green before tightening (Trace: strict-TS, fixtures-first gate).

#### Scenario: Narrowed without fixture break

- GIVEN 10 `as never` sites incl. `proxy.ts:77,80,90,120`, `share-sheet:10`, `rate-limit:62`, checkout + webhook routes
- WHEN replaced with typed alternatives and suites run
- THEN 0 `as never` remain in scope and all fixture payloads still validate
