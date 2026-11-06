# trino. — Transformación a tienda digital de maquillaje

**Feature:** Convertir trino. de e-commerce esotérico a tienda digital de maquillaje e insumos
**Paleta nueva:** rosa, lila, possibly celeste
**Nombre:** TRINO. (mayúscula + punto final + negrita en UI)
**Estado:** DRAFT — en exploración y planificación

## 1. Problema Actual

trino. es actualmente un e-commerce high-end de productos esotéricos multi-creencia con:
- Paleta Neo-Bauhaus: terracota #D95D39, verde #2B4731, mostaza #E6AF2E, celeste #7A9E9F
- Estructura de catálogo: 3 facetas combinables (tipo/tradición/intencion)
- Voice: minúscula siempre, segunda persona cálida
- 25 migraciones Supabase (0001→0025)
- Catálogo CSV con 500+ productos esotéricos

Se requiere pivotar a tienda digital de maquillaje e insumos con paleta rosa/lila/celeste.

## 2. Nuevo Enfoque

- **Rubro:** Maquillaje e insumos (labios, ojos, rostro, herramientas)
- **Paleta visual:** Rosa, lila, celeste (por definir tonos exactos)
- **Nombre:** TRINO. — siempre en mayúscula con punto final, peso bold en UI
- **Catálogo:** Nueva estructura para productos de maquillaje con variantes de tono/marca/textura
- **Base de datos:** Nuevas tablas/columnas para shade ranges, undertones, finish types

## 3. Files to Modify (impact analysis)

### 3.1 Branding & Visual Identity
- `DOCS/branding.md` — actualizar rubro, paleta, voz
- `DOCS/identidad-visual.md` — actualizar tokens de color, reglas de composición
- `src/styles/tokens.css` — reemplazar `--primary`, `--color-verde`, `--color-mostaza` por nuevos tokens rosa/lila/celeste
- `design-system/TRINO/CONTRASTE.md` — actualizar tabla de contraste

### 3.2 Catálogo y Productos
- `docs/catalog/README.md` — reestructurar triple taxonomy para maquillaje
- `docs/catalog/` — actualizar CSV template (columns, enums, validaciones)
- `supabase/migrations/` — nuevas migraciones para tabla `makeup_products` (o reemplazo completo)

### 3.3 Voice & Copy
- `DOCS/marca.md` — actualizar reglas de voz (puede mantenerse o ajustarse)
- Copy en components: badges, botones, labels con nuevo tono

### 3.4 UI Components
- Components de tarjetas de producto, selectores de tono, filtros por color
- Estados hover/active con nueva paleta
- Badges con colores mostaza → nuevo color de categoría

## 4. Tareas (orden sugerido)

|| ID | Task | Route | Trigger |
|----|------|-------|---------|
| T1 | **Actualizar palette de colores en `tokens.css` e `identidad-visual.md`** | ✅ **COMPLETADO** | Writer (single unit) |
| T2 | **Reestructurar `marca.md` con nuevo rubro y voz** | ✅ **COMPLETADO** | Writer |
| T3 | **Rediseñar CSV catalog para productos de maquillaje** | ✅ **COMPLETADO** | Writer (inline) |
| T4 | **Crear nuevas migraciones Supabase para esquema de maquillaje** | ✅ **COMPLETADO** | Writer |
| T5 | Actualizar components UI con nueva paleta | ⏳ Pendiente | delegated writer |
| T6 | Actualizar docs/catalog/README con nueva taxonomy | ⏳ Pendiente | Writer |
| T7 | Ejecutar tests unitarios y e2e con nueva palette | ⏳ Pendiente | Verification |

## 5. Evidencia Requerida

- **Paleta definida:** 3-5 colores principales (rosa principal, lila secundario, celeste acento, más tonos de sombra/labios/ojos)
- **CSV structure:** Columnas nuevas + enums actualizados, manteniendo compatibilidad donde sea posible
- **Schema DB:** Migraciones que añaden tablas o columnas sin romper RLS policies
- **Tests:** Suite pasa con nuevos colores (0 rojo en visual regression)

## 6. Próximo Paso Imediato

Definir la paleta de colores exacta (tonos específicos de rosa, lila, celeste) antes de modificar cualquier file. Esto evitará rework.

**¿Definí la paleta o necesitás buscar referencias antes de continuar?**

--- 
*Documento creado para tracking ODD. Ver también: `plan-accion-2026-09-12.md` (contexto previo).*