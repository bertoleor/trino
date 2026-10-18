# 03 — Pages Coverage Map (Legal Pages)

> **Scope:** Qué páginas legales necesita Trino, qué debe contener cada una, dónde se enlazan y cómo trazan a T-C07 / T-C07b / PRIV-01.  
> **Trace:** T-C07 (DOC-01 + disclaimer) · T-C07b (terms + defensa + TERMS.md) · T-C05b (granular consent) · `src/app/[locale]/(legal)/*` · `src/app/[locale]/privacy/page.tsx` · `DOCS/LEGAL.md` · `DOCS/TERMS.md`  
> **Locales:** `es-AR` (default) + `en` + `fr` + `pt-BR` — cada página legal debe existir en los 4 `messages/{locale}/legal.json` namespaces; fallback a `es-AR`.

---

## 1. Mapa Completo de Páginas Legales (7 obligatorias + 1 recomendada)

| # | Ruta (`/[locale]/...`) | Título ES-AR | Estado actual | Contenido mínimo (qué va adentro) | Fuente legal | Trace |
|---|---|---|---|---|---|---|
| **L-01** | `/terms` (alias `/terminos`) | Términos y Condiciones | ✅ existe `src/app/[locale]/(legal)/terms/page.tsx` | Precios IVA incluido, factura C/B, domicilio CUIT, jurisdicción CABA, oferta válida hasta stock, 10 días arrepentimiento, garantía 6m, esoteric disclaimer link | L.24240 art.4/10/34/11 + Res.244/21 | T-C07b |
| **L-02** | `/defensa-consumidor` | Defensa del Consumidor — Ley 24.240 | ✅ existe `defensa-consumidor/page.tsx` | Texto Ley 24.240 + link oficial https://www.argentina.gob.ar/produccion/defensadelconsumidor + **0800-666-1518** visible, domicilio proveedor, "información clara y trato digno" | Res.244/21 + L.24240 CABA voter o requiere visto por el est. y para ar. | T-C07b |
| **L-03** | `/privacy` (alias `/privacidad`) | Privacidad / Políticas de Privacidad | ✅ existe `src/app/[locale]/privacy/page.tsx` | LOPD/Ley 25.326 base, consentimiento granular necesario/analítica/marketing, **vigencia consent 1 año**, derechos ARCO (acceso/rectificación/supresión), contacto privacidad@, `DELETE` + anonimización 365d, Data retention | Ley 25.326 + PRIV-01/02/03/04 | T-C05b |
| **L-04** | `/cambios-devoluciones` | Cambios, Devoluciones & Arrepentimiento | ❌ crear | Plazo 10 días corridos (art.34), cómo ejercer (email/form + nº pedido), estado del producto (sin uso), excepciones por higiene (velas encendidas / inciensos abiertos / aceites abiertos NO retornables — marca.md §8.2), costo flete devolución a cargo de quién, RMA por categoría, NC vinculada | L.24240 art.34 + marca.md §8.2 | **Gap — prioridad ALTA** |
| **L-05** | `/envios` | Política de Envíos | ❌ crear (existe shipping logic pero no página legal) | Cobertura nacional, plazos estimados, carriers (Andreani/Correo/OCA + DHL si intl flag), costo antes de pagar (ECOM-06), restricciones combustibles (velas/resinas — marca.md §6), responsabilidad transportista (L.24240 art.40), seguimiento con tracking | ECOM-06 + LOG-01/02/03 + L.24240 art.40 | Gap — **bloquea checkout** |
| **L-06** | `/garantia` | Garantía Legal | ❌ crear (mencionada en terms pero sin página propia) | 6 meses nuevos / 3 meses usados (art.11), qué cubre (vicios fabricación), qué no (mal uso), cómo reclamar (email + certificado PDF), transporte a cargo del vendedor si aplica, cambio / devolución dinero / descuento a elección del consumidor (art.17) | L.24240 art.11-14, 17 | Gap |
| **L-07** | `/cookies` (sub-ruta de privacy o standalone) | Política de Cookies | ⚠️ parcial (`cookie-consent.tsx` existe pero falta página) | Qué cookies usa el sitio (necesarias/sesión/carrito, analítica PostHog, marketing Resend), cómo dar/revocar consent, vigencia 1 año, link a `privacy` | PRIV-01 + ePrivacy | T-C05b |
| **L-08** | `/legal-avisos` *(opcional, SEO + transparencia)* | Aviso Legal / Propiedad Intelectual | ⚠️ parcial (`DOCS/LEGAL.md` existe) | Titular del sitio, CUIT, domicilio, propiedad intelectual Bauhaus, disclaimer esotérico completo DOC-01 | DOC-01 | T-C07 |

