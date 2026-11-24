# Stitch to TRINO Conversion Guide

## Objective
Convert Google Stitch-generated HTML admin screens to work with the TRINO stack (Next.js 16 App Router + Tailwind CSS) while preserving the aesthetic design, color palette, spacing, and component patterns.

## Key Conversion Patterns

### 1. HTML Structure → Next.js Component
**Stitch HTML:**
```html
<div class="p-space-lg flex flex-col gap-space-lg max-w-[1440px] mx-auto w-full">
  <!-- Sections -->
  <section class="bg-surface-container-lowest p-space-lg border-2 border-primary shadow-[4px_4px_0px_#17141B] flex flex-col gap-space-md">
    ...
  </section>
</div>
```

**TRINO Next.js Component:**
```tsx
// components/admin/SettingsPage.tsx
import { cn } from "@/lib/utils";

export const SettingsPage = () => {
  return (
    <div class="p-space-lg flex flex-col gap-space-lg max-w-[1440px] mx-auto w-full">
      {/* Sections maintained with same classes */}
      <section class="bg-surface-container-lowest p-space-lg border-2 border-primary shadow-[4px_4px_0px_#17141B] flex flex-col gap-space-md">
        ...
      </section>
    </div>
  );
};
```

### 2. Tailwind CSS Preservation
The Stitch files use Tailwind v3 with custom theme extension. TRINO maintains the same design tokens:

**Color palette preserved:**
- `surface-container-lowest`: `#ffffff`
- `primary`: `#000000` 
- `secondary`: `#625e52`
- `tertiary`: `#000000`
- `on-primary`: `#ffffff`
- `on-secondary`: `#ffffff`
- `surface`: `#fef7ff`
- `surface-container`: `#f3ebf6`
- `error`: `#ba1a1a`
- `primary-fixed`: `#e8e0ea`

**Spacing system preserved:**
- `space-sm`: `0.5rem`
- `space-md`: `1rem`
- `space-lg`: `1.5rem`
- `space-xl`: `2.5rem`
- `margin-mobile`: `1rem`

**Typography preserved:**
- `font-family`: Plus Jakarta Sans (headlines), Rubik (labels), or reverse
- `font-size`: headline-lg: `3rem`, body-md: `1rem`
- `font-weight`: 400-900 range
- `tracking`: uppercase, wider, tracking-tight

### 3. Material Symbols Outlined Icons
**Stitch:**
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<span class="material-symbols-outlined text-[18px]">save</span>
```

**TRINO Conversion:**
Keep the same CDN link or install locally. The icon class names work identically.

```tsx
<!-- Can use directly from CDN -->
<span className="material-symbols-outlined text-[18px]">save</span>
<!-- Or import if configured -->
<MaterialIconsOutlined className="text-[18px]">save</MaterialIconsOutlined>
```

### 4. Google Fonts Import
**Stitch imports:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
```

**TRINO Next.js:**
Keep the same CDN imports in `_app.js` or `layout.tsx`, or install the fonts locally:

```tsx
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'TRINO Admin',
  description: 'Panel de Administración TRINO',
};

// Fonts are loaded via CDN in globals.css or head component
```

### 5. Image Sources Adaptation
**Stitch uses Google-hosted images:**
```html
<img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHIy33yf9VLffmZ2-ygasqniibIDPJBvIJSyn_FNcyambLo4a4sIcv14UD6z54jTDbLCSDKIZ_uvbbIlUhNcTr69a9SsSXKSbJkjRFFnoR2uTmBlmB7An3YcdNuQA3Cqvw-pew35CxJaOGln4X6YHpO1ipxbvPxoMG87cucY7QJevMn82JbbirrwgtoI5Un1jg2QHIyW1KbyBtrjzLuG7H5IpsLCV3MdlwhfIMxbbt"/>
```

**TRINO adaptation:**
Replace with placeholder or relative images, or keep the Google URLs if the images are still accessible:

