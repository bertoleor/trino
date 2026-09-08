# Delta for observability-health (Slices S1/S2)

## Scope note

Covers the S1 catch→logging contract plus S2 segment error/loading gaps. S0 tooling baseline applies first. Proposal file NOT rewritten.

## ADDED Requirements

### Requirement: Converted-catch logging contract

Every converted catch MUST call `src/lib/logger.ts` with: level `error` for request-path failures (cron, api routes, proxy helpers), `warn` for expected fallbacks (fx last-rate fallback, clipboard/share); fields `route` (always) + `error: String(error)`; `requestId`/`userId` when available. Bodies, tokens, secrets, and headers MUST NEVER be logged. Errors already routed via ErrorBoundary/global-error MUST NOT double-log at the catch site.

#### Scenario: Cron failure logged without secrets

- GIVEN `fx` fetch throws with `CRON_SECRET` set
- WHEN the catch runs
- THEN `logger.error` emits route + error string, response is 200-fallback, no secret in the entry

#### Scenario: PII stays out of logs

- GIVEN a catch holding a request body with email
- WHEN logged
- THEN the entry contains route + error string only, no body fields

### Requirement: Segment error/loading coverage for touched routes

Every route this change touches MUST have a rendering contract on failure/loading: existing root `error.tsx`/`global-error.tsx` keep global coverage; touched segments missing scoped `error.tsx` (admin, `[locale]`) or `loading.tsx` MUST gain one reusing the shared ErrorBoundary + logger pattern and Bauhaus skeleton style. Untouched routes are out of scope.

#### Scenario: Touched admin segment crashes gracefully

- GIVEN a touched `/admin/*` page throws during render
- WHEN the segment boundary captures
- THEN an inline fallback with retry renders, a logger entry is created, no white screen

#### Scenario: Touched route shows loading state

- GIVEN a touched route awaiting data
- WHEN navigation occurs
- THEN its `loading.tsx` skeleton renders until content resolves
