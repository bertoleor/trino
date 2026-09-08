## Exploration: que-hay-pendiente-en-engram

### Current State
Three SDD cycles are archived PASS (ecommerce-high-end-constitution, client-warnings-fix,
tooling-ci-regeneration). Roadmap P1 is done. P2 `security-csp-nonce` has explore, proposal,
spec, design, and tasks in both Engram (obs #888/#896/#897) and the filesystem, but has no
apply-progress, verify-report, or archive-report, and the code still shows static
`script-src 'self'` with no `x-nonce`. P3 `client-mobile-perf` and backlog
`ecommerce-client-v2` exist only as roadmap text with zero SDD artifacts.

### Affected Areas
- `openspec/changes/security-csp-nonce/` — in-flight change, T-P2-01 unchecked, needs apply
- `src/proxy.ts` — no nonce generation or `x-nonce` stamping found
- `next.config.ts` — still static `script-src 'self'`, no proxy/static split
- `src/app/layout.tsx`, 4 JSON-LD pages — no `nonce` attributes
- `tests/` — no `t-csp-nonce` test present
- `openspec/changes/ecommerce-high-end-constitution/` — stale duplicate of archived change
- `docs/ROADMAP-NEXT-SDD.md` — P3 + backlog definitions, no artifacts yet

### Approaches
1. **Finish P2 first (single T-P2-01 slice)** — apply proxy nonce + 4 sites + static split,
   then verify + archive.
   - Pros: all planning done, unblocks P3, isolated, no migration
   - Cons: none material
   - Effort: Low (~300 lines, 1 PR stacked-to-main)

2. **Start P3 in parallel** — explore `client-mobile-perf` now.
   - Pros: early scouting
   - Cons: violates stacked-to-main order, P3 depends on P2 CSP green, rework risk
   - Effort: Medium

3. **Jump to ecommerce-client-v2 features** — buy-again / related / share.
   - Pros: visible value
   - Cons: builds on unverified CSP + unhardened perf, highest risk
   - Effort: High

### Recommendation
Approach 1: apply, verify, and archive `security-csp-nonce` as the immediate first slice,
then propose `client-mobile-perf`. It is the only in-flight change with complete planning
and a single unchecked task.

### Risks
- Stale duplicate change folder (`ecommerce-high-end-constitution`) confuses routing.
- `sdd/` mirror folder missing tooling + csp-nonce copies (minor hybrid drift).
- P3 scope creep past the 400-line budget if started before P2 lands.

### Ready for Proposal
Yes — propose closing `security-csp-nonce` (apply slice) or, for new work, propose
`client-mobile-perf` explore with the P2 dependency noted.
