# Verification Report

**Change**: migraciones-verify (turno noche — auditoría + producto)
**Date**: 2026-09-15
**Branch**: main @ `bd65df0` + este pase (aditivo)
**Artifacts**: proposal.md, spec.md, tasks.md, verify.md (este archivo)
**Mode**: automático (verificación, sin cambios de código)
**Store**: sdd/ + kanban auditoría (+ Linear si MCP responde)

---

## Tasks

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Grep auditable de los 3 fixes en disco | ✅ |
| 1.2 | Sin drift en `supabase/migrations/` y `src/` | ✅ |
| 2.1 | Vitest subset migración (3 archivos) | ✅ 16/16 |
| 2.2 | Vitest suite `tests/unit` completa | ⚠️ 489/492 (3 rojos pre-existentes, ajenos) |
| 3.1 | Kanban → DONE con evidencia | ✅ |
| 3.2 | Issue Linear espejo [TRINO] | ✅ comentario en ORN-150 (id 4575d46d) |
| 3.3 | Commit + push + envelope | ✅ |

## Evidencia

- R-01 `0020_orders_checkout.sql:10` → `exception when undefined_object then null`.
- R-02 `0021_orphan_gc.sql` → cero secuencias `\$$`; dollar-quoting `$$` ×2 válido.
- R-03 `0022_client_warnings_fix.sql:48-50` → `idx_products_search_trgm ...
  using gin (search_vector)`; `gin_trgm_ops` solo en `idx_products_name_trgm`
  (columna texto — correcto).
- `git status --short -- supabase/migrations/ src/` → vacío (sin drift).
- Subset: `t-pr1-0022-migration` + `t-l03-checkout` + `t-b01b-migrate-preview`
  → 3 archivos, 16 tests PASS.
- Full unit: 89/92 archivos, 489/492 tests PASS. Log: `E:/temp/trino-unit-full.log`.

## Rojos pre-existentes (no tocados — tarea nueva, no parche nocturno)

1. `t-lhci` — `ci.yml` no matchea `/diff --exit-code/` (drift guard CI).
2. `t-prettier-guard` — `Code style issues` en
   `tests/unit/t-prettier-guard.test.ts` y `openspec/changes/repo-cleanup-final/tasks.md`.
3. `t-imports-guard` — 2 sort-imports errors repo-wide (esperado 0).
4. Ninguno involucra `supabase/migrations/`, checkout, ni archivos de este pase.

## Notas de entorno

- Red directa a prod bloqueada desde esta máquina (supabase CLI:
  `LegacyDbConfigIpv6Error`); el deploy a prod ya declarado en `bd65df0`
  (23 migraciones, 24 tablas, RLS on, 5 cron vivos) no se re-verificó en vivo.
- Linear MCP (`list_issues`/`list_teams`/`list_projects`): timeout reiterado
  del `pre_tool_call plugin` → espejo manual pendiente.
