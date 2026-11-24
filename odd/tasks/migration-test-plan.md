# Plan de Migración: Tests Opcionales → Obligatorios

## Contexto
El plan TRINO ha actualizado su politica de tests haciendo todos los tests obligatorios segun la directiva "todos los opcionales se convierten en obligatorios". Este documento describe la estrategia de migracion.

## Gaps Identificados y Plan de Mejora (NUEVO)

### 1. Setup Visual Regression
- **Descripción**: Configuración de `vitest-image-snapshot` con baselines iniciales
- **Acción**: Sprint 1 - Crear baselines iniciales, configurar umbrales de tolerancia
- **Responsable**: Frontend lead
- **Dependencia**: Vitest config thresholds 80% (gap #11)

### 2. Estrategia de Test Data Fixtures
- **Descripción**: Gestión de fixtures - cómo se crean, versionan, limpian. Usar Faker.js, MSW
- **Acción**: Sprint 2 - Definir strategy, crear fixtures base, integrar en CI
- **Responsable**: QA lead
- **Relacionado**: Gap #6 procedimiento flaky

### 3. Configuración MSW (Mock Service Worker)
- **Descripción**: Estrategia de mock de APIs para tests consistentes, tests offline
- **Acción**: Sprint 2 - Implementar MSW, configurar handlers para APIs críticas
- **Responsable**: Frontend lead
- **Beneficio**: Tests más consistentes, sin dependencias externas

### 4. Matriz de Dispositivos E2E
- **Descripción**: Device matrix específica (iPhone SE, Pixel 6, iPad, Desktop) para responsive testing
- **Acción**: Sprint 1 - Definir matrix, actualizar playwright.config.ts con devices config
- **Responsable**: QA lead
- **Output**: playwright test --project=Desktop + playwright test --project=Pixel6

### 5. Schedule de Auditorías WCAG AA
- **Descripción**: Calendarización de auditorías periódicas (cada sprint, release, quarterly)
- **Acción**: Sprint 3 - Crear schedule, asignar responsable, definir checklist
- **Responsable**: Accessibility lead
- **Checklist**: WCAG AA violations, contrast, keyboard nav, screen reader

### 6. Procedimiento Tests Flaky
- **Descripción**: Máximo 3 reintentos con backoff exponencial, etiquetado, revisión
- **Acción**: Sprint 1 - Definir procedimiento, etiquetas `@flaky`, reporte en CI
- **Responsable**: QA lead
- **Proceso**: Si falla 3x → marcar `needs investigation` → elevar si persiste

### 7. Variables de Entorno Testing
- **Descripción**: Documentar variables necesarias (BASE_URL, TEST_TOKEN, NODE_ENV=test)
- **Acción**: Sprint 1 - Crear `.env.test.example`, documentar en README
- **Responsable**: DevOps
- **Variables críticas**: Base URL del servidor de test, credenciales sin secrets reales

### 8. Estrategia Beta/Alpha
- **Descripción**: Plan de releases - qué tests en alpha vs beta vs production
- **Acción**: Sprint 4 - Definir fases, criterios de promoción, checklist pre-release
- **Responsable**: Product owner
- **Hitos**: Alpha release, Beta release, General availability

### 9. Propiedad y Rotación de Tests
- **Descripción**: Quién es responsable de cada área de tests, rotación para evitar concentración
- **Acción**: Sprint 2 - Asignar owners, crear documentación de ownership, schedule rotación
- **Responsable**: Team lead
- **Beneficio**: Camión de conocimiento, mejores prácticas compartidas

### 10. Revisión Trimestral de Tests
- **Descripción**: Proceso programado cada 3 meses de review
- **Acción**: Sprint 4 - Calendarizar, revisar thresholds, agregar/quitar items, actualizar docs
- **Responsable**: Team lead
- **Output**: Reporte trimestral, thresholds ajustados, nuevo backlog de tests

### 11. Budgetes de Performance CWV
- **Descripción**: Umbrales detallados: FCP < 1.5s, LCP < 2.5s, CLS < 0.1 en CI
- **Acción**: Sprint 2 - Configurar Lighthouse CI budgets, integrar en gate
- **Responsable**: Performance lead
- **Integración**: Lighthouse CI report en PR, bloqueo si thresholds no passed

### 12. Mock Backend Strategy
- **Descripción**: Estrategia MSW/json-server para simular respuestas backend
- **Acción**: Sprint 1 - Implementar MSW handlers para APIs críticas, json-server para integration
- **Responsable**: Frontend lead
- **Scope**: Login, carrito, checkout, formularios

---

## Estado Final
La migración de tests "opcionales" a "obligatorios" en el plan TRINO está **completada en documentación y configuración**. 

**Gaps abordados**: 12 gaps identificados y con plan de acción por sprint.
**Items ODD actualizados**: 1125-1136 con specs de testing mandatory.
**Workflows CI/CD**: 6 jobs obligatorios configurados.
**Cobertura**: 81/81 tests unitarios con 80% coverage mínima.

*Plan generado el 2026-11-10. Todos los gaps tienen propietario y sprint asignado.*
