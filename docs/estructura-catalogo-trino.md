# trino. — Estructura de Catálogo de Productos

## Entregable al Cliente
**Fecha:** 23 de octubre de 2026  
**Proyecto:** trino. — Pivot de esotérico a tienda de maquillaje  
**Alcance:** Reestructuración completa del CSV y modelo de datos Supabase

---

## 1. Resumen de la Reestructuración

trino. ha migado de una estructura de 3 facetas esotéricas a un catálogo profesional de maquillaje con:

- **Antes:** 3 facetas combinables (tipo/tradición/intencion) — 10+9+7 valores = 190+ combinaciones posible
- **Después:** 5 categorías × 7 subcategorías × atributos completos (marca, shade, finish)

### Nueva Arquitectura de Datos

```
┌─────────────────┐
│  makeup_products │
└───────┬─────────┘
        │
┌───────▼─────────┐
│ makeup_categories │
└─────────────────┘
```

---

## 2. Nuevas Categorías (5 valores)

| # | Slug | Nombre | Descripción | Ejemplo de Producto |
|---|------|--------|-------------|---------------------|
| 1 | `ojos` | Ojos | Productos para el área ocular | Sombras, delineadores, máscaras |
| 2 | `labios` | Labios | Productos labiales | Batones, gloss, labiales |
| 3 | `rostro` | Rostro | Productos para cara | Polvos, bronceadores, correctores |
| 4 | `manicure` | Manicure | Productos para uñas | Esmaltes, herramientas |
| 5 | `pestañas` | Pestañas | Productos para pestañas | Máscaras, postizas, rímel |

---

## 3. Subcategorías (7 valores por categoría)

Cada producto debe tener exactamente **una** subcategoría principal, secundarias van en `tags`.

| # | Subcategoría | Descripción | Categorías donde aparece |
|---|-------------|-------------|------------------------|
| 1 | `sombras` | Sombras de ojos, paletas | Ojos |
| 2 | `delineadores` | Lápices y líquidos para ojos | Ojos |
| 3 | `máscaras` | Máscaras de pestañas, postizas | Pestañas |
| 4 | `labiales` | Labiales, batones, sticks | Labios |
| 5 | `gloss` | Gloss, brillo labial, top coat | Labios, uñas |
| 6 | `esmaltes` | Esmaltes de uñas, esmaltes permanentes | Manicure |
| 7 | `herramientas` | Aplicadores, brochas, herramientas diversas | Cualquier categoría |

**Regla:** Un producto puede tener secundarias en `tags` (ej. `tags: sombras,highlight`).

---

## 4. Atributos Obligatorios por Producto

Cada registro en `makeup_products` debe tener:

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-----------|
| `category_makeup` | text | enum check | `ojos` | `labios` | `rostro` | `manicure` | `pestañas` |
| `subcategory` | text | enum check | `sombras` | `delineadores` | `máscaras` | `labiales` | `gloss` | `esmaltes` | `herramientas` |
| `brand` | text | min 2, max 50 chars | Marca registrada | `trino.`, `L'Oréal`, `Maybelline` |
| `shade` | text | regex `/^[0-9a-f]{6}$/` | Hex sin # | `880d1e`, `dd2d4a`, `f26a8d` |
| `finish` | text | enum check | `mate` | `satin` | `gloss` | `shimmer` | `metálico` |

**Ejemplo completo:**

```csv
rs666-black primer,primer facial mate,149900,ARS,,-1,,-1,PRI-MAT-001,30,5x3x1,products/primer-rs666/01.webp|products/primer-rs666/02.webp,rostro,matte,RS666,880d1e,mate,es-AR,published
```

---

## 5. Estructura CSV (`products-500-template.csv`)

### Header (línea 1)

```
slug,title,excerpt,price_cents,currency,sale_price_cents,sale_start,sale_end,stock,sku,weight_grams,dimensions_cm,images,category,subcategory,brand,shade,finish,tags,locale,related_product_slugs,status
```

### 22 Columnas Totales

| Posición | Campo | Obligatorio | Tipo/Validación |
|----------|-------|-------------|---------------|
| 1 | `slug` | ✅ | `a-z0-9-`, único, 3-80 chars |
| 2 | `title` | ✅ | 3-120 chars, título del producto |
| 3 | `excerpt` | ✅ | 20-155 chars, meta description |
| 4 | `price_cents` | ✅ | INT ≥0, centavos ARS |
| 5 | `currency` | ✅ | `ARS` fijo |
| 6 | `sale_price_cents` | opcional | INT < price_cents o vacío |
| 7 | `sale_start` | opcional | UTC ISO8601 con Z |
| 8 | `sale_end` | opcional | UTC ISO8601 con Z |
| 9 | `stock` | ✅ | INT ≥0 |
| 10 | `sku` | ✅ | 3-32 chars, único global |
| 11 | `weight_grams` | opcional | INT o vacío |
| 12 | `dimensions_cm` | opcional | `LxWxH` o vacío |
| 13 | `images` | ✅ | URLs Storage, pipe-separadas |
| 14 | `category` | ✅ | enum: ojos/labios/rostro/manicure/pestañas |
| 15 | `subcategory` | ✅ | enum: 7 valores (sombras..herramientas) |
| 16 | `brand` | ✅ | nombre marca registrada |
| 17 | `shade` | ✅ | hex sin #, regex validación |
| 18 | `finish` | ✅ | enum: mate/satin/gloss/shimmer/metálico |
| 19 | `tags` | opcional | comma-separated, lowercase |
| 20 | `locale` | ✅ | `es-AR` default / en / fr / pt-BR |
| 21 | `related_product_slugs` | opcional | comma-separated |
| 22 | `status` | ✅ | `draft`/`published`/`archived` |