```tsx
// Option 1: Placeholder with same dimensions
<img 
  className="w-full h-24 object-cover rounded-lg"
  alt="Producto de cosmética"
  src="/placeholder-producto.jpg"
// />

// Option 2: Keep Google URLs if accessible
<img 
  className="w-full h-24 object-cover rounded-lg" 
  src="https://lh3.googleusercontent.com/..."
  alt="Descripción del producto"
// />
```

### 6. JavaScript Event Handlers
**Stitch inline JS:**
```html
<script>
  document.getElementById('btn-save')?.addEventListener('click', function() {
    // ... interaction logic
  });
</script>
```

**TRINO Next.js with React:**
Convert to React event handlers, or keep vanilla JS if not using React state:

```tsx
// React approach
import { useState } from 'react';

export const SaveButton = () => {
  const handleClick = () => {
    // ... logic
  };
  
  return (
    <button 
      onClick={handleClick}
      className="px-space-lg py-3 bg-primary text-on-primary border-2 border-primary font-label-lg text-label-lg hover:bg-secondary-container transition-all flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">save</span>
      <span>GUARDAR CAMBIOS</span>
    </button>
  );
};
```

### 7. Component Pattern Mapping

**Stitch → TRINO Component Conversion Table:**

| Stitch Pattern | TRINO Equivalent |
|---------------|------------------|
| `<section class="bg-surface-container-lowest p-space-lg border-2 border-primary shadow-[4px_4px_0px_#17141B]">` | Same classes, works in Next.js |
| `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">` | Same Tailwind grid, responsive |
| `<div class="flex flex-col gap-space-md">` | Same flex layout |
| `<button class="px-space-lg py-3 bg-primary text-on-primary...">` | Same button styles |
| `<span class="material-symbols-outlined text-[18px]">icono</span>` | Same icons |
| `id="btn-element"` + `addEventListener` | React onClick or keep JS |

### 8. Shell-Type Meta Tags
**Stitch:**
```html
<meta content="web_dashboard" name="shell-type"/>
```

**TRINO Next.js:**
Not needed - use Next.js metadata instead:
```tsx
export const metadata = {
  title: 'TRINO - Panel Admin',
  description: 'Panel de administración del sistema TRINO',
};
```

## Conversion Priority

