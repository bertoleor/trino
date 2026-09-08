# Delta for security-resilience

## ADDED Requirements

### Requirement: T4 proxy fail-closed catches with slice-B coordination

The 4 empty catches in `src/proxy.ts:25,37,40,86` MUST become fail-closed with logger calls; edits MUST be sequenced with the slice-B owner (Trace: fail-closed auth).

#### Scenario: Auth-path failure denies safely

- GIVEN a session/cookie helper throws inside proxy
- WHEN the hardened catch runs
- THEN request denies safely, `logger.error` emits route + error string, no secret/PII logged

#### Scenario: Slice-B preserved

- GIVEN slice-B owns overlapping proxy lines
- WHEN T4 edits proxy.ts
- THEN changes are rebased after B or co-reviewed, never a conflicting parallel edit

### Requirement: T4 oversized split-or-justify

Each file over the 150-line limit MUST be split with documented module boundaries or justified with a complexity budget + ticket; generated `database.types.ts` (549) is exempt with regen command (Trace: 150-line limit).

#### Scenario: Split or justified

- GIVEN `batch/route.ts` (161), `t-c04-proxy.test.ts` (152), `database.types.ts` (549 generated)
- WHEN T4 lands
- THEN the two candidates are split or ticket-justified and the generated file cites its regen command
