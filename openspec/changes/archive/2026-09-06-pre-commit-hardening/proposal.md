# Proposal: Pre-Commit Hardening Gate

## Intent

Gate all uncommitted work behind a zero-regression commit: close 4 carried pendings, fix 9 security gaps and 7 perf/quality gaps before ANY commit lands. Reviewable chained PRs keep reviewer load safe.

## Scope

### In Scope

- Slice A (~50-150 lines): W-S2-1 attribution, W-S2-2 DOCS repoint, checklist closable items, security-csp-nonce archive
- Slice B (~250-400 lines): Turnstile fail-closed, auth rate-limit wiring, security_logs hardening, CSP edge cases, env.ts depth — severity-ordered
- Slice C (~150-350 lines): cultura next/image, heavy-list dynamic imports, console.log removal, proxy dead-code removal, file-size/strict-TS sweep

### Out of Scope

- Checklist §1-6 product acceptances (editors/SEO/calendars/CRM/realtime/PWA) — not commit gates
- LHCI 90-gate enforcement (flake risk, uncommitted wiring) — noted, non-blocking
- New features, migrations, ecommerce-client-v2 backlog

## Capabilities

### New Capabilities

None — pure hardening, no new behavior domains.

### Modified Capabilities

- `security-resilience`: fail-closed Turnstile, auth tier, log-insert policy, CSP coverage, env validation
- `performance-scalability`: next/image cultura, dynamic imports, dead-code removal
- `change-hygiene`: pending closures, checklist close-out, archive readiness

## Approach

Hygiene-first chain stacked-to-main: A (unblocks archive queue) → B (severity-ordered security) → C (perf/quality). Each slice ≤400 lines, independently verifiable; staging curl evidence at deploy or explicit deferral. Cost-zero: no new external services.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `DOCS/checklist/01-complex-functions.md` | Modified | Close §8 closable items; fix lines 3/554 dangle |
| `openspec/changes/security-csp-nonce/` | Modified | Archive readiness (first domino after A) |
| `src/proxy.ts` | Modified | Fail-closed, auth tier, log inserts, dead code |
| `src/lib/security/csp.ts`, `src/config/env.ts` | Modified | CSP non-200 coverage; deeper validation |
| `src/app/[locale]/cultura/**`, `admin/easter` | Modified | next/image; console.log removal |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Staging curl needs deploy env | High | Defer explicitly with evidence ticket |
| W-S2-1 scope bleed (extra delete) | Med | Exclude/restore before delete PR |
| Upstash absent → memory fallback | Med | Document fallback; no shared state assumed |
| LHCI flake on first CI run | Med | Assert-only; non-blocking |

## Rollback Plan

Per-slice revert in stacked order C→B→A; docs-only A revert is trivial. No migrations, no data changes.

## Dependencies

- Slice A first: security-csp-nonce archive readiness depends on it
- Staging curl proof at deploy (task 3.2) or recorded deferral
- Upstash env presence determines rate-limit shared state

## Success Criteria

- [ ] All three slices verify PASS (tests + build); NO commit until then
- [ ] Archive queue unblocked; 4 pendings closed
- [ ] Each slice ≤400 lines, stacked-to-main

## Proposal question round

Auto mode — no live round. Assumptions for review: §1-6 acceptances stay non-gates; LHCI stays non-blocking; W-S2-1 exclusion holds. Correct or request a second round.
