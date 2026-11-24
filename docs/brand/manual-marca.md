# Plan de implementación — Manual digital de marca “trino.”

## 1. Objetivo y alcance

Construir desde cero una experiencia web editorial, responsive e interactiva que funcione como el manual integral de marca de **trino.**, una tienda de maquillaje, skincare e insumos de belleza. La identidad debe sentirse Gen Z, atrevida, alegre, accesible y social-first, tomando de las referencias su lenguaje pop de bloques de color, dameros, rayas, formas orgánicas y tipografía redondeada de alto peso, sin copiar composiciones ni marcas ajenas.

La entrega será una aplicación estática en React/Vite, sin backend, e incluirá:

- Manual navegable de 9 secciones.
- Evolución coherente del wordmark actual “trino.”, no una sustitución total.
- Sistema visual completo: estrategia, logo, color, tipografía, patrones, voz, movimiento y aplicaciones.
- Controles interactivos que demuestren el sistema de marca.
- Descargas reales de logos SVG y tokens de marca.
- Versión imprimible desde el navegador.

No se construirá e-commerce, CMS, autenticación ni persistencia. El contenido será editorial fijo y estará escrito en español.

## 2. Decisiones de marca

### Posicionamiento

- Público principal: consumidoras Gen Z interesadas en belleza y cultura digital.
- Público secundario: maquilladoras, manicuristas, lashistas y otras profesionales que compran insumos.
- Propuesta: hacer que descubrir, probar y comprar belleza se sienta simple, expresivo y divertido.
- Personalidad: cómplice, espontánea, curiosa, optimista y segura; nunca infantil, elitista ni excesivamente técnica.
- Concepto rector: **“Belleza que hace ruido.”**
- Frase de apoyo: **“Todo para crear tu versión más vos.”**

Estos textos se presentarán como fundamentos del sistema, no como afirmaciones comerciales verificables.

### Evolución del logo

Crear un wordmark geométrico propio basado en la referencia existente:

- Mantener el nombre en minúsculas y el punto final como rasgo distintivo.
- Conservar formas redondeadas y monolineales, pero corregir proporciones, ritmo, espaciado y legibilidad.
- Dar al punto final un rol de “chispa” o señal activa dentro del sistema.
- Construir el logo como SVG con geometría estable, no como texto dependiente de una fuente, para que la vista y las descargas sean idénticas.
- Preparar variantes: principal horizontal, monocroma, reversa y símbolo compacto derivado de la `t` + punto.
- Definir área de seguridad usando el diámetro del punto como unidad `x`, tamaño mínimo y usos incorrectos.

## 3. Dirección visual

### Paleta propuesta

Definir los tokens en CSS y reutilizarlos en toda la interfaz:

- Ink — `#17141B`: texto y versión monocroma.
- Cream — `#FFF8E8`: base cálida.
- Pop Pink — `#FF75AE`: color protagonista.
- Tangerine — `#FF5A36`: energía y llamados destacados.
- Lilac — `#A98AF5`: fondos editoriales.
- Aqua — `#21BFA6`: contraste fresco.
- Lemon — `#FFD84A`: acento y señalización.
- Cobalt — `#3155F5`: contraste digital.

Usar combinaciones con contraste legible; reservar los pares de contraste insuficiente para elementos decorativos grandes, nunca para texto funcional.

### Tipografía

- Display/logo companion: **Fredoka**, pública de Google Fonts, por su estructura redondeada, chunky y limpia cercana al espíritu de Arista.
- Texto/UI: **DM Sans**, pública de Google Fonts, por legibilidad y contraste editorial.
- Importar ambas al inicio de `src/index.css`.
- Jerarquía expresiva: titulares fluidos muy grandes, subtítulos compactos en mayúsculas y cuerpo legible.

### Patrones y formas

Construirlos con CSS/SVG para evitar depender de imágenes externas:

- Damas de dos colores.
- Rayas anchas verticales y diagonales.
- Ondas orgánicas.
- Puntos sobredimensionados.
- Marcos y bloques con esquinas redondeadas.

Combinar como máximo dos patrones por composición y mantener zonas de descanso en Cream. Los mockups de packaging y social se resolverán con HTML/CSS/SVG estilizado para que todo el sistema sea original, nítido y responsive.

### Movimiento

- Entrada editorial sutil para títulos y bloques.
- Marquee lento en la portada.
- Cambios de color/patrón con transiciones breves.
- Microinteracciones de botones con desplazamiento y sombra, no escalado excesivo.
- Respetar `prefers-reduced-motion` desactivando animaciones no esenciales.

