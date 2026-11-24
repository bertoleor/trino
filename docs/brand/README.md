# trino. — manual de marca (fuente de verdad)

> Vigente desde 2026-11-23. Cancela íntegramente cualquier documentación visual anterior,
> incluidos los documentos de marca retirados y el material de transformación rosa/lila.
> Si otro doc contradice esta carpeta, vale esta carpeta.

## Procedencia

- Sitio publicado: https://wiry-kitten-68482426.figma.site/#kit
- Descargables originales: `E:/Archivos Usuario/Descargas/trino/manual/`
- Código del manual (app React/Vite/Tailwind v4): `E:/Archivos Usuario/Descargas/trino/manual/Manual de marca Trino/`

El código del manual NO se copió al repo: es una app editorial separada, sin e-commerce,
CMS, autenticación ni persistencia. Acá se conservan solo los artefactos canónicos.

## Archivos canónicos

| Archivo | Contenido |
|---|---|
| `manual-marca.md` | especificación completa: posicionamiento, logo, color, tipografía, patrones, voz, movimiento, aplicaciones y kit |
| `trino-tokens.css` | tokens CSS (`:root`) — fuente para portar a Tailwind v4 |
| `trino-tokens.json` | misma escala en JSON, útil para tests y generación de tokens |
| `checklist-aprobacion.md` | checklist de contenido, identidad, accesibilidad y producción |
| `kit-readme.md` | guía rápida del starter kit y convención de descargas |
| `assets/` | logos (primary/ink/reverse/symbol), iconos, patrones y mockups SVG oficiales |

## Identidad

- Nombre: **`trino.`** — siempre minúsculo, con punto final. El punto es la "chispa" del sistema.
- Rubro según el manual: maquillaje, skincare e insumos de belleza.
- Concepto: **"Belleza que hace ruido."** · Apoyo: **"Todo para crear tu versión más vos."**
- Personalidad: cómplice, curiosa, atrevida, clara y optimista. Nunca infantil, elitista ni excesivamente técnica.
- Público: Gen Z (principal) y profesionales de belleza — maquilladoras, manicuristas, lashistas (secundario).

## Voz — regla que corrige la anterior

- El **nombre de marca** va minúsculo. El resto del copy usa **mayúscula inicial oracional**:
  no aplicar `text-transform: lowercase` global (esa regla pertenecía al manual cancelado).
- Principios: directa, cómplice, expresiva y útil. Segunda persona ("vos").
- El punto del logo no obliga a cerrar cada frase con punto.

## Paleta

| Token | HEX | Rol |
|---|---|---|
| `--ink` | `#17141B` | texto, contraste, versión monocroma |
| `--cream` | `#FFF8E8` | base cálida, respiro |
| `--pink` | `#FF75AE` | actitud, foco, color pop protagonista |
| `--orange` | `#FF5A36` | energía, acción |
| `--lilac` | `#A98AF5` | expresión, editorial |
| `--aqua` | `#21BFA6` | frescura, skincare |
| `--lemon` | `#FFD84A` | señal, descubrimiento |
| `--cobalt` | `#3155F5` | impacto digital, foco de foco |

Proporción recomendada: Cream 55% · Ink 25% · pop 15% · acento 5%. Un solo pop protagonista y
como máximo un acento. Patrones: máximo dos por composición, con zonas de descanso en Cream.

## Tipografía y forma

- Display: **Fredoka** Semibold/Bold (Google Fonts).
- Texto y UI: **DM Sans** Regular/Medium/Bold (Google Fonts).
- Bordes: control `999px`, card `0px`, grosor `2px`.
- Espaciado: 4 / 8 / 16 / 24 / 40px; sección `clamp(80px, 10vw, 150px)`.
- Movimiento: feedback 160ms · entrada 280ms · escena 420ms · `cubic-bezier(0.2, 0.8, 0.2, 1)`.
  Respetar `prefers-reduced-motion`.

## Accesibilidad — pares AA aprobados para texto

`Ink/Cream` 17.22:1 · `Ink/Pop Pink` 7.30:1 · `Ink/Tangerine` 5.87:1 ·
`Ink/Lilac` 6.63:1 · `Ink/Aqua` 7.87:1 · `Ink/Lemon` 13.17:1 · `Cream/Cobalt` 5.29:1.

El primer color es el texto y el segundo el fondo. Prohibido para texto e información funcional:
`Cream/Tangerine`, `Cream/Pop Pink` y cualquier dupla entre colores pop (solo decorativo).

## Estado de la migración

- Los tokens de esta carpeta son la referencia. `src/styles/tokens.css` todavía tiene los valores
  anteriores: portarlos a Tailwind v4 es trabajo pendiente, no hacerlo en este import.
- Faltan las pantallas HTML de Stitch (ZIP) para el mapeo pantalla → ruta de `src/app/[locale]/`.
