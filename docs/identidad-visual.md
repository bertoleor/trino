# trino. — identidad visual (tokens y reglas)

> Fuente canónica: [`docs/brand/`](brand/README.md) — manual importado el 2026-11-23.
> Este archivo es el índice corto; la especificación completa está en
> [`docs/brand/manual-marca.md`](brand/manual-marca.md).
> Los documentos de marca anteriores fueron cancelados y retirados del repositorio.

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#17141B` | texto, superficie fuerte, acción primaria |
| `--cream` | `#FFF8E8` | superficie base, texto inverso |
| `--pink` | `#FF75AE` | color pop protagonista |
| `--orange` | `#FF5A36` | energía, acción, error |
| `--lilac` | `#A98AF5` | fondos editoriales |
| `--aqua` | `#21BFA6` | frescura, éxito |
| `--lemon` | `#FFD84A` | señalización, advertencia |
| `--cobalt` | `#3155F5` | contraste digital, foco |

Tokens semánticos: `--text-primary`, `--text-inverse`, `--surface-base`, `--surface-strong`,
`--surface-brand`, `--surface-info`, `--surface-success`, `--surface-warning`, `--surface-error`,
`--action-primary`, `--action-primary-text`, `--focus-ring`.

**No inventar colores.** Fuente exacta: `docs/brand/trino-tokens.css` y `trino-tokens.json`.

## Tipografía

- Display: Fredoka Semibold/Bold.
- Texto y UI: DM Sans Regular/Medium/Bold.
- Escala: display `clamp(4.5rem, 11vw, 11.125rem)` · h1 `clamp(3.25rem, 7vw, 7rem)` ·
  body `1rem` · caption `0.75rem`.

## Forma y movimiento

- Radio: control `999px`, card `0px`. Borde `2px`.
- Espaciado: 4 / 8 / 16 / 24 / 40px; sección `clamp(80px, 10vw, 150px)`.
- Movimiento: 160ms / 280ms / 420ms con `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Patrones: damero, rayas, ondas y puntos (SVG en `docs/brand/assets/`). Máximo dos por composición.

## Reglas de voz

- `trino.` siempre minúsculo con punto. El resto del copy con mayúscula inicial oracional.
- Directa, cómplice, expresiva y útil; segunda persona. Sin `text-transform: lowercase` global.

## Accesibilidad

Pares AA aprobados para texto (texto / fondo): Ink/Cream, Ink/Pop Pink, Ink/Tangerine,
Ink/Lilac, Ink/Aqua, Ink/Lemon y Cream/Cobalt. Prohibidos para texto: Cream/Tangerine,
Cream/Pop Pink y duplas entre colores pop. Ver `docs/brand/checklist-aprobacion.md`.

## Reglas técnicas conservadas

Target touch mínimo 44px, grid 8pt, axe y i18n en 4 locales (`es-AR`, `en`, `fr`, `pt-BR`).
Se verifican en `src/styles/`, tests unitarios y e2e.

## Pendiente de migración

`src/styles/tokens.css` sigue con los valores anteriores. La portación a Tailwind v4 se hará
cuando se importen las pantallas HTML de Stitch; este doc solo establish la fuente de verdad.