## 4. Arquitectura de la experiencia

### Shell global

- Header fijo con wordmark, indicador de sección, botón de descarga y menú móvil.
- Navegación lateral o índice compacto en desktop; drawer accesible en mobile.
- Barra de progreso de lectura.
- Secciones con `id` y navegación por anclas con scroll suave.
- Footer con recordatorio de versión del manual y acceso a descargas/impresión.

### Sección 01 — Portada / manifiesto

- Hero de pantalla completa con wordmark protagonista.
- Titular “Belleza que hace ruido.”
- Frase de apoyo y CTA “Explorar el universo”.
- Fondo editorial con damero, formas móviles y marquee de categorías: maquillaje, skincare, uñas, pestañas, herramientas.
- Introducción corta al propósito del manual.

### Sección 02 — Esencia de marca

- Propósito, promesa, visión y audiencia.
- Cinco atributos de personalidad en tarjetas.
- Bloque “somos / no somos” para fijar límites de tono.
- Visual tipo mapa de energía que conecte “accesible”, “experta” y “atrevida”.

### Sección 03 — Sistema de logo

- Presentación del logo principal y breve explicación del refinamiento.
- Selector de fondo para probar versiones color, ink y reversa.
- Variantes principal, monocroma y símbolo.
- Demostración de área de seguridad con unidad `x`.
- Tamaños mínimos desktop/mobile.
- Cuadrícula de usos correctos e incorrectos con ejemplos visuales claros.

### Sección 04 — Universo cromático

- Fichas grandes de los ocho colores con nombre, HEX y rol.
- Botón para copiar cada HEX con confirmación accesible.
- Combinaciones recomendadas de fondo/texto.
- Ejemplo interactivo que cambia la combinación de un mini packaging.

### Sección 05 — Tipografía

- Muestra de Fredoka y DM Sans con roles y pesos.
- Escala tipográfica responsive.
- Frases de marca y alfabeto de muestra.
- Reglas de uso: titulares cortos, tracking, mayúsculas y longitudes de línea.

### Sección 06 — Formas, patrones y movimiento

- Galería de damero, rayas, ondas y puntos.
- “Pattern mixer” con controles limitados para elegir patrón y dupla cromática.
- Reglas de densidad, combinación y espacio negativo.
- Demostración animada del punto como elemento de movimiento.

### Sección 07 — Voz trino.

- Principios: directa, cómplice, expresiva y útil.
- Comparador “sí suena a trino. / no suena a trino.”.
- Selector de contexto con ejemplos para social, producto, promoción y ayuda.
- Lineamientos de puntuación, emojis y lenguaje inclusivo: usar energía verbal sin saturar; el punto del logo no obliga a cerrar cada frase con punto.
- Microcopys ejemplo, como “Lo nuevo ya hizo ruido”, “Tu rutina, tus reglas” y “Sumalo a tu mood”.

### Sección 08 — Aplicaciones

- Mockups propios de caja/envío, etiqueta de producto, tarjeta, post/story social y bolsa.
- Cambio de aplicación mediante tabs accesibles.
- Mostrar cómo la misma identidad se adapta entre consumidoras y profesionales sin perder unidad.
- No usar fotografías de terceros; el foco será la aplicación del sistema gráfico.

### Sección 09 — Kit de marca

- Lista clara de recursos disponibles.
- Descarga individual de:
  - `trino-logo-primary.svg`
  - `trino-logo-ink.svg`
  - `trino-logo-reverse.svg`
  - `trino-symbol.svg`
  - `trino-tokens.css`
  - `trino-tokens.json`
- Botón “Imprimir / Guardar como PDF” que invoque `window.print()`.
- Nota breve sobre cuándo usar cada archivo.

## 5. Interacciones y flujo de datos

- Mantener el contenido de estrategia, paleta, tipografía, navegación y ejemplos en un módulo de datos tipado para evitar duplicación.
- Estado local de React únicamente para menú móvil, variante de logo, color seleccionado, pattern mixer, tabs de aplicaciones y mensajes de copiado.
- Usar `IntersectionObserver` para marcar la sección activa y calcular el progreso sin escuchar scroll de forma costosa.
- Copiar HEX mediante `navigator.clipboard`; si falla, seleccionar/copiar con un fallback basado en un elemento temporal y mostrar un mensaje de estado.
- Generar las descargas con `Blob`, `URL.createObjectURL` y un enlace temporal. Revocar el URL luego de iniciar la descarga.
- Mantener los SVG fuente como strings o funciones compartidas con los componentes visuales para que los archivos descargados coincidan con lo mostrado.
- No almacenar preferencias ni enviar datos a servicios externos.

