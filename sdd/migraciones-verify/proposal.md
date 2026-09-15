# Proposal: migraciones-verify

## Intent

Verificar que el fix de migraciones 0020/0021/0022 (HEAD `bd65df0`) deja el
deploy verde y no requiere cambios de código. Foco del turno noche:
migraciones pendientes → auditar, no re-tocar lo ya deployado.

## Estado de partida (auditoría)

- HEAD `bd65df0 fix(db): reparar migraciones 0020/0021/0022` ya aplicado.
  - 0020: `alter type order_status` robusto a tipo ausente (`undefined_object`).
  - 0021: dollar-quoting `$$` válido (rompía re-aplicación).
  - 0022: `idx_products_search_trgm` con `gin` (no `gin_trgm_ops` sobre tsvector).
- Commit msg declara deploy manual de 23 migraciones a prod
  (`asbyqyxrpfggxjujfqte`): 24 tablas, RLS on, `has_role`/`get_customer_360` OK,
  5 jobs cron vivos.
- Working tree limpio salvo untracked no-código
  (`docs/reports/identidad-*`, `openspec.config.yaml`, `supabase/.temp/`).
- Red directa a prod bloqueada desde esta red (IPv6 no soportado por
  `supabase link`); verificación = estática + tests locales.

## Scope

### In Scope

- Chequeo estático de 0020/0021/0022 (sintaxis clave del fix).
- Corrida de tests unitarios trazables: `t-pr1-0022-migration`,
  `t-l03-checkout`, `t-b01b-migrate-preview`, más suite unit completa.
- Actualización kanban (auditoría) + espejo Linear si el MCP responde.

### Out of Scope

- Nuevas migraciones, re-aplicar en prod, cambios de código.
- RLS two-role integration (requiere supabase-local; gateway separado).
- Upgrades de dependencias, E2E, k6.

## Approach

Delta-cero en código: solo artefactos SDD + kanban. Si algún test falla en
rojo, se abre tarea nueva en vez de parchear a ciegas de noche.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `sdd/migraciones-verify/*` | Created | proposal/spec/tasks/verify de este pase |
| `docs/audits/2026-09-12-general-trino-gaps-kanban.md` | Modified | mover migraciones a DONE |
| Linear [TRINO] espejo | Modified | solo si el MCP responde |
