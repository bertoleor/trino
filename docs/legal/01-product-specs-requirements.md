# 01 — Product Specs Legal Requirements (AR)

> **Scope:** What MUST be shown per product under Argentina Ley 24.240 (Defensa del Consumidor) + Ley 22.802 (Lealtad Comercial) + Código Civil y Comercial (CCyC) art. 1100+ — mapped to PDP/PLP/checkout locations and Zod/DB validation.  
> **Trace:** T-C07 / T-C07b / DOC-01 / PRIV-01 / ADMIN-03 / ECOM-04 / MONEY-01 · `DOCS/TERMS.md` · `DOCS/LEGAL.md` · `src/app/[locale]/(legal)/*`  
> **Last verified:** 2026-09-03 against InfoLEG texact 24.240 + 22.802, RG 5721/ARCA WSFEv1, Res. SCI 244/2021 e-commerce info.

---

## 1. Legal Basis — what applies to Trino (esoteric physical goods)

| Norma | Artículo clave | Obliga a |
|---|---|---|
| **Ley 24.240** | Art. 4 — Deber de información cierta, clara, detallada, gratuita | Mostrar características esenciales, condiciones de comercialización, precio final, stock, envío |
| | Art. 10 — Contenido del documento de venta | Documento de venta debe consignar: identificación del proveedor, descripción de la cosa, precio y condiciones de pago, garantía |
| | Art. 10 ter — Oferta por medios electrónicos/distancia | Precio, disponibilidad, condiciones deben estar disponibles antes de contratar; botón de arrepentimiento |
| | Art. 34 — Derecho de revocación / arrepentimiento | Consumidor puede revocar compra a distancia dentro de **10 días corridos** desde entrega |
| | Art. 11-14 — Garantía legal | **6 meses** (nuevo) / **3 meses** (usado) por vicios; certificado de garantía escrito, en idioma nacional |
| | Art. 36 — Operaciones de crédito / financiación | Si hay cuotas, exhibir costo financiero total, TNA/TEA |
| **Ley 22.802** | Art. 9-10, Res. SCI 230/… | Publicidad engañosa: precio publicado debe incluir IVA, no inducir a error sobre origen/calidad; "precio por unidad de medida" cuando corresponda |
| **CCyC** | Art. 1100-1103, 1110 | Contratos a distancia: información pre-contractual, confirmación escrita post-compra, domicilio del oferente |
| **Res. SCI 244/2021** | E-commerce obligatorio | Botón "Defensa del Consumidor", link 0800, información del proveedor visible y accesible |
| **Res. SCI 7/02** | Exhibición de precios | Todo precio exhibido debe incluir IVA discriminado o indicar "IVA incluido" |

> **Jurisprudencia operativa:** La autoridad de aplicación es Defensa del Consumidor (Secretaría de Comercio). Tel. **0800-666-1518** + https://www.argentina.gob.ar/produccion/defensadelconsumidor — must be linked from footer and Términos.

---

## 2. Per-Product Requirements Table

### MUST (blocking — store cannot launch without)

