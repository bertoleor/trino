# docs/ — índice baseline trino.

## Baseline canónico (empezar acá)

| Doc | Responde a | Fuente verificada |
|---|---|---|
| `overview.md` | qué es trino. | `README.md`, `ARCHITECTURE.md`, `src/app/` |
| `stack.md` | framework / stack | `package.json`, `next.config.ts`, `src/config/env.ts` |
| `setup.md` | cómo se arma | `package.json` scripts, `src/config/env.ts`, `vercel.json` |
| `identidad-visual.md` | identidad visual, tokens | `docs/brand/` (manual vigente, 2026-11-23) |
| `brand/` | manual de marca canónico (tokens, voz, logos, AA) | Figma Make + descargables oficiales |
| `funciones.md` | funciones por capacidad | `src/app/`, `src/app/api/`, `src/lib/`, `openspec/specs/` |

## Resto de la carpeta

- `adr/` — ADRs (0001 stack, 0002 i18n, 0003 money; estado `accepted`).
- `audits/` — auditorías (incluye `2026-09-14-docs-auditoria-y-faltante.md`, origen de este baseline).
- `catalog/` — templates CSV (cultura-20, products-500).
- `checklist/` — checklist de funciones complejas.
- `ciclo-no-tecnico/` — briefs por rol no técnico.
- `DEPLOY.md` — deploy. `LEGAL.md` / `TERMS.md` / `RULES.md` — legales y reglas.
- `DOCS/` — briefs originales (constitución y 3 planes de producto). Los docs de marca
  y estética anteriores fueron retirados.
- `legal/` — product specs, facturación AFIP/KeyCAE, pages coverage.
- `PLANS/` — planes heredados. `reports/` — reportes (producto, identidad, runbook).
- `ROADMAP-NEXT-SDD.md` — roadmap.

## Convención

Nombres kebab-case, sin espacios. Los seis baseline son la puerta de
entrada; el detalle vive en las fuentes que cada uno cita. No duplicar:
si un dato cambia en código, se actualiza el baseline que lo cita.

## Estado de verificación (ORN-112 · Bloque A+B)

| Doc | Estado |
|---|---|
| `overview.md` / `stack.md` / `setup.md` / `identidad-visual.md` / `funciones.md` | ✅ verificado (fuentes en tabla de arriba); `branding.md` y `marca.md` cancelados el 2026-11-23 |
| `docs/adr/0001-0003` | ✅ `accepted` (sin banner UNVERIFIED) |
| `README.md` / `ARCHITECTURE.md` / `CHANGELOG.md` (raíz) | ✅ verificados |
| `docs/audits/2026-09-12-*` + `ciclo-no-tecnico/00-indice.md` | histórico: conservan el banner UNVERIFIED de su fecha — no reescribir |
| Queda pendiente | ver detalle en `docs/audits/2026-09-14-docs-auditoria-y-faltante.md` (B3 DATABASE, E-higiene, D2 roadmap) |
