# Auditoría de documentación — TRINO (santisima-trinidad)

> Fecha: 2026-09-14 · Rol: 09-pm · Alcance: docs existentes + gaps vs código real.
> Estado: verificada contra `src/`, `supabase/`, `tests/`, `openspec/`, `messages/`.
> No es auto-reporte de auditoría nocturna: cada hallazgo cita evidencia file-only.

## Resumen ejecutivo

El proyecto tiene **documentación abundante pero no confiable**: una auditoría nocturna
(`2026-09-12`) marcó la mayoría como `UNVERIFIED` y reconstruyó README/CHANGELOG/ADRs
**sin revisión humana**. El código real está verde (95 tests, 22 migrations, 16 specs
openspec, 144 archivos `src/`), pero los docs canónicos no reflejan ese estado con
veracidad garantizada. El problema no es cantidad sino **verificación y orden**.

Hallazgos clave:

1. **CRÍTICO — Docs "de verdad" sin verificar.** `README.md`, `CHANGELOG.md`, `ARCHITECTURE.md`
   y los `docs/adr/*` llevan el banner `UNVERIFIED`. Son la primera puerta de entrada y
   hoy no se les puede confiar como fuente de verdad.
2. **ALTO — Estructura dispersa y duplicada.** Coexisten `docs/DOCS/` (planes de
   producto, mayúsculas), `docs/PLANS/`, `docs/legal/`, `openspec/specs/`, `sdd/` y
   `openspec/changes/archive/` — cuatro sistemas de documentación para el mismo proyecto.
