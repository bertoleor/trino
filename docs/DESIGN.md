# trino. — Design System

> **Fuente canónica:** `docs/brand/` — manual de marca importado el 2026-11-23 y pantallas
> HTML de Stitch (a incorporar). Este archivo es solo el índice técnico.
> Las decisiones visuales anteriores (paleta rosa/lila/celeste, Neo-Bauhaus, esoterismo)
> fueron canceladas. No usar sus valores en código nuevo.

## Tokens

Los tokens exactos viven en `docs/brand/trino-tokens.css` y `docs/brand/trino-tokens.json`.
No redefinirlos aquí ni inventar colores.

- Marca: Ink `#17141B`, Cream `#FFF8E8`.
- Pops: Pink `#FF75AE`, Orange `#FF5A36`, Lilac `#A98AF5`, Aqua `#21BFA6`,
  Lemon `#FFD84A`, Cobalt `#3155F5`.
- Tipografía: Fredoka (display) + DM Sans (texto y UI).
- Radio: control `999px`, card `0px`. Borde `2px`.
- Movimiento: 160 / 280 / 420 ms con `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Patrones: damero, rayas, ondas y puntos — SVG en `docs/brand/assets/`.

## Reglas vigentes

- `trino.` siempre minúsculo con punto; el resto del copy con mayúscula inicial oracional.
  No aplicar `text-transform: lowercase` global.
- Mobile-first, objetivos táctiles mínimos de 44 px, grid de 8 pt.
- Contraste AA: pares aprobados en `docs/brand/checklist-aprobacion.md`.
- `prefers-reduced-motion`: animaciones de opacidad/transformación aceleradas por GPU.
- Skeleton con la geometría exacta del contenido; un botón primario por pantalla.
- Tailwind v4 estricto: solo valores de tokens, sin arbitrary values.

## Estado de la portación

`src/styles/tokens.css` todavía contiene los valores anteriores. La sustitución por los tokens
de `docs/brand/` y el armado de componentes se hacen con las pantallas Stitch, sin reiniciar
el proyecto. Backend, RLS/RBAC, pagos, i18n en 4 locales, tests y CI se conservan.

Trace: UX-01..09 · `docs/brand/manual-marca.md`
