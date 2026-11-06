# AGENTS — índice liviano — santisima-trinidad (TRINO)

> Núcleo liviano + referencias. Reglas completas y protocolos en `docs/` y `.atl/skill-registry.md`.
> Compaction-safe: re-cargar desde las referencias, no re-derivar.

## Identidad y estilo

E-commerce high-end (ritual/espiritual) — Next.js 16 App Router + Supabase Postgres RLS + Upstash
Redis. Regla de voz: **minúscula siempre, segunda persona** (sin mayúsculas en oraciones completas).
Artefactos técnicos en inglés; respuestas de producto/equipo en español rioplatense con voseo.

## Cargar antes de trabajar

- `.atl/skill-registry.md` — registro de skills del repo (vía `mem_search(skill-registry)` o lectura
  directa).
- `.agent/skills/` — SKILL.md específicos (supabase, nextjs-16, playwright, tailwind-4,
  deploy-to-vercel).
- `openspec/AGENT_RULES.md` — legacy read-only (reglas del ciclo SDD retirado; cambios por ODD feature doc).

## Fuentes de verdad por tema

- **Arquitectura y caps:** `ARCHITECTURE.md` (13 caps, límites, cron, observability, cost).
- **Proyecto de producto (planes/fases):** `docs/DOCS/*` + `plan-accion-2026-09-12.md`.
- **Legal/privacidad:** `docs/LEGAL.md`, `docs/TERMS.md`, `docs/RULES.md`, `docs/legal/`.
- **Catálogo/contenido:** `docs/catalog/` (CSV templates + README).
- **Especificaciones legacy:** `openspec/specs/` — referencia read-only; cada cambio nuevo vive en su feature doc ODD.
- **Deploy/ops:** `docs/DEPLOY.md`, `SECURITY.md`, `lighthouserc.json`.
- **i18n:** `messages/{es-AR,en,fr,pt-BR}/` — es-AR default, key drift es riesgo.
- **SQL / data model:** `supabase/migrations/` (0001→0022) + `src/types/database.types.ts`.

## Convenciones de cambio

- Cada cambio funcional va por ODD (feature doc + work-units); `openspec/` queda como referencia legacy read-only.
- Tests obligatorios: unit (`vitest`, TEMP=E:/temp) + e2e (`playwright`). Correr antes de commit.
- Gates: `pnpm typecheck` + `pnpm lint` (lint-staged+husky) verde. `lhci` en CI.
- Cambios versionados vía changesets (`pnpm changeset` → `.changeset/`).
- **Nunca inventar tokens/colores** — usar `docs/marca.md` + bahaus (`--primary #D95D39`).

## Verificación

- Ruta de verificación de untested: `tests/unit/*` (a00→l05) cubren guardrails, security, perf,
  i18n, legal, ops.
- Antes de declarar "hecho": `tsc --noEmit`, `vitest run`, gates de CI verdes.

## Docs

### Set infaltables de flota (v2) — rutas canónicas

- **Raíz:** `README.md` · `AGENTS.md` · `SECURITY.md` · `CONTRIBUTING.md` · `CHANGELOG.md` · `ARCHITECTURE.md` · `LICENSE`
- **`docs/`:** `docs/DESIGN.md` · `docs/API.md` · `docs/DATABASE.md` · `docs/marca.md` · `docs/plan-accion-YYYY-MM-DD.md` · `docs/runbooks/`
- Convención: `E:/Hermes/docs/sistema/docs-infaltables-proyectos.md`
- Pendientes (audit 19-writer 2026-10-19): `LICENSE` (ORN-219) · `docs/DATABASE.md` (ORN-221, gap B3) · `docs/runbooks/` (ORN-217) · mover `plan-accion-*.md` de raíz a `docs/` (ORN-218) · dir `DOCS`→`docs` (ORN-224)

### Resto de la docs

Canónicos en `docs/` — `docs/audits/` (reportes), `docs/adr/` (decisiones), `docs/reports/`,
`docs/plans/`, `docs/ciclo-no-tecnico/`. No dejar `.md` sueltos en raíz sin mover a `docs/` (o
`AGENTS.md`/`README.md`/`SECURITY.md`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
