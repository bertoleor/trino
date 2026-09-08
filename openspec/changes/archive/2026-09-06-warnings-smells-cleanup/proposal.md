# Proposal: Warnings & Smells Cleanup

## Intent

Hard gates are green (tsc/eslint/build 0) — this is hygiene, not breakage. Debt sits below the gates: 154 Prettier failures, 39 void-baits, 3 cron fail-opens, 1 `z.any()`, 3 eslint-disables, ~15 empty catches, ~30 `as-never` casts. Goal: zero-warning constitution compliance via reviewable stacked slices with no behavior change (except minimal handling + documented fail-closed).

## Scope

### In Scope
- S1 gate violations: `cultura.ts:7` z.any→strict (fixtures-first), non-security void-bait removal, 3 eslint-disables remove-or-justify, ~15 empty catches→structured logging via `src/lib/logger.ts`
- S2 casts + robustness: ~30 as-never clusters tightened (fixtures-first), `database.types.ts` generated-file exception ratified, segment error/loading gaps for touched routes
- S3 security-adjacent: `proxy.ts:45,87,136` voids + 3 cron fail-open→fail-closed, sequenced with slice-B owner

### Out of Scope
- Bulk `prettier --write`; easter word-copy (specified behavior); behavior changes beyond minimal handling; unrelated dirty files; `.npmrc`/pnpm mismatch (tracked follow-up, no install)

## Capabilities

### New Capabilities
None — pure hygiene, no new behavior.

### Modified Capabilities
- `security-resilience`: cron fail-open→fail-closed, proxy void hygiene
- `observability-health`: empty-catch→structured logging, segment error/loading gaps
- `cultura-blog`: cultura body schema strictness (z.any removal)

## Approach

S1→S2→S3 stacked-to-main, each ≤400 lines, total ≤800. Prettier touch-only: format solely files each slice edits, never bulk `--write` (preserves slice caps + security-diff purity). Fixtures-first for schema/cast tightening. Each slice verified via tsc/eslint/build + grep collectors.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/validations/cultura.ts:7` | Modified | z.any→strict schema |
| `src/lib/actions/*`, shipping/cache, api routes (~17 files) | Modified | void-bait removal |
| 3 eslint-disable sites; ~15 catch sites | Modified | triage; logger handling |
| ~30 cast sites; `src/types/database.types.ts` | Modified | tighten; exception record |
| `src/proxy.ts:45,87,136`; 3 cron routes | Modified | S3, slice-B coordinated |
| touched files only | Modified | prettier touch-only |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| proxy.ts collides with slice-B review | Med | same-owner sequencing; S3-after-B-merge or single combined review |
| fail-closed breaks dev cron without secret | Med | documented local env fallback |
| stricter schema rejects payloads | Low | fixtures-first; cultura tests green first |
| prettier churn blows slice caps | Low | touch-only enforced per slice |

## Rollback Plan

Revert stacked branches in reverse (S3→S2→S1) via `git revert`; each slice independently revertible, gates re-run after each revert.

## Dependencies

- Slice-B owner coordination for `proxy.ts` + cron (S3 sequenced after B lands, or same-owner combined review — combined review is faster but couples security diffs; S3-after-B is cleaner but slower)
- Cultura fixtures/tests green before S1 schema tightening

## Success Criteria

- [ ] tsc/eslint/build 0; Prettier clean on all touched files
- [ ] 0 z.any, 0 unjustified disables, 0 empty catches, 0 void-baits outside agreed exceptions
- [ ] All slices ≤400 lines, total ≤800; S3 reviewed with slice-B owner