## 6. Estructura de archivos prevista

- `src/App.tsx`: composición principal de la experiencia y secciones.
- `src/index.css`: imports de fuentes, tokens, estilos base en `@layer base`, utilidades/patrones propios, animaciones y reglas de impresión.
- `src/components/BrandLogo.tsx`: variantes SVG del wordmark y símbolo.
- `src/components/SiteHeader.tsx`: navegación, progreso y menú mobile.
- `src/components/SectionIntro.tsx`: encabezado editorial reutilizable.
- `src/components/PatternSwatch.tsx`: patrones y mixer.
- `src/components/ApplicationMockups.tsx`: mockups y tabs.
- `src/components/DownloadPanel.tsx`: recursos descargables e impresión.
- `src/data/brand.ts`: contenido y tokens tipados.
- `src/lib/downloads.ts`: creación y descarga de SVG/CSS/JSON.

La división podrá compactarse si algún componente resulta trivial, pero no se concentrará toda la implementación en un único archivo monolítico.

## 7. Responsive, accesibilidad e impresión

- Diseñar mobile-first con puntos de adaptación aproximados en 768 px y 1200 px.
- En mobile, apilar composiciones, conservar titulares legibles y convertir la navegación en drawer.
- Permitir que los patrones recorten decorativamente sin provocar overflow horizontal.
- Usar HTML semántico (`header`, `nav`, `main`, `section`, `footer`) y un solo `h1`.
- Añadir labels, `aria-expanded`, estados de foco visibles y navegación completa por teclado.
- Tabs con semántica y comportamiento de teclado adecuados; botones reales para todas las acciones.
- Mensajes de copiado mediante región `aria-live`.
- Respetar `prefers-reduced-motion`.
- Para impresión:
  - Ocultar navegación, controles interactivos, CTAs y elementos puramente decorativos.
  - Expandir todos los contenidos que normalmente estén en tabs.
  - Forzar fondos y colores con `print-color-adjust: exact`.
  - Evitar cortes dentro de fichas, logos y mockups.
  - Iniciar las secciones principales en páginas nuevas cuando sea razonable.
  - Incluir portada, numeración visual de secciones y URLs/nombres de recursos, sin depender de la interacción.

## 8. Metadatos y pulido

- Actualizar el título, idioma y descripción del sitio a “trino. — Manual de marca”.
- Conservar el favicon existente salvo que se pueda reemplazar de forma coherente por un símbolo original de trino. sin introducir un formato incompatible.
- Evitar iconos improvisados o emojis en la interfaz; usar SVG simples para menú, copiar, descargar e imprimir.
- Mantener bordes, radios, sombras y ritmos de espaciado coherentes con el lenguaje pop editorial.

## 9. Verificación

1. Ejecutar el formateador definido por el repositorio con `pnpm format`.
2. Ejecutar `pnpm build` y corregir cualquier error de TypeScript/Vite.
3. Revisar en la vista ya servida por Figma Make:
   - Desktop ancho, tablet y mobile estrecho.
   - Navegación por anclas, sección activa y progreso.
   - Menú mobile y bloqueo/cierre correcto.
   - Selector de logo, copiadores, pattern mixer y tabs.
   - Cada descarga: nombre, tipo MIME y contenido válido.
   - Vista previa de impresión: contenido completo, colores, saltos y ausencia de controles.
   - Navegación por teclado y foco visible.
   - Modo de movimiento reducido.
   - Ausencia de overflow horizontal y texto ilegible.
4. Confirmar que no haya placeholders, botones desconectados, assets rotos ni contenido en inglés residual.

## 10. Criterios de aceptación

- La primera pantalla comunica inmediatamente “trino.” y su personalidad Gen Z atrevida.
- El manual se siente como una pieza editorial diseñada, no como una colección de tarjetas genéricas.
- El logo refinado mantiene reconocimiento respecto a la referencia y funciona en todas sus variantes.
- Las nueve secciones explican un sistema de marca consistente y utilizable.
- Los controles alteran realmente el contenido visual asociado.
- Todos los archivos prometidos se descargan y el manual puede imprimirse/guardarse como PDF.
- La experiencia es usable en mobile, teclado y movimiento reducido.
- El proyecto formatea y compila sin errores.
