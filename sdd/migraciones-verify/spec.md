# Spec: migraciones-verify

## Requisitos

### R-01 — Fix 0020 verificable en disco

- `supabase/migrations/0020_orders_checkout.sql` captura `undefined_object`
  (no `duplicate_object`) en el bloque `alter type order_status`.
- Escenario: re-aplicación idempotente cuando el tipo no existe → `null`, sin error.

### R-02 — Fix 0021 verificable en disco

- `supabase/migrations/0021_orphan_gc.sql` usa dollar-quoting `$$` válido,
  sin secuencias `\$$` escapadas que rompían la re-aplicación.

### R-03 — Fix 0022 verificable en disco

- `supabase/migrations/0022_client_warnings_fix.sql` crea
  `idx_products_search_trgm` con `using gin` (tsvector), sin `gin_trgm_ops`.

### R-04 — Tests trazables en verde

- `t-pr1-0022-migration`, `t-l03-checkout`, `t-b01b-migrate-preview` PASS.
- Suite `tests/unit` completa PASS (rojo → tarea nueva, no parche ciego).

### R-05 — Tableros al día

- Kanban auditoría: migraciones en DONE con evidencia.
- Issue Linear espejo [TRINO] actualizado (si MCP disponible).

## Criterios de aceptación

- [ ] R-01..R-03 chequeados por script estático + grep auditable.
- [ ] R-04: vitest subset + suite unit en verde (log guardado).
- [ ] R-05: kanban movido; Linear actualizado o bloqueo declarado.
- [ ] Cero cambios en `src/`, `supabase/migrations/`, cero borrados.
