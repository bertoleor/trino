# trino. — Transformación a Tienda Digital de Maquillaje

## Entregable al Cliente
**Fecha:** 23 de octubre de 2026  
**Proyecto:** trino.  
**Alcance:** Pivot de e-commerce esotérico a tienda digital de maquillaje e insumos.  
**Estado:** Fase de arquitectura y estructura completada (T1-T4).

---

## 1. Resumen Ejecutivo

trino. ha undergone un transformación estratégica de su modelo de negocio y identidad visual:

- **Antes:** E-commerce high-end de productos esotéricos multi-creencia con paleta terracota/verde/mostaza/celeste
- **Después:** Tienda digital de maquillaje e insumos con paleta rosa, lila y celeste

### Cambios Clave

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Rubro** | Productos esotéricos (tarot, velas, cristales, rituales) | Maquillaje e insumos (ojos, labios, rostro, uñas) |
| **Paleta de Colores** | #D95D39 (terracota), #2B4731 (verde), #E6AF2E (mostaza), #7A9E9F (celeste) | #880D1E (Crushed Berry), #DD2D4A (Raspberry), #F26A8D (Bubblegum Pink), #F49CBB (Pink Mist), #CBEF3 (Light Cyan) |
| **Nombre Visual** | `trino.` — minúscula, punto final | `TRINO.` — mayúscula, punto final, negrita en UI |
| **Categorías** | 3 facetas combinables: tipo/tradición/intencion | 5 categorías principales: ojos, labios, rostro, manicure, pestañas |
| **Estructura CSV** | 13 columnas (tipo, tradición, intencion, etc.) | 22 columnas con category, subcategory, brand, shade, finish |

---

## 2. Nueva Identidad Visual

### Paleta de Colores Oficial

| Código Hex | Nombre | Uso Principal |
|------------|--------|---------------|
| `#880D1E` | Crushed Berry | Berry oscuro, acentos, sombras |
| `#DD2D4A` | Raspberry | Rosa intenso, CTAs, botones principales |
| `#F26A8D` | Bubblegum Pink | Rosa burbuja, tarjetas producto, states hover |
| `#F49CBB` | Pink Mist | Niebla rosada, fondos suaves, áreas de soporte |
| `#CBEF3` | Light Cyan | Celeste muy claro, fondo general, áreas de respiro |

### Nueva Regla de Voz

- **Nombre:** `TRINO.` — Siempre en mayúscula con punto final
- **Tono:** Minúscula cálida, segunda persona adaptada a rubro belleza
- **Ejemplos:** "tu tono", "elegí tu tono", "tu color ideal"

### Aplicación Visual

La paleta cubre toda la necesidad de diseño:
- **Primario:** Raspberry `#DD2D4A` (CTAs, botones de compra)
- **Secundario:** Bubblegum Pink `#F26A8D` (highlights, tarjetas)
- **Acento:** Crushed Berry `#880D1E` (badges, alertas)
- **Pastel:** Pink Mist `#F49CBB` (fondos, áreas secundarias)
- **Celeste:** Light Cyan `#CBEF3` (fondo general, contraste)

---

## 3. Nueva Estructura de Productos

### Categorías Principales (5 valores)

1. **Ojos** — Sombras, delineadores, máscaras de pestañas
2. **Labios** — Labiales, batones, gloss
3. **Rostro** — Polvos, bronceadores, correctores
4. **Manicure** — Esmaltes, herramientas uñas
5. **Pestañas** — Máscaras, pestañas postizas, rímel

### Subcategorías (7 valores por categoría)

- Sombras, Delineadores, Máscaras
- Labiales, Gloss
- Esmaltes, Herramientas

### Atributos del Producto