| # | Requisito | Fundamento | PDP Location | PLP/Checkout Location | Validación Zod/DB | Fails if |
|---|---|---|---|---|---|---|
| **P-01** | **Precio final con IVA incluido** + leyenda `IVA incluido (21%)` o discriminado | L.24240 art.4 + Res.7/02 + Res.244/21 | Debajo del título, junto a `price_cents` + `sale_price_cents` | PLP card price + checkout line_items + mini-cart | `price_cents: z.number().int().min(0)`, `currency:'ARS'`, display `(cents/100).toLocale...` — server recomputes total from DB (ECOM-04, MONEY-01) | Precio sin IVA o float |
| **P-02** | **Precio por unidad de medida** cuando producto es fraccionable (ej. sahumerio x10 sticks, resina por gramo) | L.22802 + Res.7/02 art.2 | Ficha: "AR$ X por unidad / por 100g" | — | `weight_grams`, `dimensions_cm` → computed `unit_price = price_cents / qty` validated server | Omisión en consumibles fraccionables |
| **P-03** | **Stock / Disponibilidad** clara: "En stock (n unidades)", "Sin stock", "Últimas unidades" | L.24240 art.4 + 10 ter | Badge junto a stock + CTA disabled si 0 | PLP badge "sin stock" | `stock: z.number().int().min(0)`, OCC `updated_at` (CONCURRENCIA-01) | Mostrar "comprar" sin stock |
| **P-04** | **Identificación del vendedor**: razón social, **CUIT**, **domicilio** (CABA), email legal | CCyC 1100 + L.24240 art.4 + Res.244/21 | Footer PDP + link `/terms` | Footer global + `/defensa-consumidor` | `global_settings` table CMS-01 (never hardcoded) | CUIT ausente |
| **P-05** | **Derecho de arrepentimiento 10 días corridos** + cómo ejercerlo (botón/email) | L.24240 art.34 + Res.424/2020 botón arrepentimiento | Tab "Cambios y devoluciones" en PDP + checkout confirm | Thank-you page + email transaccional | Copy en `messages/{locale}/legal.json`, link `/cambios-devoluciones` | Sin mención de 10 días |
| **P-06** | **Garantía legal 6 meses** (nuevos) / 3 meses usados — certificado | L.24240 art.11-14 | Tab "Garantía" + PDF certificado post-compra | Email con certificado | `orders` → audit + `docs/TERMS.md` | Garantía omitida o <6 meses |
| **P-07** | **Descripción cierta y detallada**: qué es, dimensiones, peso, material, origen cultural | L.24240 art.4 + marca.md §4 (curaduría) | Bloque "Descripción" TipTap | — | Zod `name`, `excerpt` ≤155, `description` TipTap JSON, `sku` unique | Ficha vacía/genérica |
| **P-08** | **Fotos reales del producto** (no solo mock), mínimo 1, máx 8, presigned Storage | L.22802 veracidad | Galería PDP (WebP/AVIF + BlurHash) | PLP thumb | `images: z.array(z.string().url()).min(1).max(8)` + magic-bytes check SEC-04 | Imagen rota/placeholder en prod |
| **P-09** | **Condiciones de entrega y plazo** (a todo el país, 3-7 días) + costo antes de pagar | L.24240 art.4 + Res.244/21 | PDP "Envíos" + shipping calculator `POST /api/shipping/rates` | Checkout step 2 (antes de pay) | `ECOM-06` carrier Strategy + fallback `global_settings.fixed_shipping_cents` | Costo oculto hasta pago |
| **P-10** | **Medios de pago aceptados** discriminados | L.24240 art.4 | PDP icons + checkout | Checkout | `payment_provider` enum | Omisión |
| **P-11** | **Disclaimer esotérico no-médico** para tarot/velas/cristales/rituales | DOC-01 + marca.md §4: "no reemplaza diagnóstico médico/psicológico" | PDP banner amarillo crema bajo descripción + checkout footnote | Email | `disclaimer.tsx` component + `DOCS/LEGAL.md` | Tarot sin disclaimer |

### SHOULD (highly recommended — reduce juicios y chargebacks)

| # | Requisito | Fundamento | PDP Location | Validación |
|---|---|---|---|---|
| **S-01** | **Origen / tradición + contexto cultural** (ej. "sahumerio palo santo — Chamanismo andino — cosecha sustentable") | marca.md §4 respeto multi-creencia + L.22802 origen | Bloque "Origen y tradición" | `tradicion` facet + `body_tipTap_json` |
| **S-02** | **Modo de uso / "cómo se usa" + seguridad fuego** (vela/incienso: no dejar encendido sin supervisión, mantener lejos de niños) | marca.md §5 + defensa consumidor seguridad producto L.24240 art.5-6 | Tab "Cómo se usa" + pictograma | Copy + icono |
| **S-03** | **Peso y dimensiones** para cálculo de flete | ECOM-06 | Ficha specs | `weight_grams`, `dimensions_cm` numeric |
| **S-04** | **SKU visible para RMA** + EAN si aplica | Trazabilidad | PDP meta (pequeño) | `sku` unique |
| **S-05** | **Advertencia alergias / composición** (cera soja, aceites esenciales) | L.24240 art.5 productos peligrosos | Bloque ingredientes | `tags` + text |
| **S-06** | **Política por categoría**: consumibles usados (vela encendida, incienso abierto) no retornables por higiene | marca.md §8.2 + RMA per-category | Tab devoluciones con detalle por `tipo` | `global_settings.return_policy_by_tipo` |
| **S-07** | **Sellos / certificaciones**: origen ético piedras si existe, sino no prometer | marca.md §8.3 | Badge "origen ético" | boolean + proof doc |
| **S-08** | **SEO: JSON-LD Product + AggregateRating + Review** + hreflang x4 | DEV-02 | `<script type="application/ld+json">` en PDP | `src/lib/seo/json-ld.ts` |
| **S-09** | **Consentimiento granular** para personalización | PRIV-01 | Consent banner | `cookie-consent.tsx` |

---

## 3. PDP Layout Mapping (what goes where)

```
Hero (galería WebP/AVIF + BlurHash, 44px thumb)     ← P-08
  nombre (lowercase, font-chunky)                    ← P-07
  precio IVA incluido + tachado oferta + %off calc   ← P-01 (MONEY-01)
  precio por unidad si fraccionable                  ← P-02
  stock badge + "últimas unidades" (<5)             ← P-03
  [agregar al carrito.] pill terracota sticky bottom ← UX-01 44px
  medios de pago icons                               ← P-10

Tabs (lazy load, no fetch hasta click — PERF-04):
  Descripción (TipTap)                               ← P-07
  Cómo se usa / Seguridad fuego                      ← S-02
  Origen y tradición                                 ← S-01
  Especificaciones (peso/dims/SKU)                  ← S-03/04
  Envíos (calculator + plazos)                       ← P-09
  Cambios y devoluciones (10 días)                   ← P-05 + S-06
  Garantía (6 meses + certificado)                   ← P-06

Disclaimer esotérico fijo                            ← P-11 (DOC-01)
Vendedor (CUIT/domicilio) link /terms               ← P-04
JSON-LD Product + Review                             ← S-08
Related products carousel (cross-sell)               ← facets
```

