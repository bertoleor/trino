# Changelog — trino.

Todos los cambios se registran vía [changesets](https://github.com/changesets/changesets)
(`.changeset/`). Para sumar una entrada: `pnpm changeset`. Los releases se generan con
`pnpm version` + `pnpm release`, que reescriben este archivo automáticamente — no editar a mano.

## 0.1.0 — scaffold inicial

- Next.js 16 App Router `[locale]` + React 19 + Tailwind 4 + next-intl (es-AR/en/fr/pt-BR).
- Supabase SSR + RLS, Upstash Redis (rate limit + cache), Zod 4, decimal.js (money), TanStack Query.
- Estructura de caps en `openspec/specs/*` (16 specs) + constitution de 154 reglas.

## Unreleased

Cambios en `main` posteriores al último corte, pendientes de `pnpm changeset` antes del próximo
release:

- perf(trino): next/image + memo en tienda/producto/reviews (ORN-62)
- fix(trino): RBAC locale-prefix bypass en proxy (ORN-62)
- ci(trino): gate de assertions (lhci, integridad de tipos, lint/tsc directo)
- chore(sdd): persistencia de estado del proyecto SDD (2.3/2.4/3.2 + verificación 10/10)

_Histórico previo reconstruido desde `git log` en la auditoría del 2026-09-12; consolidado aquí como
referencia. Los releases futuros se gestionan íntegramente por changesets._
