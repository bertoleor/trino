# Tasks: migraciones-verify

## Fase 1 — Verificación estática (R-01..R-03)

- [ ] 1.1 Grep auditable de los 3 fixes en disco | Test script/terminal |
      Accept las 3 aserciones en verde
- [ ] 1.2 Confirmar working tree sin drift en `supabase/migrations/`
      (`git status --short`) | Accept solo untracked no-código

## Fase 2 — Tests (R-04, TDD: rojo abriría tarea nueva)

- [ ] 2.1 `vitest run` subset: `t-pr1-0022-migration`, `t-l03-checkout`,
      `t-b01b-migrate-preview` | Accept 3 archivos PASS
- [ ] 2.2 `vitest run tests/unit` completa | Accept PASS sin fallos

## Fase 3 — Tableros + cierre (R-05)

- [ ] 3.1 Mover tarjeta kanban auditoría → DONE con evidencia
- [ ] 3.2 Actualizar issue Linear espejo [TRINO] (o declarar bloqueo MCP)
- [ ] 3.3 `verify.md` + commit + push (aditivo, sin borrados) + envelope
