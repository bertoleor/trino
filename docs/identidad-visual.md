# trino. — identidad visual (tokens y reglas)

> Canónico baseline. **Verificado contra `src/styles/tokens.css`** (valores
> reales en código). Origen conceptual: `docs/DOCS/marca.md` §1-2 y
> `docs/DOCS/bahaus-y-neo-bahaus.md`. Regla de oro: heredar, nunca inventar
> colores nuevos.

## Paleta (design tokens reales)

| Token | Valor en código | Uso |
|---|---|---|
| `--primary` | `#D95D39` (terracota) | CTAs, botones de compra |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primario |
| `--color-verde` | `#2B4731` | Botones secundarios, ritual/naturaleza |
| `--color-mostaza` | `#E6AF2E` | Badges, alertas, descuentos |
| `--color-celeste` | `#7A9E9F` | Decorativo: arcos, formas orgánicas |
| `--text-grafito` | `#212529` | Texto — reemplaza al negro puro en todo el sitio |
| Fondo principal | `#FFFFFF` | `--bg-blanco` (en `body`) |
| Fondo secundario | `#FDFBF7` | `--bg-crema` (definido en marca; verificar que exista como token antes de usar) |

## Tipografía

- Títulos: `--font-chunky` (Poppins / Clash Display / Montserrat),
  minúscula, peso 900.
- Lectura: `--font-lectura` (Inter / Roboto / Lato).
- Base real en código: `body { font-family: var(--font-geist-sans) }`,
  `html { font-size: 16px }`. Si se migra a chunky/lectura, hacerlo vía
  tokens, no por overrides sueltos.

## Espaciado, forma y touch

- Escala `--space-1/2/3/4`: 4 / 8 / 16 / 24 (grid 8pt).
- Botón píldora: `--pill: 9999px`, minúscula, negrita gruesa.
- Target touch mínimo **44px** (`button, a { min-height: 44px }`,
  `@media (pointer: coarse)` en `responsive.css`).

## Reglas de composición Neo-Bauhaus

- **Home:** hero con figura recortada (vela, mazo) sobre forma geométrica
  (arco mostaza/celeste), no fotos rectangulares. Cada bloque de categoría
  con su forma de fondo (círculo, arco, media luna).
- **PLP:** foto vertical (3:4 o 4:5), bordes redondeados, color blocking con
  los 4 acentos rotando por categoría.
- **Badges:** siempre mostaza + grafito, minúscula ("30% off.", "nuevo.",
  "últimas unidades."). Nunca rojo/verde genérico.
- **Botones:** terracota = acción principal ("agregar al carrito."),
  verde = secundaria ("ver más.", "guardar.").
- **Decoración:** arcos y círculos recurrentes (separadores, marcos,
  banners). Nada de degradés/estrellas new-age.
- **Motion** (`src/styles/motion.css`): grid-wipe, mask-reveal,
  shape-morph solo con clip-path/mask/transform (CLS<0.1);
  `prefers-reduced-motion` desactiva animaciones.

## Filosofía (texto de referencia para "nuestra propuesta")

La Bauhaus nació del misticismo (Itten, Kandinsky: colores que vibran en el
alma). trino. rescata esa etapa: geometría y espíritu como una sola cosa.
Lo esotérico asociado al exceso y al caos es lo opuesto a esta marca — la
verdadera espiritualidad aporta claridad. ("La forma sigue a la función" =
UX moderna: si quitás un elemento y el sitio se entiende igual, sobraba.)
