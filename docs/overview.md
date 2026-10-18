# trino. — overview (qué es)

> Canónico baseline. Verificado contra `README.md`, `ARCHITECTURE.md`,
> `docs/DOCS/marca.md`, `src/app/`. Solo documentación, cero código.

## Qué es

**trino.** (siempre minúscula, con punto final) es un e-commerce high-end de
productos esotéricos multi-creencia: tarot y oráculos, velas, inciensos y
resinas, cristales y piedras, amuletos y talismanes, aceites y esencias,
altares y elementos rituales, libros y guías, joyería simbólica, sets de
regalo.

Diferencial frente al e-commerce esotérico genérico (degradés, estrellas,
new-age recargado): estética **Neo-Bauhaus** — geometría pura, color
blocking, formas orgánicas simples (arcos, círculos) — y **curaduría
respetuosa multi-creencia**: ninguna tradición se presenta como superior a
otra; cada producto vinculado a una tradición lleva contexto de origen
cultural/religioso real.

## Dominios y contacto

| Elemento | Valor |
|---|---|
| Marca | **trino.** |
| Dominios | `santisima-trinidad.com.ar` (primario) + `.com` (global); futuro `trino.com.ar` |
| Redes | @holatrino (IG / TikTok) |
| Email | holatrino@gmail.com |
| Locales | es-AR (default), en, fr, pt-BR (`messages/`, 4 carpetas) |

##Triple entrada del catálogo

El usuario navega por tres ejes combinables como **filtros**, no como tres
menús separados:

1. **Por tipo de producto** — tarot · velas · inciensos · cristales ·
   amuletos · aceites · altares · libros · joyería · sets.
2. **Por tradición/creencia** (transversal, no excluyente) — tarot y
   astrología · wicca y paganismo · budismo · santería y religiones afro ·
   feng shui · cristaloterapia · chamanismo · misticismo cristiano popular ·
   espiritualidad general.
3. **Por intención** (el filtro más usado) — amor · protección · abundancia ·
   limpieza energética · sueño y descanso · conexión espiritual · duelo y
   sanación.

Fuente: `docs/DOCS/marca.md` §3, `docs/reports/2026-09-12-trino-producto-marketing-estilo.md` §1.1.

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
- `docs/branding.md` — marca, voz, copy.
- `docs/identidad-visual.md` — tokens y reglas visuales verificadas en código.
- `docs/funciones.md` — funciones por capacidad, con evidencia en `src/`.
- `docs/README.md` — índice de esta carpeta.
