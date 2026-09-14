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
- `openspec/AGENT_RULES.md` — reglas de cambio (proposal → design → specs → tasks → verify).

## Fuentes de verdad por tema

- **Arquitectura y caps:** `ARCHITECTURE.md` (13 caps, límites, cron, observability, cost).
- **Proyecto de producto (planes/fases):** `docs/DOCS/*` + `plan-accion-2026-09-12.md`.
- **Legal/privacidad:** `docs/LEGAL.md`, `docs/TERMS.md`, `docs/RULES.md`, `docs/legal/`.
- **Catálogo/contenido:** `docs/catalog/` (CSV templates + README).
- **Especificaciones vigentes:** `openspec/specs/` (16 specs) — fuente de verdad funcional.
- **Deploy/ops:** `docs/DEPLOY.md`, `SECURITY.md`, `lighthouserc.json`.
- **i18n:** `messages/{es-AR,en,fr,pt-BR}/` — es-AR default, key drift es riesgo.
- **SQL / data model:** `supabase/migrations/` (0001→0022) + `src/types/database.types.ts`.

## Convenciones de cambio

- Cada cambio funcional sigue `openspec/AGENT_RULES.md` (openspec) y/o `sdd/` para protocolo.
- Tests obligatorios: unit (`vitest`, TEMP=E:/temp) + e2e (`playwright`). Correr antes de commit.
- Gates: `pnpm typecheck` + `pnpm lint` (lint-staged+husky) verde. `lhci` en CI.
- Cambios versionados vía changesets (`pnpm changeset` → `.changeset/`).
- **Nunca inventar tokens/colores** — usar `docs/DOCS/marca.md` + bahaus (`--primary #D95D39`).

## Verificación

- Ruta de verificación de untested: `tests/unit/*` (a00→l05) cubren guardrails, security, perf,
  i18n, legal, ops.
- Antes de declarar "hecho": `tsc --noEmit`, `vitest run`, gates de CI verdes.

## Docs

Canónicos en `docs/` — `docs/audits/` (reportes), `docs/adr/` (decisiones), `docs/reports/`,
`docs/plans/`, `docs/ciclo-no-tecnico/`. No dejar `.md` sueltos en raíz sin mover a `docs/` (o
`AGENTS.md`/`README.md`/`SECURITY.md`).
