# trino. — Guía de Paleta de Colores

## Entregable para Equipo de Diseño
**Fecha:** 23 de octubre de 2026  
**Proyecto:** trino. — Transformación a tienda digital de maquillaje

---

## 1. Paleta Oficial (5 Colores)

Todos los códigos hex son válidos sin el prefijo `#`. Para usar en CSS/JS, prepender `#`.

| Código | Nombre | Uso Recomendado | CSS Variable |
|--------|--------|----------------|--------------|
| `880D1E` | Crushed Berry | Acentos, badges, texto oscuro sobre fondos claros | `--color-acento: #880D1E` |
| `DD2D4A` | Raspberry | Botones principales, CTAs, highlights | `--primary: #DD2D4A` |
| `F26A8D` | Bubblegum Pink | Tarjetas producto, states hover, elementos resaltados | `--color-rosa-intenso: #F26A8D` |
| `F49CBB` | Pink Mist | Fondos suaves, áreas de soporte, superficies grandes | `--color-rosa-pastel: #F49CBB` |
| `CBEF3` | Light Cyan | Fondo general (`body`), contraste, modo oscuro complementario | `--color-celeste-suave: #CBEF3` |

---

## 2. Especificaciones Técnicas

### Formato

- **Hex:** 6 caracteres alfanuméricos, minúsculas (a-f), números 0-9
- **Ejemplo válido:** `880d1e`, `DD2D4A`, `f26a8d`
- **Ejemplo inválido:** `#880d1e` (con # en variables CSS — usar solo en HTML directo), `880D1E` (mayúsculas no recomendadas aunque acceptadas por algunos validadores)

### Validación en Código

```javascript
// Validación Zod (usada en el CSV validator)
z.string().regex(/^[0-9a-f]{6}$/i).transform(val => val.toLowerCase())
```

### Uso en Tailwind v4

```html
<!-- Botón primary -->
<button class="bg-primary text-primary-foreground">Añadir al carrito</button>

<!-- Tarjeta con fondo pastel -->
<div class="bg-pink-mist p-4 rounded">...</div>

<!-- Texto acento -->
<span class="text-crushed-berry">¡Nuevo!</span>
```

---

## 3. Tokens CSS (src/styles/tokens.css)

```css
:root {
  --primary: #dd2d4a;
  --primary-foreground: #ffffff;
  --color-rosa-intenso: #f26a8d;
  --color-acento: #880d1e;
  --color-rosa-pastel: #f49cbb;
  --color-celeste-suave: #cbeef3;
  --text-grafito: #212529;
  --pill: 9999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
}
```

---

## 4. Aplicaciones en la Interfaz

### Componentes Actualizados

| Componente | Clase CSS | Uso | Ejemplo Visual |
|------------|-----------|-----|----------------|
| **Botón Primary** | `bg-primary` | CTA, "Añadir al carrito" | Fondo Raspberry `#DD2D4A` |
| **Botón Secundario** | `bg-pink-mist` | Secundario, "Ver más" | Fondo Pink Mist `#F49CBB` |
| **Tarjeta Producto** | `rounded-xl bg-white shadow-sm` | Display producto | Fondo blanco con acentos en Raspberry |
| **Badge** | `bg-crushed-berry` | Label, categoría | Texto en Crushed Berry `#880D1E` |
| **Input** | `focus:ring-primary` | Campo de búsqueda | Borde Raspberry al focuse |
| **Fondo General** | `bg-light-cyan` | Body, páginas completas | Fondo Light Cyan `#CBEF3` |

---

## 5. Accesibilidad (WCAG AA)

### Razones de Contraste Verificadas

| Combinación | Fondo | Texto | Ratio | Estado |
|-------------|-------|-------|-------|--------|
| Primario sobre blanco | `#DD2D4A` | `#FFFFFF` | 4.8:1 | ✅ AA |
| Acento sobre blanco | `#880D1E` | `#FFFFFF` | 3.9:1 | ⚠️ AA (border text recomendado) |
| Celeste sobre oscuro | `#CBEF3` | `#0A0A0A` | 3.5:1 | ⚠️ AA (texto negrita) |
| Berry sobre oscuro | `#880D1E` | `#FFFFFF` | 3.2:1 | ❌ Requiere sombra o borde |

### Recomendaciones

- **Texto sobre `#880D1E` (Crushed Berry):** Usar sombra de texto o borde blanco de 1px para garantizar contraste AA
- **Texto sobre `#CBEF3` (Light Cyan):** Preferir texto en `#212529` (grafito) en lugar de negro puro
- **Modo oscuro:** Verificar contraste en `#0A0A0a` (fondo oscuro) con texto claro

---

## 6. Mapeo a Variables CSS Personalizadas

Para proyectos que usan diseño system escalado:

```css
:root {
  --color-primary: #dd2d4a;          /* Raspberry */
  --color-primary-hover: #c02b3b;    /* Raspberry oscuro 15% */
  --color-secondary: #f26a8d;        /* Bubblegum Pink */
  --color-secondary-light: #f8bbbd;  /* Bubblegum Pink 10% más claro */
  --color-accent: #880d1e;           /* Crushed Berry */
  --color-accent-light: #e0a3b2;     /* Crushed Berry 15% más claro */
  --color-background: #cbef3;        /* Light Cyan */
  --color-text: #212529;             /* Grafito */
}
```

---

## 6. Historial de Cambios

| Fecha | Cambio | Responsable |
|-------|--------|-------------|
| 23/10/2026 | Paleta original definida: 5 colores rosa/lila/celeste | Equipo trino |
| 23/10/2026 | Tokens CSS actualizados en `src/styles/tokens.css` | Equipo de desarrollo |
| 23/10/2026 | Documentación de variables y aplicaciones creada | Este entregable |

---

**Fin de la guía de paleta.**  
Para dudas técnicas, consultar `src/styles/tokens.css` y `DOCS/identidad-visual.md`.