> **Nota de ruteo:** Todas bajo `src/app/[locale]/(legal)/` route group `(legal)` para compartir layout angosto `max-w-3xl` (ya usado en terms/defensa). Cada una con `generateMetadata` dinámico (DEV-02) + `hreflang x4`.

---

## 2. Contenido Detallado por Página (qué debe decir exactamente)

### L-04 — /cambios-devoluciones (la más crítica — hoy no existe)

```md
# Cambios, devoluciones y derecho de arrepentimiento (Ley 24.240, art. 34)

**Tenés 10 días corridos** desde que recibís el producto para arrepentirte sin dar motivo.
Cómo ejercerlo: escribí a hola@trino.com.ar o usa el formulario /contacto con tu nº de pedido.
El producto debe estar **sin uso, en empaque original, con etiquetas**. No se reintegra flete salvo falla.

**Excepciones por higiene/salud (no retornables si abiertos/usados):**
- Velas encendidas o con cera derretida
- Inciensos, resinas y sahumerios abiertos
- Aceites y esencias abiertos
- Cristales desempacados sin film (opcional según política)
Ver detalle por `tipo` en tabla abajo — esta excepción es válida bajo L.24240 por razones de higiene.

Costo de devolución: a cargo del comprador salvo producto fallado (art. 11 — a cargo del vendedor).
Reintegro: dentro de 10 días via mismo medio de pago; si fue transferencia, a CBU alias informado.
Nota de Crédito C/B vinculada si correspondiera factura fiscal.
```

Validación: `global_settings.return_policy_by_tipo` JSONB + PDP tab consume mismo texto (CMS-01).

### L-05 — /envios

```md
# Envíos

Enviamos a todo el país vía Andreani / Correo Argentino / OCA (carrier Strategy).
Plazo estimado 3–7 días hábiles desde `processing`. Costo calculado antes de pagar en checkout
según CP + peso/dims; si todos los carriers fallan se usa tarifa plana de `global_settings`.

Restricciones: velas y resinas son material combustible — algunos couriers requieren embalaje
especial; el sistema puede marcar productos con `shipping_restricted=true` y filtrar carrier.

Seguimiento: tracking provisto por carrier API (LOG-01) + formato A4 o ZPL térmico (LOG-02).
Responsabilidad transporte: L.24240 art.40 solidaria.
```

### L-06 — /garantia

```md
# Garantía legal (Ley 24.240, arts. 11–17)

- Nuevos: **6 meses** desde entrega. Usados: 3 meses.
- Cubre defectos de fabricación. No cubre mal uso, golpes, exposición a calor/humedad, desgaste.
- Cómo reclamar: email a garantia@ con foto + nº pedido + certificado (PDF en tu email de compra).
- Si debe trasladarse a taller, el flete es a cargo del vendedor (art. 11).
- Opciones si falla (art. 17 a elección del consumidor): reparación, cambio por idéntico, descuento o devolución total.
- Certificado de garantía en idioma nacional, letra legible (art. 14) — se adjunta en PDF de compra.
```

### L-07 — /cookies

Incluir tabla de cookies reales del stack:

| Nombre | Proveedor | Finalidad | Duración | Categoría consent |
|---|---|---|---|---|
| `sb-access-token` | Supabase | Sesión | 15 min JWT + refresh | Necesaria |
| `cart_session` | Trino | Carrito anónimo | 30 días | Necesaria |
| `consent` | Trino | Preferencias consent | **1 año** (396 días) | Necesaria (guarda elección) |
| `_posthog` | PostHog | Analítica | 1 año | Analítica (requiere opt-in) |
| `resend_marketing` | Resend | Email promo | Sesión | Marketing (requiere opt-in) |

Mensaje: "Sin tu consentimiento de marketing, no enviamos emails promocionales (solo transaccionales)." — T-C05b gate.

### L-01/L-02/L-03 — mejoras sobre lo existente

| Página | Faltante actual | Acción |
|---|---|---|
| `/terms` | Falta mención explícita de jurisdicción (CABA) y Retención IVA, y link a cada subpágina | Agregar sección "Jurisdicción: Tribunales Ordinarios de CABA" + lista de links a L-04/L-05/L-06/L-03 |
| `/defensa-consumidor` | Falta visual del 0800 y domicilio real (hoy dice CABA genérico) | Agregar bloque tipográfico grande con `0800-666-1518` + CUIT + domicilio + botón "Reclamar en Defensa" externo |
| `/privacy` | Falta vigencia 1 año explícita y derechos ARCO con formulario | Agregar "Tu consentimiento dura 1 año; podés revocarlo en /privacy / cookies" + formulario DELETE (PRIV-02) |

---

## 3. Footer — Links Obligatorios (global)

Footer must contain (Res.244/21 + Res.424/2020):