### High Priority (already working classes):
- Tailwind color classes (bg-primary, text-on-primary, etc.)
- Grid and flex layouts
- Rounded corners (rounded-lg, rounded-full, full)
- Shadows (shadow-[4px_4px_0px_#17141B])
- Material Symbols icons
- Spacing classes (p-space-lg, gap-space-md, etc.)

### Medium Priority (adapt as needed):
- JavaScript event handlers → React events or keep vanilla
- Google font imports → CDN or local
- Image sources → placeholder or relative paths
- Shell meta tags → Next.js metadata

### Low Priority (optional):
- Custom Tailwind config extensions (if needed for TRINO brand)
- Additional component wrappers

## Example Conversion: Orders Dashboard

**Before (Stitch HTML snippet):**
```html
<!-- 4. ZONA PRINCIPAL DIVIDIDA: MESA DE ÓRDENES (65%) & PANEL INSPECCIÓN EN VIVO (35%) -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
  <!-- LADO IZQUIERDO: TABLA OPERATIVA DE PEDIDOS (8 Columnas en 12) -->
  <section class="xl:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border-2 border-primary shadow-[5px_5px_0px_#1d1a21] overflow-hidden">
    <!-- Tabla de Despacho -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="bg-surface-container border-b-2 border-primary font-label-md text-label-md uppercase tracking-wider text-primary">
            <th class="py-3 px-3 w-10 text-center">...</th>
            <th class="py-3 px-3">Pedido & Tiempo</th>
            ...
          </tr>
        </thead>
        <tbody class="divide-y-2 divide-primary/10 font-body-sm text-body-sm">
          <tr class="hover:bg-surface-container transition-colors cursor-pointer">
            <td class="py-3.5 px-3 text-center">...</td>
            <td class="py-3.5 px-3">#TR-8942</td>
            ...
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <!-- LADO DERECHO: PANEL DE INSPECCIÓN -->
  <aside class="xl:col-span-4 flex flex-col bg-surface-container-lowest rounded-xl border-2 border-primary shadow-[5px_5px_0px_#1d1a21] overflow-hidden sticky top-24">
    ...
  </aside>
</div>
```

**After (TRINO Next.js Component):**
```tsx
// components/admin/OrdersDashboard.tsx
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const OrdersDashboard = () => {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-12 gap-6 items-start ${inter.className}`}>
      {/* LADO IZQUIERDO: TABLA OPERATIVA */}
      <section className="xl:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border-2 border-primary shadow-[5px_5px_0px_#1d1a21] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container border-b-2 border-primary font-label-md text-label-md uppercase tracking-wider text-primary">
                <th className="py-3 px-3 w-10 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded-none border-2 border-primary accent-primary cursor-pointer" />
                </th>
                <th className="py-3 px-3">Pedido & Tiempo</th>
                <th className="py-3 px-4">Socia / Cliente</th>
                <th className="py-3 px-4">Productos & Unidades</th>
                <th className="py-3 px-3 text-right">Total & Pago</th>
                <th className="py-3 px-3">Método Envío</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-primary/10 font-body-sm text-body-sm">
              {/* Filas de tabla - mapeadas desde datos */}
            </tbody>
          </table>
        </div>
      </section>

      {/* LADO DERECHO: PANEL DE INSPECCIÓN */}
      <aside className="xl:col-span-4 flex flex-col bg-surface-container-lowest rounded-xl border-2 border-primary shadow-[5px_5px_0px_#1d1a21] overflow-hidden sticky top-24">
        <div className="p-space-md bg-secondary-fixed border-b-2 border-primary flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-black text-primary">Orden #TR-8942</h2>
            <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-md text-[10px] font-black uppercase tracking-wider border border-primary shrink-0">URGENTE</span>
          </div>
          <button className="w-8 h-8 rounded border-2 border-primary bg-surface-container hover:bg-surface-container-highest transition-colors flex items-center justify-center" title="Expandir Panel">
            <span className="material-symbols-outlined text-[18px]">open_in_full</span>
          </button>
          <button className="w-8 h-8 rounded border-2 border-primary bg-surface-container hover:bg-surface-container-highest transition-colors flex items-center justify-center" title="Cerrar Panel">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {/* Panel content... */}
      </aside>
    </div>
  );
};
```

## Conversion Checklist

- [ ] Preserve all Tailwind CSS classes exactly as they are (they're already TRINO-compatible)
- [ ] Keep Material Symbols Outlined CDN imports
- [ ] Keep Plus Jakarta Sans & Rubik font imports (or install locally)
- [ ] Adapt Google image sources to local placeholders or keep URLs
- [ ] Convert inline JavaScript to React event handlers OR keep as-is
- [ ] Add Next.js metadata (title, description) in layout.tsx
- [ ] Wrap in proper Next.js component structure
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Verify dark mode compatibility (the files have `darkMode: "class"`)

## Next Steps

1. **Choose which screens to convert first** - I recommend starting with:
   - `trino._beauty_ajustes_del_administrador` (Settings)
   - `trino._beauty_gesti_n_de_pedidos_y_despachos` (Orders/Deliveries)
   - `modal_ingreso_manual_de_remito_orden` (Mobile remito entry)

2. **Create a component per screen** - Following the pattern above

3. **Consolidate shared components** - Header, sidebar, buttons, modals

4. **Set up TRINO design tokens** - Ensure colors/spacings match the brand

5. **Test and iterate** - Verify aesthetics are preserved across breakpoints

Would you like me to convert a specific screen from the folder to the TRINO Next.js format? I can start with the admin settings screen or the orders dashboard, which seem to be the most critical admin screens.