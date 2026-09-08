# Delta for security-resilience (Slice S3, slice-B coordinated)

## Scope note

Security-adjacent items sequenced LAST with slice-B owner coordination (shared `proxy.ts` review). Fail-closed is the only intentional behavior change in the whole change; everything else is handling-only. Proposal file NOT rewritten.

## ADDED Requirements

### Requirement: Cron fail-open becomes fail-closed with documented dev fallback

The 3 cron guards (`keepalive`, `fx`, `cultura-sync`: `if (!secret) return true`) MUST deny with 401 when `CRON_SECRET` is unset in production. Local development MAY bypass via explicit flag `CRON_ALLOW_UNSET_SECRET=true`, honored ONLY when `NODE_ENV=development`; in any other environment an unset secret MUST 401. The flag name, dev-only behavior, and production denial MUST be documented where cron auth is configured.

#### Scenario: Production denies without secret

- GIVEN `CRON_SECRET` unset and `NODE_ENV=production`
- WHEN `GET /api/cron/fx` arrives
- THEN 401 is returned regardless of `CRON_ALLOW_UNSET_SECRET`

#### Scenario: Documented local bypass

- GIVEN `NODE_ENV=development` and `CRON_ALLOW_UNSET_SECRET=true`
- WHEN `GET /api/cron/keepalive` arrives without credentials
- THEN the request proceeds and the bypass is documented, never silent

### Requirement: proxy.ts void remediation under slice-B ownership

`proxy.ts:45,87,136` void-baits MUST be removed or replaced with real handling (cookie-option constant used, audit comment resolved into code or deleted) in a review owned or approved by the slice-B owner — S3-after-B-merge or single combined review. The security diff MUST stay pure: no Prettier churn beyond touched lines, no behavior change beyond the fail-closed cron rule.

#### Scenario: Sequenced review

- GIVEN slice-B still unmerged
- WHEN S3 edits `proxy.ts`
- THEN the S3 diff is rebased after B or combined in one owner-approved review, never a conflicting parallel edit

#### Scenario: Security diff purity

- GIVEN the merged S3 `proxy.ts` diff
- WHEN inspected
- THEN it contains only void remediation + cron-auth lines, with `tsc`/`eslint`/build green