```
[ Logo trino. ]                        Ne Bauhaus pill footer

Comprar          Ayuda               Legal
Tienda           Envíos             Términos ─────── L-01
Cultura          Cambios/Devol.     Defensa ─────── L-02  ← 0800-666-1518 inline
Wishlist         Garantía           Privacidad ──── L-03
Contacto         Preguntas          Cookies ─────── L-07

[ Instagram @holatrino ] [ TikTok @holatrino ]     LOPD 1yr · CUIT · CABA
[ Botón Arrepentimiento ] ───────────────────────── L.24240 art.34 — link a /cambios-devoluciones#arrepentimiento
[ Data fiscal QR AFIP ] ─────────────────────────── Si factura fiscal activa, QR CAE verificado ARCA
```

**Implementación:**
- `src/components/shared/footer.tsx` (o `layout.tsx`) — links con `next-intl` `t('footer.*')`, sin hardcode.
- **Botón Arrepentimiento** obligatorio: link visible "Botón de arrepentimiento" que lleve a L-04 anclado. Res.424/2020 exige acceso directo desde home.
- QR AFIP (opcional hasta emitir fiscal, pero placeholder recomendado): `<img src="https://www.afip.gob.ar/images/qr/...">` con CUIT.

---

## 4. Consentimiento Granular — Trazabilidad T-C05b

```
[ Banner consent — src/components/shared/cookie-consent.tsx ]
  "Usamos cookies para que trino. funcione y para entender cómo lo usás."
  [ Necesarias (siempre ON, disabled) ]
  [ Analítica — PostHog 1M/mes free ]  ← OFF por defecto, gate T-D09c
  [ Marketing — Resend 100/d free ]    ← OFF por defecto, gate NOTIF-01
  [ Aceptar seleccionadas ] [ Aceptar todas ] [ Rechazar no esenciales ]
        ↓ guarda en cookie `consent={necessary:true, analytics:false, marketing:false, ts, expires: 1yr}`
        ↓ middleware lee `consent` y bloquea `posthog.capture` y `resend batch` si false (fail-closed)
        ↓ /privacy muestra estado y "Cambiar preferencias" (re-abre banner)
```

**Reglas:**
- Vigencia **1 año** desde otorgamiento (365 días) — renovar banner si expiró o si `consent.ts` >365d.
- Sin consent marketing, solo emails **transaccionales** (confirmación pedido, envío, factura) — nunca promo/calendario lunar.
- Consent state auditable en `audit_logs` si se quiere trazar (opcional).

---

## 5. Checklist i18n + SEO por Página Legal

- [ ] Cada página existe en `messages/es-AR/legal.json`, `en`, `fr`, `pt-BR` (fallback es-AR si falta clave — I18N-01)
- [ ] `generateMetadata` devuelve `title/description` único por locale + `alternates.languages` hreflang x4 + `openGraph.locale`
- [ ] Sitemap `app/sitemap.ts` lista `/es-AR/terms`, `/en/terms`, ... con `<xhtml:link>`
- [ ] Contenido culturalmente adaptado (no traducción literal de 0800) — en `en` explicar que 0800 solo AR, en `fr/pt-BR` nota "Argentina consumer law applies"
- [ ] `robots: index,follow` para legals (no `noindex` — son contenido de confianza para Google)

---

## 6. Roadmap Páginas Faltantes (orden de prioridad)

| Prioridad | Página | Esfuerzo | Bloquea |
|---|---|---|---|
| **P0 (esta semana)** | L-04 `/cambios-devoluciones` | 1 archivo + 60 líneas | Checkout + botón arrepentimiento |
| **P0** | L-05 `/envios` | 1 archivo + 80 líneas | Checkout (ECOM-06) |
| **P1** | L-06 `/garantia` | 1 archivo + 60 líneas | PDP tab garantía + emails |
| **P1** | Footer links + botón arrepentimiento | `footer.tsx` 40 líneas | Auditoría Res.244 |
| **P2** | L-07 `/cookies` completa | 1 archivo + tabla | Consent audit |
| **P2** | i18n legal.json x4 | 4 JSON | I18N gate |

Trace final: Every legal page back to `global_settings`/`pages` CMS-01 — admin edita sin deploy (ver Track C — Editors).

---

## 7. Referencias

- Res. SCI 244/2021 y 424/2020 (botón arrepentimiento, info e-commerce obligatoria)
- Ley 24.240 (InfoLEG texact) + Ley 25.326 (privacidad)
- `openspec/AGENT_RULES.md` T-C07b (4 locales render, footer links ok) · T-C05b (consent granular)
- `src/app/[locale]/(legal)/terms/page.tsx` + `defensa-consumidor/page.tsx` + `privacy/page.tsx` (existentes)
- `src/components/shared/cookie-consent.tsx` + `src/lib/analytics/posthog.ts` (gated)
