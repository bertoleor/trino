# Contributing — santisima-trinidad (TRINO)

Welcome, and thank you for contributing. This project is a cost-zero high-end e-commerce platform
(Next.js 16 + Supabase + Upstash). Quality and security gates are non-negotiable; this guide tells
you exactly how to meet them.

## Table of contents

- [Before you start](#before-you-start)
- [Getting set up](#getting-set-up)
- [The mandatory pre-code checklist](#the-mandatory-pre-code-checklist)
- [Development workflow](#development-workflow)
- [Commit conventions](#commit-conventions)
- [Changesets](#changesets)
- [Pull requests](#pull-requests)
- [Code style](#code-style)
- [Testing](#testing)
- [Security](#security)
- [Documentation](#documentation)

## Before you start

Read the rule of law before writing a single line:

- `openspec/AGENT_RULES.md` — the **Constitution v3.1** enforcement checklist (154 rules across 13
  categories). Every PR is blocked unless it passes.
- `ARCHITECTURE.md` — boundaries, design tokens, data-model caps, cron and resilience model.
- `SECURITY.md` — supported versions and how to report vulnerabilities.

If a task violates a rule in `AGENT_RULES.md`, STOP and fix the violation before continuing — no
exceptions, no warnings.

## Getting set up

```bash
pnpm install
pnpm dev          # next dev
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint .
pnpm test         # vitest run
pnpm test:e2e     # playwright test
pnpm build
```

> **Windows note:** the `test` script pins `TEMP=E:/temp` (and `TMP`/`TMPDIR`) via `cross-env`
> because the tempdir default breaks upstream tooling. Do not remove those pins unless you know what
> you are doing.

Environment: copy `.env.local` from the hosting vault. Required keys are Supabase URL + anon +
service role, Upstash Redis, MercadoPago, and the cron secret. **Never commit `.env` or
`.env.local`.**

## The mandatory pre-code checklist

Before writing code, confirm every item (mapped to Constitution IDs):

- [ ] **CQ-03** — file ≤150 lines; extract hooks/subcomponents if near the limit
- [ ] **CQ-06** — strict TS, no `any`; validate with Zod, use generated
      `src/types/database.types.ts` (DB-SYNC-01)
- [ ] **CQ-07** — zero `console.*` — log via `src/lib/logger.ts` (OBS-01)
- [ ] **ENV-01** — env read through `src/config/env.ts` Zod fail-closed at boot
- [ ] **I18N-02** — zero string literals; use `t('ns.key')` via `next-intl`
- [ ] **MONEY-01** — `price_cents INT`, never float arithmetic
- [ ] **DB-02/04** — RLS on every table; soft delete via `deleted_at`
- [ ] **PERF-01** — pagination 25/100, no full-list loads
- [ ] **SEC-05** — CSP/HSTS headers maintained in `next.config.ts`

## Development workflow

1. Branch from `main` (the canonical branch).
2. Make a focused change. Small, atomic PRs review faster.
3. Keep DB types in sync: after any migration, run `pnpm gen:types` and commit the regenerated
   `src/types/database.types.ts`. CI enforces this with a drift guard — a migration without its
   regenerated types **fails CI**.
4. Add a changeset when the change is user- or release-visible (`pnpm changeset`).
5. Run the gates locally before pushing: `pnpm lint && pnpm typecheck && pnpm test`.
6. Open a PR using the template and request review.

## Commit conventions

Conventional Commits, scoped where sensible:

- `feat(scope): ...` — a user-visible feature
- `fix(scope): ...` — a bug fix
- `refactor(scope): ...` — no behavior change
- `docs: ...` — documentation only
- `chore(...): ...` — tooling, dependencies, CI
- `test(...): ...` — tests only
- `security(...): ...` — security fix (open a private advisory first, see [Security](#security))

Examples of scopes in use: `checkout`, `payments`, `shipping`, `i18n`, `cultura`, `wishlist`,
`reviews`, `security`, `health`.

## Changesets

Release notes are generated from [Changesets](https://github.com/changesets/changesets), not
handwritten (the historical `CHANGELOG.md` was reconstructed and is being migrated). For any
release-visible change:

```bash
pnpm changeset
```

Pick the bump level (`major`/`minor`/`patch`) matching your change. Commit the generated
`.changeset/*.md` file alongside your code. The Release workflow (`.github/workflows/release.yml`)
opens/updates a "Version Packages" PR and publishes when merged to `main`.

## Pull requests

Use the PR template. In particular:

- **Description** — what and why, link the issue.
- **Testing** — check off the gates you actually ran.
- **Security checklist** — the runbook is strict for a reason; fill it honestly.
- **Documentation updated** — README, ADR, or runbook if the behavior changed.
- **Changeset added** — required for release-visible work.

CI runs `lint`, `typecheck`, `prettier --check`, unit tests, E2E, Lighthouse CI and a Supabase types
drift guard. All must be green before merge. One review approval required; `CODEOWNERS` routes
security-critical paths (admin, payments, webhooks, DB, auth, infra).

## Code style

- **Formatting:** Prettier, enforced by `prettier --check` in CI and `lint-staged` on commit (with
  Tailwind + organize-imports plugins).
- **Linting:** ESLint 9 (Next + security + sonarjs + promise + import + a11y), zero warnings (CI
  runs `--max-warnings 0`).
- **Type safety:** `strict` TypeScript. No `any`, no `@ts-ignore`.
- **Imports:** organized by `prettier-plugin-organize-imports`.

## Testing

- **Unit/integration:** `vitest` under `tests/unit` and `tests/integration`.
- **E2E:** Playwright under `tests/e2e`.
- Coverage is tracked but the bar is caught regressions: if you fix a bug, add a test that fails on
  the old code.
- Run the full suite before a behavioral change merges: `pnpm lint && pnpm typecheck && pnpm test`.

## Security

Security is the top gate in this project (payments, RLS, CSP, HMAC webhooks). If you find a
vulnerability, do **not** file a public issue — see `SECURITY.md` for private reporting (private
GitHub advisory). For code that touches auth, payments, webhooks, admin, or rate limiting, be
explicit about the threat model in your PR and expect a security review from a `CODEOWNER`.

## Documentation

Keep docs next to the change:

- Architecture decisions → `docs/adr/NNNN-title.md`
- Deploy/ops change → also update `docs/DEPLOY.md` and the incident runbook in `docs/reports/` if
  relevant
- Product/service behavior → the matching spec under `openspec/specs/`

When uncertain whether a doc is current, treat `openspec/AGENT_RULES.md` rule DOC-01 as authority:
docs must reflect reality, not aspiration.

## Getting help

Open an issue using the provided template, or contact the maintainer named in `CODEOWNERS` /
`SECURITY.md`.

Thank you for keeping the gates green.