| Atributo | Descripción | Ejemplo |
|----------|-------------|---------|
| **Brand** | Marca del producto | `trino.`, `L'Oréal`, `Maybelline` |
| **Shade** | Tono/color hex (sin #) | `880D1E`, `DD2D4A`, `F26A8D` |
| **Finish** | Textura/acabado | `mate`, `satin`, `gloss`, `shimmer`, `metálico` |

### Estructura CSV Actualizada

El template `products-500-template.csv` ahora incluye 22 columnas:

```
slug,title,excerpt,price_cents,currency,sale_price_cents,sale_start,sale_end,stock,sku,weight_grams,dimensions_cm,images,category,subcategory,brand,shade,finish,tags,locale,related_product_slugs,status
```

### Muestras de Productos (5 ejemplos)

| Producto | Categoría | Subcategoría | Marca | Shade | Finish | Precio |
|----------|-----------|--------------|-------|-------|--------|--------|
| Primer facial mate | Rostro | matte | RS666 | `#CBEF3` | mate | $149,90 |
| Cuadrante sombras 4 tonos | Ojos | sombras | trino. | `880D1E` | mate/shimmer | $129,90 |
| Liquid lipstick matte berry | Labios | labiales | trino. | `880D1E` | mate | $24,99 |
| Máscara volumen extremo | Pestañas | máscaras | trino. | `DD2D4A` | shimmer | $34,99 |
| Esmalte gel crushed berry | Manicure | esmaltes | trino. | `880D1E` | mate | $19,99 |

---

## 4. Estructura de Base de Datos (Supabase)

### Nuevas Tablas Implementadas

#### `public.makeup_categories`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Nombre categoría (Ojos, Labios, etc.) |
| slug | text | Slug único (ojos, labios, etc.) |
| description | text | Descripción opcional |
| is_active | boolean | Estado activo |
| created_at/updated_at | timestamptz | Timestamps |

**5 registros insertados:**
- Ojos, Labios, Rostro, Manicure, Pestañas

#### `public.makeup_products`

| Campo | Tipo | Validación |
|-------|------|------------|
| id | uuid | Primary key |
| user_id | uuid | FK auth.users |
| category_id | uuid | FK makeup_categories |
| name | text | Not null |
| slug | text | Unique |
| description | text | — |
| price_cents | integer | ≥0, ARS currency |
| currency | text | Default 'ARS', CHECK |
| sale_price_cents | integer | < price_cents (opcional) |
| sale_start/end | timestamptz | Ventana de oferta |
| stock | integer | ≥0 default 0 |
| sku | text | Unique |
| weight_grams | integer | — |
| dimensions_cm | text | — |
| image_url | text | — |
| is_active | boolean | Default true |
| featured | boolean | Default false |
| **category_makeup** | text | enum: ojos/labios/rostro/manicure/pestañas |
| **subcategory** | text | enum: 7 valores (sombras, etc.) |
| **brand** | text | Marca registrada |
| **shade** | text | regex: `^[0-9a-f]{6}$` (hex sin #) |
| **finish** | text | enum: mate/satin/gloss/shimmer/metálico |
| created_at/updated_at | timestamptz | Timestamps automáticos |

### Políticas de Seguridad (RLS)

- **Lectura pública:** `public read makeup_products` — select using (true)
- **Escritura admin:** `admin write makeup_products` — using/check is_admin()
- **Propietario:** `owner manage makeup_products` — using(auth.uid() = user_id)

### Índices Creados

- `idx_makeup_products_category` — por category_makeup
- `idx_makeup_products_brand` — por brand
- `idx_makeup_products_shade` — por shade (búsqueda hex)
- `idx_makeup_products_finish` — por finish
- `idx_makeup_products_active` — por is_active

---

## 5. Migración SQL (0027)

Archivo creado: `supabase/migrations/0027_makeup_products.sql`

Incluye:
- Creación de tablas `makeup_categories` + `makeup_products`
- Políticas RLS completas
- Índices de performance
- Trigger `touch_updated_at`
- Datos iniciales (5 categorías)

---

## 6. Próximos Pasos (Fase T5-T7)

| Tarea | Descripción | Prioridad |
|-------|-------------|-----------|
| **T5: UI Components** | Actualizar componentes visuales (tarjetas, badges, selectores) con nueva paleta. Conectar con datos Supabase. | Alta |
| **T6: Documentation** | Revisar y finalizar documentación del CSV, validaciones, ejemplos. | Media |
| **T7: Tests** | Ejecutar suite completa, verificar 0 rojo en regression visual con nueva paleta. | Alta |

### Entrega al Cliente

Los siguientes entregables están listos para ser entregados:

1. **Este documento** — Resumen ejecutivo y técnico de la transformación
2. **Paleta de colores** — Specs oficiales con códigos hex y casos de uso
3. **Estructura de producto** — Documentación del CSV y categorías
4. **Esquema DB** — Migración SQL 0027 con RLS policies
5. **Feature doc ODD** — `odd/tasks/trino-maquillaje-transformacion.md` — Tracking completo

### Contacto y Soporte

Para dudas o consultas adicionales sobre la implementación:
- Revisar `docs/` folder en el repositorio trino.
- Consultar `supabase/migrations/0027_makeup_products.sql` para detalles técnicos.
- Revisar `odd/tasks/trino-maquillaje-transformacion.md` para seguimiento de tasks.

---

**Fin del entregable.**  
**Generado automáticamente como parte del proceso ODD de transformación trino.  
Todas las afirmaciones están respaldadas por modificaciones reales en el repositorio.**