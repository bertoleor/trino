# trino. Design System — Bauhaus

Inspired by Bauhaus "form follows function" + trino. Neo-Bauhaus palette.
Geometric, minimal, high-end esoteric.

## Tokens

- `--primary` #D95D39 (terracota) — CTAs
- `--color-verde` #2B4731 — secondary
- `--color-mostaza` #E6AF2E — badges/discounts
- `--color-celeste` #7A9E9F — decorative arcs
- `--text-grafito` #212529 — replaces pure black
- `--bg-crema` #FDFBF7 — secondary bg
- `--pill` 9999px — all buttons pill
- `--space` 4/8/16/24 — 8pt grid
- Geist Sans/Mono, 44px min target, fluid clamp typography
- Motion: hardware-accelerated opacity/transform only, respects `prefers-reduced-motion`

## Components

- `Button` pill 50px, 44px min, focus-visible ring, disabled aria
- `Badge` mostaza/grafito pill
- `Input` pill 44px, focus ring primary
- `Card` rounded-2xl border, shadow-sm
- `Skeleton` exact geometry, animate-pulse

## Rules

- Mobile-first, 44x44 targets via padding
- One primary button per screen
- Skeletons match content geometry
- Tailwind strict — no arbitrary values outside tokens
- Hidden `/[locale]/design` page showcases system

Trace: UX-01..09, CQ-09, marca.md, bahaus.md
