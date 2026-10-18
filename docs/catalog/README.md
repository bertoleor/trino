# Catalog CSV — Triple Taxonomy (marca.md §3)

> **Source of truth:** `DOCS/DOCS/marca.md §3 — Estructura de categorías específica del rubro`  
> **Trace:** T-D01b (facets GIN) · MONEY-01 (INT centavos) · `supabase/migrations/0003_softdelete_fts.sql` · `openspec/AGENT_RULES.md` perf/DB-07

Trino no usa una categoría única. Cada producto vive en **3 facetas combinables** que se intersectan en el buscador (no son 3 menús separados). Un mismo producto puede ser "vela" + "wicca" + "protección" a la vez.

---

## 1. Las 3 Facetas

### `tipo` — Por tipo de producto (10 valores — filtro principal PLP)

| # | Valor CSV (`tipo`) | Label visible (es-AR) | Ejemplo |
|---|---|---|---|
| 1 | `tarot-oraculos` | Tarot y oráculos | Rider-Waite, Lenormand |
| 2 | `velas` | Velas | Vela soja 200g, cirio altar |
| 3 | `inciensos-resinas` | Inciensos y resinas | Palo santo, salvia, copal |
| 4 | `cristales-piedras` | Cristales y piedras | Cuarzo rosa, amatista |
| 5 | `amuletos-talismanes` | Amuletos y talismanes | Ojo turco, runas |
| 6 | `aceites-esencias` | Aceites y esencias | Lavanda, copal oil |
| 7 | `altares-rituales` | Altares y elementos rituales | Altar madera, cuenco |
| 8 | `libros-guias` | Libros y guías | Guía tarot, grimorio |
| 9 | `joyeria-simbolica` | Joyería simbólica | Anillo sigilo, collar luna |
| 10 | `sets-regalo` | Sets de regalo | Kit protección hogar, primer altar |

> **Regla CSV:** exactamente **un** `tipo` por producto (obligatorio). Si es un set que combina varias cosas, usar `sets-regalo` y detallar en `tags` los componentes.

### `tradicion` — Por tradición/creencia (9 valores — filtro transversal, no excluyente)

| # | Valor CSV (`tradicion`) | Label visible |
|---|---|---|
| 1 | `tarot-astrologia` | Tarot y astrología |
| 2 | `wicca-paganismo` | Wicca y paganismo |
| 3 | `budismo` | Budismo |
| 4 | `santeria-afro` | Santería y religiones afro |
| 5 | `feng-shui` | Feng Shui |
| 6 | `cristaloterapia` | Cristaloterapia |
| 7 | `chamanismo` | Chamanismo |
| 8 | `misticismo-cristiano` | Misticismo cristiano popular |
| 9 | `espiritualidad-general` | Espiritualidad general / sin tradición |

> **Regla CSV:** exactamente **un** `tradicion` principal por producto. Si el producto sirve a varias tradiciones, poner la **primaria** en `tradicion` y las secundarias en `tags` (ej. `tags: wicca,budismo`). Filtro PLP hace `WHERE tradicion = X OR tags @> array[X]` (GIN).

### `intencion` — Por intención de uso (7 valores — el más usado, ideal para home/quiz)

| # | Valor CSV (`intencion`) | Label visible | Cuándo usar |
|---|---|---|---|
| 1 | `amor` | amor | Ritos de vínculo, autoestima |
| 2 | `proteccion` | protección | Limpias de hogar, amuletos |
| 3 | `abundancia` | abundancia | Prosperidad, trabajo, dinero |
| 4 | `limpieza-energetica` | limpieza energética | Sahumos, resinas, sales |
| 5 | `sueno-descanso` | sueño y descanso | Lavanda, luna, calmantes |
| 6 | `conexion-espiritual` | conexión espiritual | Meditación, altar, oráculo |
| 7 | `duelo-sanacion` | duelo y sanación | Acompañamiento, cierre ciclos |

> **Regla CSV:** exactamente **un** `intencion` principal. Secundarias a `tags`. El quiz "elegí tu camino" (marca.md §5) usa `intencion` para recomendar.

---

## 2. Cómo llenar el CSV

### Campo a campo

