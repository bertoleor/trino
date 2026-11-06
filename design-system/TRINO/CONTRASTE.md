# Contraste TRINO (bauhaus): tokens reales vs catálogo UUPM → CONTRASTE.md

> **Búsqueda:** keywords: contraste, tokens, bauhaus, UUPM, design system · clasificación: design-system · estado: draft · actualizado: 2026-10-17

## Resumen
Se contrastan los tokens de diseño reales de TRINO contra la fila `bauhaus` del catálogo UUPM-UI/UX Pro Max. Se identifican coincidencias, mejoras potenciales y divergencias intencionales según los lineamientos del proyecto. El resultado sirve como documentación de decisiones de diseño y guía para posibles adopciones del catálogo.

## Índice
1. [Resumen](#resumen)
2. [Tabla de Contraste](#tabla-de-contraste)
3. [Mejoras adoptadas del catálogo](#mejoras-adoptadas-del-catálogo)
4. [Divergencias intencionales](#divergencias-intencionales)
5. [Style ID](#style-id)
6. [Referencias](#referencias)

## Tabla de Contraste

|| Categoría | Ítem Catálogo (bauhaus) | Valor Real en TRINO | Cita (path:line) | Veredicto |
|---|---|---|---|---|
| Primary Colors | Primary Red #D02020 | No equivalente (usa Raspberry #dd2d4a, Rosa Intenso #f26a8d, Berry #880d1e) | src/styles/tokens.css:2 (`--primary: #dd2d4a;`), src/styles/tokens.css:4 (`--color-rosa-intenso: #f26a8d;`), src/styles/tokens.css:5 (`--color-acento: #880d1e;`) | Divergencia intencional |
| Primary Colors | Primary Blue #1040C0 | No equivalente (paleta rosa/lila/celeste) | src/styles/tokens.css:2‑6 | Divergencia intencional |
| Primary Colors | Primary Yellow #F0C020 | No equivalente | src/styles/tokens.css:2‑6 | Divergencia intencional |
| CSS/Technical Keywords | border-radius: 0px (cards/inputs) | No token de radio 0px; usa píldora 9999px | src/styles/tokens.css:8 (`--pill: 9999px;`) | Divergencia intencional (prefiere bordes completamente redondos) |
| CSS/Technical Keywords | border-radius: 9999px (buttons/FAB) | --pill: 9999px | src/styles/tokens.css:8 (`--pill: 9999px;`) | Coincidencia |
| CSS/Technical Keywords | font-family: Outfit | usa var(--font-geist-sans), system-ui, sans-serif | src/styles/tokens.css:24 (`font-family: var(--font-geist-sans), system-ui, sans-serif;`) | Divergencia intencional |
| Design System Variables | --color-red: #D02020 | No variable equivalente — ahora Raspberry #dd2d4a disponible | — | Mejora (podría adoptarse) |
| Design System Variables | --color-blue: #1040C0 | No variable equivalente — ahora Light Cyan #cbeef3 disponible | — | Mejora |
| Design System Variables | --color-yellow: #F0C020 | No variable equivalente | — | — |
| Light/Dark Mode | Light Mode ✓ supported, Dark Mode ✓ dual | Soporte claro/oscuro vía :root y @media (prefers-color-scheme: dark) | src/app/globals.css:6‑9, src/app/globals.css:18‑22 | Coincidencia |
| Framework Compatibility | react-native|expo|swiftui|flutter|tailwind | Next.js (React) + Tailwind CSS (import en globals.css) | src/app/globals.css:1 (`@import 'tailwindcss';`) | Coincidencia (Tailwind y React) |

## Mejoras adoptadas del catálogo
- Variables de diseño system: --color-red, --color-blue, --color-yellow, --color-bg, --color-fg, --border-width, --shadow-hard, --radius-block, --font-display, --font-weight-hero.
- checklist de implementación (todos los ítems de la lista: formas geométricas únicamente, bloqueo de color primario, sombras duras 4px, borde‑2 negro, estado press mecánico, títulos Outfit Black 900 uppercase, área segura, objetivos amigables para pulgar, sin estados hover, ritmo vertical de columna simple).
- Accesibilidad mejorada: asegurar contraste de texto ≥4.5, foco visible, navegación por teclado.
- Área segura y objetivos táctiles amigables (thumb‑friendly h‑12/h‑14).

## Divergencias intencional‑es
- Paleta de colores: TRINO elige una paleta terracota/verde/mostaza/celeste en lugar de los primarios puros rojo/azul/amarillo del catálogo, conforme a su identidad de Neo‑Bauhaus y su posicionamiento esotérico (ver branding.md y bahaus-y-neo-bahaus.md).
- Radio de borde: únicamente utiliza píldora 9999px (bordes completamente redondos) evitando radios 0px.
- Tipografía: prefiere la familia Geist Sans (var(--font-geist-sans)) sobre Outfit.
- Sombras: intencionalmente evita sombras duras, optando por un enfoque sin sombras o con sombras sutiles mediante clases de movimiento.
- Bordes: no define un borde uniforme de 2px negro; delega el estilo de bordes a componentes específicos según necesidad.

## Style ID
bauhaus

## Referencias
[[ticket-contraste-uupm-projects]]
[[UUPM-OPERATIONS]]