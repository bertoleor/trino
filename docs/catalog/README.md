# Catalog CSV — Catálogo de belleza

> **Source of truth:** catálogo de belleza (maquillaje, skincare e insumos), confirmado el
> 2026-11-23. El doc `marca.md` y la taxonomía triple esotérica quedaron cancelados.
> Modelo objetivo: `docs/estructura-catalogo-trino.md` + `supabase/migrations/0027_makeup_products.sql`.
> **Trace:** T-D01b (facets GIN) · MONEY-01 (INT centavos) · `supabase/migrations/0003_softdelete_fts.sql` · `openspec/AGENT_RULES.md` perf/DB-07
>
> **Deuda técnica:** el runtime aún filtra por `tipo`/`tradicion`/`intencion`
> (`src/lib/db/facets.ts`, `src/app/[locale]/tienda/page.tsx`). No agregar valores nuevos
> a esas facetas; son residuo pendiente de migrar.

Trino usa una categoría principal más atributos combinables. Un producto puede ser
"labios" + "labiales" + `trino.` + `8A2E4B` + "mate" a la vez. El hex es el **tono del
producto**, no un color de marca.

---

## 1. Las 3 Facetas

### `category` — Por categoría de producto (5 valores — filtro principal PLP)

|| # | Valor CSV (`category`) | Label visible (es-AR) | Ejemplo |
|---|---|---|---|
| 1 | `ojos` | Ojos | Sombras, delineadores, máscaras |
| 2 | `labios` | Labios | Labiales, batones, gloss |
| 3 | `rostro` | Rostro | Polvos, bronceadores, correctores |
| 4 | `manicure` | Manicure | Esmaltes, quitaesmalte, herramientas |
| 5 | `pestañas` | Pestañas | Máscaras, pestañas postizas, rímel |

> **Regla CSV:** exactamente **un** `category` por producto (obligatorio). Define la familia principal del producto.

### `subcategory` — Por subtipo dentro de la categoría (7 valores — filtro transversal, no excluyente)

|| # | Valor CSV (`subcategory`) | Label visible |
|---|---|---|
| 1 | `sombras` | Sombras de ojos |
| 2 | `delineadores` | Delineadores |
| 3 | `máscaras` | Máscaras de pestañas |
| 4 | `labiales` | Labiales y batones |
| 5 | `gloss` | Gloss y brillo labial |
| 6 | `esmaltes` | Esmaltes de uñas |
| 7 | `herramientas` | Herramientas de belleza |

> **Regla CSV:** exactamente **un** `subcategory` principal por producto. Si el producto sirve a varios subtipos, poner la **primaria** en `subcategory` y las secundarias en `tags` (ej. `tags: sombras,highlight`).

### `brand` — Marca del producto (obligatorio)

> **Regla CSV:** nombre de marca registrado. `zod.string().min(2).max(50)`. Ejemplos: `trino., L'Oréal, Maybelline, etc.` . El campo `trino.` indica productos de la marca propia.

### `shade` — Tono/color del producto (obligatorio para maquillaje)

> **Regla CSV:** el hex describe el **tono del producto**, no el color de la marca. El hex de
> identidad visual (Ink, Cream, pops) está en `docs/brand/trino-tokens.css` y no debe
> confundirse con este campo. Formato: 6 caracteres hexadecimales sin `#`.

> **Formato:** hex sin `#`, 6 caracteres alfanuméricos. Validación: `z.string().regex(/^[0-9a-f]{6}$/i)`.

### `finish` — Acabado/textura del producto

|| # | Valor CSV (`finish`) | Descripción |
|---|---|---|
| 1 | `mate` | Acabado mate, no reflectante |
| 2 | `satin` | Acabado satén, ligero brillo |
| 3 | `gloss` | Acabado gloss, alto brillo |
| 4 | `shimmer` | Con destellos / glitter sutil |
| 5 | `metálico` | Acabado metálico |

> **Regla CSV:** uno o más valores separados por `,` (ej. `mate,shimmer`).

> **Validación:** `tags` style con `pg_trgm` para tolerance a typo (DB-07).

---

## 2. Cómo llenar el CSV

### Campo a campo