3. **ALTO — Sin docs canónicos de origen en raíz.** No hay `AGENTS.md` ni `SOUL.md` en el
   repo (el AGENTS.md que me gobierna vive en `E:\Hermes\`, no en el proyecto). Un clon
   fresco no trae reglas de agente.
4. **MEDIO — `openspec/specs/` vs `changes/archive/` sin índice de "vigente".** 16 specs
   existen en `specs/`, pero 2 cambios siguen activos (`repo-cleanup-final`,
   `security-csp-nonce`) sin `verify.md` cerrado visible.
5. **MEDIO — `Steve` in docs missing deployment/monitoring handoff.** `docs/DEPLOY.md`
   existe pero no se validó contra `lighthouserc.json` ni el cron réel (`pg_cron`).

## Estado actual por área (verificado)

### Código (línea base sana)
- `src/`: 144 archivos. 13 caps de backend en `src/lib/` (analytics, auth, checkout,
  cron, customer360, db, easter, money, motion, orders, payments, perf, proxy,
  rate-limit, realtime, security, seo, share, shipping, social, supabase, validations).
- Rutas app: 24 `page.tsx` — tienda, producto/[slug], cultura, wishlist, legal (5 páginas),
  admin (cultura, calendar, easter, lanzamientos), account, login, signup, privacy, terms.
- `supabase/`: `config.toml` + 24 migrations (`0001`→`0022`) + `seed.sql`.
- Tests: **95** (94 unit + 1 e2e `auth-sync.spec.ts`), cubriendo a00→l05 + pr1/pr3.
- `messages/`: 4 locales × ~9 dicts (admin, auth, checkout, common, consent, emails,
  errors, legal). es-AR default.

### Docs existentes (mapa real)
```
README.md                       — quickstart + docs map (UNVERIFIED)
ARCHITECTURE.md                 — caps, límites, data model, cron, observability (UNVERIFIED)
CHANGELOG.md                    — reconstruido (UNVERIFIED)
SECURITY.md                     — política + contactos (sí verificada, concreta)
DEPLOY.md                       — docs/deploy
docs/adr/0001..0003             — stack, i18n, money-decimal (UNVERIFIED)
docs/audits/                    — 3 reportes nocturnos + este
docs/catalog/                   — cultura-20 + products-500 (templates CSV)
docs/checklist/01-complex-functions.md
docs/ciclo-no-tecnico/00-indice.md   — briefs por rol (product/uiux/writer/content/i18n/a11y/legal)
docs/DOCS/                      — AGENT CONSTITUTION, marca, bahaus, 3 planes de producto
docs/legal/                     — product-specs, invoicing, pages-coverage
docs/LEGAL.md / docs/TERMS.md / docs/RULES.md
docs/PLANS/ADMIN SIDE V.0.txt
docs/reports/2026-09-12-trino-producto-marketing-estilo.md
docs/ROADMAP-NEXT-SDD.md
openspec/AGENT_RULES.md + config.yaml
openspec/specs/ (16 specs vigentes)
openspec/changes/archive/ (6 cambios cerrados)
openspec/changes/ (2 activos)
sdd/ (2 carpetas heredadas, parcial)
plan-accion-2026-09-12.md         — plan de fases (UNVERIFIED, en raíz)
```

## Faltante — qué hay que generar (priorizado)

### Bloque A — Cerrar la verificación (bloqueante antes de confiar en nada)
- [ ] **A1. Re-verificar `README.md` + `ARCHITECTURE.md` + `CHANGELOG.md`** contra
      `src/` real y quitar banner `UNVERIFIED`, o reescribir si hay drift. Dueño: 19-writer.
- [ ] **A2. `README.md` → separar "Docs map" en índice canónico** apuntando a una sola
      fuente por tema (hoy apunta a `DOCS/` y `openspec/specs/` y `docs/` a la vez).

### Bloque B — Docs canónicos faltantes (nadie los pidió pero son necesarios)
- [ ] **B1. `AGENTS.md` del repo** (reglas de agente + provider + convenciones del
      proyecto). Hoy sólo existe el del workspace Hermes. Dueño: 09-pm.
- [ ] **B2. `CONTRIBUTING.md`** — no existe. Define flujo PR, changesets, lint-staged.
- [ ] **B3. `docs/DATABASE.md`** — no hay doc del data model; el schema vive en 24
      migrations SQL sin narrativa. Un dev nuevo no entiende el modelo desde los docs.

### Bloque C — Operación / salida a producción
- [ ] **C1. `docs/DEPLOY.md` ↔ `lighthouserc.json` ↔ cron**: validar que refleja el
      pg_cron réel (6h keepalive, 1h abandoned-cart, daily cultura-sync) y el gate LHCI.
- [ ] **C2. Runbook de incidentes** — no existe. (Observability/doc del cron ya en
      ARCHITECTURE, pero sin runbook de "qué hacer si cae Sentry/OTel").

### Bloque D — Producto (alinear docs con plan-accion)
- [ ] **D1. `plan-accion-2026-09-12.md` está en raíz y UNVERIFIED** → mover a `docs/plans/`
      y firmar las 3 decisiones de Fase 1 (owner: dueño/producto).
- [ ] **D2. Roadmap público versionado** — `docs/ROADMAP-NEXT-SDD.md` existe pero sin
      versionado; falta roadmap de producto visible (el `00-indice` lo marca como gap).

### Bloque E — Higiene (estructura)
- [ ] **E1. Consolidar `docs/DOCS/` + `docs/PLANS/` + `docs/legal/`** → una sola carpeta
      con casing consistente (kebab-case, sin espacios en nombres de archivo).
- [ ] **E2. Renombrar archivos con espacios** (`AGENT CONSTITUTION.MD`,
      `Plan backoffice ecommerce 2026 · MD`, `ADMIN SIDE V.0.txt`, `bahaus y neo bahaus.md`).
- [ ] **E3. Cerrar o archivar los 2 cambios openspec activos** (`repo-cleanup-final`,
      `security-csp-nonce`) con `verify.md` para que `changes/` quede limpio.

## Recomendación de orden

1. **A1+A2** (verificar README/ARCHITECTURE/CHANGELOG) — desbloquea todo lo demás.
2. **B1+B3+B3** (AGENTS, CONTRIBUTING, DATABASE) — no son opcionales para onboard.
3. **E1+E2+E3** (higiene) — barato, elimina confusión.
4. **C1+C2** (deploy/runbook) — antes de primer release público.
5. **D1+D2** (producto) — requiere firma del dueño.

## Notas para el equipo

- @19-writer: A1/A2/A3 (verificar README/CHANGELOG/ADRs) es tuyo. El CHANGELOG está
  reconstruido de `git log` — conviene convertirlo a changesets reales (ya hay `.changeset/`).
- @21-content: `docs/catalog/` tiene templates pero sin dueño de contenido. B3 (glosario)
  y calendario ritual/lunar son de tu área en Fase 3 del plan-accion.
- @10-uiux: `docs/DOCS/marca.md` + `bahaus y neo bahaus.md` definen tokens, pero el ciclo
  marca "sin evidencia de corrida del design-system test". t-a08b/t-a08 existen — verificar.
- @20-devrel: B2 (CONTRIBUTING) + C2 (runbook) caen natural en devrel/DX.