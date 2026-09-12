---
name: trino-feature-flags
description: >
  trino. feature flags: <1s kill switch without redeploy (DEV-01), env-based and flag-file based,
  fail-closed, plus generateMetadata per entity (DEV-02). Trigger: When gating a new feature, wiring
  a kill switch, or adding dynamic OpenGraph metadata.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Feature Flags

Trace: DEV-01 (admin-backoffice), DEV-02 (generateMetadata).

## Goal

A feature flag must provide a **<1s kill switch without redeploy** (DEV-01). If a feature spikes
errors (trigger: 5% err / p95>3s / 503>30s), operations flips a flag off — no deploy.

## Flag Sources (two mechanisms coexist)

### 1. Env-flag pattern (rollout triggers, cross-checked in design)

Applies to provider/feature availability where a config toggle is natural. Existing examples from
the codebase:

- `PAYMENTS_STRIPE_ENABLED=false`, `PAYPAL_ENABLED=false` (intl payment providers gated off by
  default)
- `EASTER_ENABLED=true` (easter-egg feature)

Env flags are validated via `src/config/env.ts` Zod (see `trino-security`) with the
PUBLIC/SERVER/CRITICAL classification. Env changes still require a deploy/restart — **not a <1s
switch**, so use them only for startup-bound toggles, not hot kill switches.

### 2. Flag-file switch — `flags.new_checkout_active` (hot kill switch)

- `src/lib/flags.ts` is the canonical reader. Implemented pattern deferred/hot-read so toggling
  takes effect in **<1s without redeploy**.
- Example name: `flags.new_checkout_active`. A `false` value immediately disables the new checkout
  path with no deploy.
- **Must be read at request time** (edge/serverless), not baked into a build-time constant —
  otherwise it is not a <1s kill switch.

## Rules

### MUST

- Feature flags MUST be **fail-closed for new/risky paths** — default off, explicit on.
  Missing/unknown flag → disabled.
- Kill-switch flags MUST take effect **<1s without redeploy**; verify the read path is not
  build-compiled.
- `generateMetadata` per product/entity for dynamic OpenGraph (DEV-02) — each entity type provides
  its own metadata.
- Document the flag in code (name, purpose, default) + where cron/rollout config documents it.

### SHOULD

- Pair every high-risk rollout with a kill switch and a defined trigger (err/percentile) that flips
  it.
- Keep the flag reader a single module (`src/lib/flags.ts`) so consumer code names the flag via one
  typed API.

### NEVER

- ❌ Bake the kill-switch flag into `next.config` / build-time constant (defeats <1s switch).
- ❌ Treat env flags (Stripe/PayPal) as hot kill switches — they are deploy-time toggles.
- ❌ Refer to flags by raw string literals in multiple files — centralize in `flags.ts`.
- ❌ Leave a flagged-off dead branch behind permanently — promise teardown once the feature is
  stable.

## Traps

- The spec's canonical example is `flags.new_checkout_active` — align new hot switches to that
  `flags.*` namespace.
- `gap-analysis` flagged flags as **SHALLOW**: `src/lib/flags.ts` was mentioned but not yet present.
  If it does not exist yet, introduce it as the single reader — do NOT scatter
  `process.env.NEXT_PUBLIC_*` checks across components.
- Verify the flag is read per-request; a server-component default export can otherwise cache the
  value.
- Kill-switch fail-closed means an outage of the flag store disables the feature, not silently
  enables it.