| Columna | Obligatorio | Formato | Ejemplo | Validación |
|---|---|---|---|---|
| `slug` | ✅ | `a-z0-9-` 3–80, único | `liquid-lipstick-matte-berry` | `z.string().regex(/^[a-z0-9-]+$/)` + unique index |
| `title` | ✅ | 3–120 | `Labial líquido mate berry` | Zod min/max; mayúscula inicial oracional |
| `excerpt` | ✅ | 20–155 (meta description) | `Labial líquido de alta cobertura y acabado mate...` | SEO DEV-02 |
| `price_cents` | ✅ | INT ≥0 ARS centavos | `249900` (= AR$2.499,00) | **MONEY-01** — nunca float; `Decimal.js` solo display |
| `currency` | ✅ | `ARS` fijo | `ARS` | `CHECK currency='ARS'` |
| `sale_price_cents` |  | INT < price_cents o vacío | `199900` | `< price_cents` |
| `sale_start` / `sale_end` |  | UTC ISO8601 `2026-09-03T00:00:00Z` o vacío | `2026-11-01T03:00:00Z` | Ventana ECOM-04 |
| `stock` | ✅ | INT ≥0 | `80` | OCC `updated_at` (CONCURRENCIA-01) |
| `sku` | ✅ | 3–32 único | `LL-MAT-001` | unique |
| `weight_grams` |  | INT o vacío | `8` | Para shipping ECOM-06 |
| `dimensions_cm` |  | `LxWxH` o vacío | `9x3x3` |  |
| `images` | ✅ | URLs Storage, `,` separadas, mín 1 | `products/lip-liner-001/01.webp\|products/lip-liner-001/02.webp` | presigned + magic-bytes + WebP/AVIF |
| `category` | ✅ | 1 de 5 | `labios` | Modelo objetivo (migración 0027); runtime aún usa `tipo` |
| `subcategory` | ✅ | según categoría | `labiales` | Modelo objetivo (migración 0027) |
| `brand` | ✅ | texto libre normalizado | `trino.` | Modelo objetivo (migración 0027) |
| `shade` |  | hex del **tono del producto** | `8A2E4B` | No es un color de marca |
| `finish` |  | texto libre | `mate` | Modelo objetivo (migración 0027) |
| `tipo` / `tradicion` / `intencion` | ⚠️ | facetas heredadas del runtime | — | Deuda migratoria: no agregar valores nuevos |
| `tags` |  | `,` separado, lowercase | `labial,mate,berry,larga-duracion` | `text[]` GIN |
| `locale` | ✅ | `es-AR` (default) / `en` / `fr` / `pt-BR` | `es-AR` | I18N-01 — un row por locale si traducido |
| `related_product_slugs` |  | `,` separado o vacío | `lip-liner-001,plumping-serum-001` | FK check en import (warning si no existe) |
| `status` | ✅ | `draft` / `published` / `archived` | `published` | Solo `published`+`deleted_at IS NULL` es público (RLS) |

### Reglas de negocio

1. **Precio:** siempre INT centavos. `AR$ 1.999,90` → `199990`. No usar `,` ni `$` en CSV. Sale solo activo si `now ∈ [sale_start, sale_end]` (UTC).
2. **Imágenes Storage path:** `products/{slug}/01.webp` (no URL completa). Import script convierte a `https://{supabase_url}/storage/v1/object/public/products/...`. Placeholder: `public/placeholder.webp` (44px-ready, 800×1000, BlurHash generado en Edge Function PERF-07).
3. **Atributos de catálogo obligatorios:** `category` y `subcategory` sin vacío; `brand`, `shade` y `finish` según aplique. El runtime todavía exige las facetas heredadas: migrar, no reforzar.
4. **Locale:** si el producto existe en varios idiomas, repetir row con mismo `slug` cambiando `locale` y `title/excerpt`. Import hace upsert por `(slug, locale)`.
5. **Tags libre pero normalizado:** lowercase, sin tildes en CSV (`proteccion` no `protección`), sin espacios dobles. Tags se indexan con `pg_trgm` para typo tolerance (DB-07).
6. **Soft delete:** no borrar rows del CSV para ocultar — usar `status=archived` o `deleted_at` en DB. Re-import no borra.

---

## 3. Ejemplo de fila (anatomía)

```csv
liquid-lipstick-matte-berry,Labial líquido mate berry,Labial de alta cobertura y acabado mate sin transferencia.,249900,ARS,199900,2026-11-01T03:00:00Z,2026-11-30T03:00:00Z,80,LL-MAT-001,8,9x3x3,products/liquid-lipstick/01.webp|products/liquid-lipstick/02.webp,labios,labiales,trino.,8A2E4B,mate,"labial,mate,berry,larga-duracion",es-AR,lip-liner-001,published
```

> **Separador `images`:** usar `|` (pipe) si alguna URL contiene `,`. El template usa `|` entre imágenes y `,` entre columnas (ver productos-500-template.csv).

---

## 4. Importación (cómo entra a Supabase)

```bash
# 1) Validar local sin tocar DB
pnpm csv:validate docs/catalog/products-500-template.csv

# 2) Dry-run (muestra 5 primeros errores)
pnpm csv:import --dry-run --file docs/catalog/products-500-template.csv

# 3) Import real (upsert por slug+locale, 500 rows en batch 25 — PERF-01)
pnpm csv:import --file docs/catalog/products-500-template.csv
# → usa p-limit(5) + Storage presigned check (PERF-06) + FTS reindex
```

Validadores (a implementar junto a `src/lib/validations/money.ts`):
- `price_cents` INT + `currency=ARS` + `sale_price < price` (MONEY-01)
- `tipo/tradicion/intencion` enums + `stock>=0` + `images>=1`
- `slug` único por locale + `sku` único global
- `sale_start < sale_end` si ambos presentes
- `weight_grams/dimensions_cm` numéricos si presentes

Post-import checks:
- `SELECT * FROM products WHERE search_vector @@ plainto_tsquery('spanish','labial')` debe usar GIN (EXPLAIN).
- Lighthouse PLP con 500 SKUs: perf ≥90 (PERF-02 virtualizer).

---

## 5. Archivos

- `products-500-template.csv` — 500 filas objetivo, header + 5 ejemplos realistas listos. Duplicar rows para llegar a 500.
- El template de contenido cultural quedó retirado: el contenido SEO del rubro anterior
  (tarot/rituales) no es vigente. La taxonomía objetivo está en `docs/brand/`.
- Este README — norma de llenado.

## 6. CSV Best Practices (Context7 + RFC 4180)

- UTF-8 sin BOM, `,` separador, `"` quoting para campos con `,` o `"` (doblar `""`).
- Primera fila header exacta (no renombrar).
- CRLF o LF ambos aceptados; no mezclar.
- Vacío = campo vacío (`,,`) no `"null"`.
- Fechas siempre UTC ISO8601 con `Z`.
- Precios sin símbolo monetario.
