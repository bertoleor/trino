# trino. — overview (qué es)

> Canónico baseline. Verificado contra `README.md`, `ARCHITECTURE.md` y
> `src/app/`. Solo documentación, cero código. La identidad visual la define
> `docs/brand/` (manual importado el 2026-11-23); los docs de marca viejos
> quedaron cancelados.

## Qué es

**trino.** (siempre minúscula, con punto final) es una tienda digital de
belleza: maquillaje, skincare e insumos para ojos, labios, rostro, manicure y
pestañas. Posicionamiento vigente confirmado el 2026-11-23: **"Belleza que hace
ruido."** · "Todo para crear tu versión más vos." Público principal Gen Z;
público secundario profesionales de belleza (maquilladoras, manicuristas,
lashistas).

Diferencial frente al e-commerce de belleza genérico: identidad **pop,
atrevida y social-first** — bloques de color, dameros, rayas, formas orgánicas
y tipografía redondeada de alto peso — con foco en ayuda real para elegir
(gama/tono/acabado), no solo estética. La voz es directa, cómplice, expresiva
y útil, en segunda persona. Fuente: `docs/brand/manual-marca.md`.

## Dominios y contacto

| Elemento | Valor |
|---|---|
| Marca | **trino.** |
| Dominios | `santisima-trinidad.com.ar` (primario) + `.com` (global); futuro `trino.com.ar` |
| Redes | @holatrino (IG / TikTok) |
| Email | holatrino@gmail.com |
| Locales | es-AR (default), en, fr, pt-BR (`messages/`, 4 carpetas) |

## Catálogo (modelo objetivo)

Cinco categorías — ojos · labios · rostro · manicure · pestañas — con
subcategorías y atributos de `brand`, `shade` (hex del tono) y `finish`.
Fuente: `docs/estructura-catalogo-trino.md` y
`supabase/migrations/0027_makeup_products.sql`.

> **Deuda técnica conocida:** el runtime todavía consulta la tabla `products`
> con las facetas heredadas `tipo`/`tradicion`/`intencion`
> (`src/lib/db/facets.ts`, `src/app/[locale]/tienda/page.tsx`). Es código
> pendiente de migrar, no el modelo de producto objetivo. No agregar facetas
> esotéricas nuevas.

## Rutas principales (verificadas en `src/app/`)

| Ruta | Archivo |
|---|---|
| Home localizada | `src/app/[locale]/page.tsx` |
| Tienda (PLP) | `src/app/[locale]/tienda/page.tsx` |
| Producto (PDP) | `src/app/[locale]/producto/[slug]/page.tsx` + `reviews/` |
| Cultura/blog | `src/app/[locale]/cultura/page.tsx` + `[slug]/` |
| Wishlist | `src/app/[locale]/(account)/wishlist/page.tsx` |
| Legal (5) | `src/app/[locale]/(legal)/` terms, envios, garantia, cambios-devoluciones, defensa-consumidor |
| Admin | `src/app/[locale]/admin/` cultura, calendar, easter, lanzamientos |
| Auth | `src/app/login`, `src/app/signup`, `src/app/auth/callback` |
| Design system | `src/app/[locale]/design/page.tsx` |

## Estado del proyecto

Branch `main`. Tests unit + integración + e2e. Releases con changesets
(`pnpm changeset` → `pnpm version` → `pnpm release`), nunca editando
`CHANGELOG.md` a mano. Detalle operativo en `docs/setup.md`; roadmap en
`docs/ROADMAP-NEXT-SDD.md`.

## Mapa de docs baseline

- `docs/stack.md` — framework y stack verificado.
- `docs/setup.md` — cómo se arma (install → dev → build → deploy).
- `docs/brand/` — manual de marca vigente (tokens, voz, logos, AA); `docs/identidad-visual.md` es su índice corto. `branding.md` quedó cancelado.
- `docs/funciones.md` — funciones por capacidad, con evidencia en `src/`.
- `docs/README.md` — índice de esta carpeta.
