# Proposal: Clear Pending Work

## Intent

One in-flight change (`security-csp-nonce`) is fully planned but never applied, leaving a known CSP gap live, and a stale duplicate change folder confuses routing. Clearing pending work first restores a trustworthy baseline before any P3/backlog work starts.

## Scope

### In Scope

- Slice 1: apply, verify, and archive `security-csp-nonce` (single task T-P2-01: proxy nonce + `x-nonce`, static split in `next.config.ts`, nonce on layout + 4 JSON-LD pages, `t-csp-nonce` test)
- Slice 2: delete stale duplicate `openspec/changes/ecommerce-high-end-constitution/` (archive copy is source of truth)

### Out of Scope

- P3 `client-mobile-perf` (no artifacts; starts only after P2 is green)
- Backlog `ecommerce-client-v2` features (buy-again, related, share)
- New roadmap or scope beyond closing the two items above

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `security-resilience`: close pending nonce-based CSP requirement via `security-csp-nonce` T-P2-01

## Approach

Finish P2 first, then clean up. Slice 1 executes the existing planned task as-is (no replanning); slice 2 is a pure delete. Each slice ships as its own chained PR (force-chained strategy, 800-line budget), so P3 can start as soon as slice 1 archives.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/changes/security-csp-nonce/` | Modified | Apply → verify → archive existing plan |
| `src/proxy.ts`, `next.config.ts`, `src/app/layout.tsx` | Modified | Nonce implementation (slice 1) |
| `openspec/changes/ecommerce-high-end-constitution/` | Removed | Stale duplicate delete (slice 2) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSP nonce breaks inline scripts | Med | Verify suite + staging check before archive |
| P3 started before P2 lands, causing rework | Med | Hard dependency: P3 explore blocked on slice 1 archive |
| Wrong folder deleted in cleanup | Low | Confirm archive copy intact before deleting duplicate |

## Rollback Plan

Slice 1: revert the single chained PR (restores static `script-src 'self'`). Slice 2: restore deleted folder from git history or the archive copy.

## Dependencies

- None external. Slice 2 is independent; slice 1 blocks all P3 work.

## Success Criteria

- [ ] `security-csp-nonce` archived with verify PASS and `x-nonce` present at runtime
- [ ] No duplicate active change folder; `openspec/changes/` lists only in-flight work
- [ ] P3 `client-mobile-perf` unblocked with P2 green as precondition