---

## 4. Validation Rules (Zod + DB)

```ts
// src/lib/validations/product.ts (extracto)
export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(80),
  title: z.string().min(3).max(120),
  excerpt: z.string().min(20).max(155), // SEO meta
  price_cents: z.number().int().min(0),  // MONEY-01 INT ARS centavos
  currency: z.literal('ARS'),
  sale_price_cents: z.number().int().min(0).nullable(),
  sale_start: z.coerce.date().nullable(),
  sale_end: z.coerce.date().nullable(),
  stock: z.number().int().min(0),
  sku: z.string().min(3).max(32),
  weight_grams: z.number().int().min(0).nullable(),
  dimensions_cm: z.string().regex(/^\d+x\d+x\d+$/).nullable(), // LxWxH
  images: z.array(z.string().url()).min(1).max(8),
  tipo: z.enum(tipo10),
  tradicion: z.enum(tradicion9),
  intencion: z.enum(intencion7),
}).refine(v => !v.sale_price_cents || v.sale_price_cents < v.price_cents,
  "sale_price debe ser < price");

// DB constraints (migrations 0002/0003):
// price_cents INT CHECK >=0, currency CHAR(3) CHECK ='ARS', deleted_at, search_vector GIN spanish
// Sale window evaluated at render: sale_active = now ∈ [sale_start, sale_end]
```

Server price integrity (ECOM-04): checkout **recomputes** total from `products.price_cents` in DB transaction — client `total` is ignored (409 price_mismatch).

---

## 5. Copy Obligatoria (NO inventar — pegar tal cual)

**Precio:** `AR$ 12.490,00 — IVA incluido (21%)`  (formateado con `Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'})`)

**Arrepentimiento (art.34):**
> Tenés 10 días corridos desde que recibís el producto para arrepentirte (Ley 24.240 art. 34). Escribí a hola@trino.com.ar con tu nº de pedido. El producto debe estar sin uso y en su empaque original. Consumibles encendidos/abiertos (velas, inciensos) no admiten devolución por higiene — ver /cambios-devoluciones.

**Garantía (art.11):**
> Garantía legal 6 meses por defectos de fabricación (Ley 24.240 art. 11). No cubre mal uso, rotura por caída o desgaste normal. Ver /garantia.

**No-médico (DOC-01):**
> Contenido esotérico con fines de entretenimiento y bienestar espiritual. No reemplaza consejo médico, psicológico, legal o financiero profesional.

**Seguridad fuego (velas/inciensos):**
> Nunca dejes velas o inciensos encendidos sin supervisión. Mantener alejado de niños, mascotas y materiales inflamables. Usar sobre superficie resistente al calor.

**Vendedor (CCyC 1100):**
> Vendedor: Santísima Trinidad — CUIT 30-XXXXXXX-X — Domicilio: CABA, Argentina — legal@santisimatrinidad.com.ar — Defensa del Consumidor 0800-666-1518 — https://www.argentina.gob.ar/produccion/defensadelconsumidor

---

## 6. Checklist Pre-Launch (MUST)

- [ ] Todos los productos con `price_cents` INT + `IVA incluido` visible en PDP y PLP
- [ ] Consumibles fraccionables muestran precio por unidad
- [ ] Stock real + OCC `updated_at` enviado en cada save (409 si conflicto)
- [ ] CUIT + domicilio visibles (footer + PDP + /terms)
- [ ] Tab devoluciones menciona 10 días + link `/cambios-devoluciones`
- [ ] Tab garantía menciona 6 meses + flujo RMA per-tipo
- [ ] Disclaimer esotérico bajo descripción en todos los PDP con `tradicion!=general`
- [ ] Advertencia fuego en `tipo ∈ {velas, inciensos}` 
- [ ] Imágenes presigned URL (magic-bytes), WebP/AVIF + BlurHash
- [ ] Envío cotizado antes de pago + fallback fijo
- [ ] JSON-LD Product validado en https://search.google.com/test/rich-results
- [ ] Términos muestran IVA, domicilio, factura C/B, olvido DELETE y Defensa 0800

---

## 7. Fuentes

- InfoLEG — Ley 24.240 texact (arts. 4, 10, 10ter, 11-15, 34, 36)
- Ley 22.802 lealtad comercial + Res. SCI 7/02 exhibición precios
- CCyC arts. 1100-1110 contratos a distancia
- Res. SCI 244/2021 + 424/2020 (botón arrepentimiento / e-commerce)
- `openspec/AGENT_RULES.md` T-C07/T-C07b · `DOCS/LEGAL.md` DOC-01 · `DOCS/TERMS.md` Ley 24.240
- `supabase/migrations/0002_money_int.sql` (MONEY-01) + `0003_softdelete_fts.sql`