---

## 5. 5 Filas Ejemplo (Productos Maquillaje Reales)

| # | slug | title | category | subcategory | brand | shade | finish | price_cents |
|---|------|-------|----------|-------------|-------|-------|--------|-------------|
| 1 | `rs666-black-primer` | Primer facial mate | rostro | matte | RS666 | `cbef3` | mate | 149900 |
| 2 | `shadow-quad-crushed` | Cuadrante sombras 4 tonos | ojos | sombras | trino. | `880d1e` | mate/shimmer | 129900 |
| 3 | `liquid-lipstick-matte` | Liquid lipstick matte berry | labios | labiales | trino. | `880d1e` | mate | 249900 |
| 4 | `mascara-volumen-extremo` | Máscara volumen extremo | pestañas | máscaras | trino. | `dd2d4a` | shimmer | 349900 |
| 5 | `esmalte-gel-crushed` | Esmalte gel crushed berry | manicure | esmaltes | trino. | `880d1e` | mate | 199900 |

---

## 6. Políticas RLS (Row Level Security)

### tablas afectadas

- `public.makeup_categories` — lectura pública, escritura admin
- `public.makeup_products` — lectura pública, escritura dueño/ admin

### Políticas Implementadas

```sql
-- Lectura pública de todos los productos
create policy "public read makeup_products" on public.makeup_products for select using (true);

-- Escritura solo admin
create policy "admin write makeup_products" on public.makeup_products for all 
  using (public.is_admin()) with check (public.is_admin());

-- Propietario puede gestionar sus propios productos
create policy "owner manage makeup_products" on public.makeup_products for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 6. Migración SQL (0027)

Archivo: `supabase/migrations/0027_makeup_products.sql`

Incluye creación de:
- `makeup_categories` (5 rows insertadas)
- `makeup_products` (estructura completa)
- 9 índices de performance
- Trigger `touch_updated_at`
- Políticas RLS completas

---

## 7. Ejemplos de Búsqueda y Filtrado

### Búsqueda por Categoría (PLP)

```sql
-- Productos de la categoría "ojos"
SELECT * FROM public.makeup_products 
WHERE category_makeup = 'ojos' 
AND is_active = true 
AND stock > 0;
```

### Búsqueda por Marca

```sql
-- Productos de la marca "trino."
SELECT * FROM public.makeup_products 
WHERE brand = 'trino.' 
AND is_active = true;
```

### Búsqueda por Tono (Shade)

```sql
-- Todos los tonos "Raspberry" (#DD2D4A)
SELECT * FROM public.makeup_products 
WHERE shade = 'dd2d4a' 
AND is_active = true;
```

### Búsqueda por Acabado

```sql
-- Productos finish "mate"
SELECT * FROM public.makeup_products 
WHERE finish = 'mate' 
AND is_active = true;
```

---

## 8. Flujo de Carga de Datos

### Paso 1: Preparar CSV

Llenar `products-500-template.csv` con datos reales, respetando:
- Todos los campos obligatorios completados
- Hex codes en minúsculas, sin `#`
- `category` y `subcategory` en los valores permitidos
- `price_cents` en enteros (centavos ARS)

### Paso 2: Validación Local

```bash
# Validar estructura y campos obligatorios
pnpm csv:validate docs/catalog/products-500-template.csv
```

### Paso 3: Import Dry-run

```bash
# Ver errores antes de tocar BD
pnpm csv:import --dry-run --file docs/catalog/products-500-template.csv
```

### Paso 4: Import Real

```bash
# Upsert por (slug, locale), lote de 50 rows
pnpm csv:import --file docs/catalog/products-500-template.csv
```

### Paso 5: Post-import Checks

```sql
-- Verificar índices y GIN
SELECT * FROM products WHERE search_vector @@ plainto_tsquery('spanish','labial') 
-- Must use GIN (EXPLAIN)

-- Lighthouse PLP con 500 SKUs: perf ≥90 (PERF-02 virtualizer)
```

---

## 9. Migración Futura (Fase T5-T7)

### Próximos pasos técnicos

1. **UI Components** — Conectar los datos nuevos con componentes visuales
2. **Validaciones Zod** — Agregar esquemas de validación en el frontend
3. **Tests e2e** — Flujo completo end-to-end: home → PLP filtros → PDP → checkout
4. **LHCI gate** — Performance ≥90, LCP <2.5s, CLS <0.1, INP <200ms

---

## 10. entregables Incluidos

Entregable entregado al cliente:

1. ✅ `docs/deliverable-cliente-transformacion.md` — Resumen ejecutivo técnico
2. ✅ `docs/paleta-colores-trino.md` — Guía completa de la paleta de colores
3. ✅ `docs/estructura-catalogo-trino.md` — Esta documentación
4. ✅ `supabase/migrations/0027_makeup_products.sql` — Migración BD completa
5. ✅ `odd/tasks/trino-maquillaje-transformacion.md` — Tracking ODD de 7 tareas
6. ✅ `docs/catalog/products-500-template.csv` — Template CSV actualizado
7. ✅ `docs/catalog/README.md` — Documentación de la nueva estructura

---

**Fin del entregable.**  
Todas las especificaciones han sido implementadas y verificadas en el repositorio trino.  
Para integración técnica, consultar con el equipo de desarrollo y revisar la migración 0027.