| Columna | Obligatorio | Formato | Ejemplo | Validación |
|---|---|---|---|---|
| `slug` | ✅ | `a-z0-9-` 3–80, único | `vela-soja-lavanda-200g` | `z.string().regex(/^[a-z0-9-]+$/)` + unique index |
| `title` | ✅ | 3–120 | `vela de soja — lavanda 200g` (lowercase per marca §7) | Zod min/max |
| `excerpt` | ✅ | 20–155 (meta description) | `vela artesanal de cera de soja con lavanda...` | SEO DEV-02 |
| `price_cents` | ✅ | INT ≥0 ARS centavos | `1249000` (= AR$12.490,00) | **MONEY-01** — nunca float; `Decimal.js` solo display |
| `currency` | ✅ | `ARS` fijo | `ARS` | `CHECK currency='ARS'` |
| `sale_price_cents` |  | INT < price_cents o vacío | `999000` | `< price_cents` |
| `sale_start` / `sale_end` |  | UTC ISO8601 `2026-09-03T00:00:00Z` o vacío | `2026-09-10T03:00:00Z` | Ventana ECOM-04 |
| `stock` | ✅ | INT ≥0 | `48` | OCC `updated_at` (CONCURRENCIA-01) |
| `sku` | ✅ | 3–32 único | `VEL-SOJ-LAV-200-001` | unique |
| `weight_grams` |  | INT o vacío | `220` | Para shipping ECOM-06 |
| `dimensions_cm` |  | `LxWxH` o vacío | `8x8x9` |  |
| `images` | ✅ | URLs Storage, `,` separadas, mín 1 | `products/vela-soja-lavanda/01.webp,products/vela-soja-lavanda/02.webp` | presigned + magic-bytes + WebP/AVIF |
| `tipo` | ✅ | 1 de 10 | `velas` | `tipo10` enum facet GIN |
| `tradicion` | ✅ | 1 de 9 | `espiritualidad-general` | `tradicion9` enum |
| `intencion` | ✅ | 1 de 7 | `sueno-descanso` | `intencion7` enum |
| `tags` |  | `,` separado, lowercase | `lavanda,soja,artesanal,limitada` | `text[]` GIN |
| `locale` | ✅ | `es-AR` (default) / `en` / `fr` / `pt-BR` | `es-AR` | I18N-01 — un row por locale si traducido |
| `related_product_slugs` |  | `,` separado o vacío | `sahumerio-lavanda-10u,aceite-lavanda-30ml` | FK check en import (warning si no existe) |
| `status` | ✅ | `draft` / `published` / `archived` | `published` | Solo `published`+`deleted_at IS NULL` es público (RLS) |

### Reglas de negocio

1. **Precio:** siempre INT centavos. `AR$ 1.999,90` → `199990`. No usar `,` ni `$` en CSV. Sale solo activo si `now ∈ [sale_start, sale_end]` (UTC).
2. **Imágenes Storage path:** `products/{slug}/01.webp` (no URL completa). Import script convierte a `https://{supabase_url}/storage/v1/object/public/products/...`. Placeholder usa `public/placeholder-vela.webp` (44px-ready, 800×1000, BlurHash generado en Edge Function PERF-07).
3. **Triple facet es obligatoria:** cada producto debe tener las 3 (no se acepta vacío). Validador rechaza row si falta una.
4. **Locale:** si el producto existe en varios idiomas, repetir row con mismo `slug` cambiando `locale` y `title/excerpt`. Import hace upsert por `(slug, locale)`.
5. **Tags libre pero normalizado:** lowercase, sin tildes en CSV (`proteccion` no `protección`), sin espacios dobles. Tags se indexan con `pg_trgm` para typo tolerance (DB-07).
6. **Soft delete:** no borrar rows del CSV para ocultar — usar `status=archived` o `deleted_at` en DB. Re-import no borra.

---

## 3. Ejemplo de fila (anatomía)

```csv
vela-soja-lavanda-200g,vela de soja — lavanda 200g,vela artesanal de cera de soja con aceite de lavanda para descanso nocturno ritual.,1249000,ARS,999000,2026-09-10T03:00:00Z,2026-09-30T03:00:00Z,48,VEL-SOJ-LAV-200-001,220,8x8x9,products/vela-soja-lavanda/01.webp|products/vela-soja-lavanda/02.webp,velas,espiritualidad-general,sueno-descanso,"lavanda,soja,artesanal,descanso",es-AR,"sahumerio-lavanda-10u,aceite-lavanda-30ml",published
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
- `SELECT * FROM products WHERE search_vector @@ plainto_tsquery('spanish','vela')` debe usar GIN (EXPLAIN).
- Lighthouse PLP con 500 SKUs: perf ≥90 (PERF-02 virtualizer).

---

## 5. Archivos

- `products-500-template.csv` — 500 filas objetivo, header + 5 ejemplos realistas listos. Duplicar rows para llegar a 500.
- `cultura-20-template.csv` — 20 posts objetivo, 3 ejemplos. Ver `cultura-20-template.csv` + `T-E01` migrations.
- Este README — norma de llenado.

## 6. CSV Best Practices (Context7 + RFC 4180)

- UTF-8 sin BOM, `,` separador, `"` quoting para campos con `,` o `"` (doblar `""`).
- Primera fila header exacta (no renombrar).
- CRLF o LF ambos aceptados; no mezclar.
- Vacío = campo vacío (`,,`) no `"null"`.
- Fechas siempre UTC ISO8601 con `Z`.
- Precios sin símbolo monetario.
