# Reporte trino. — Producto · Marketing · Estilo

> Fecha: 2026-09-12 · Proyecto: santisima-trinidad (marca **trino.**) · Estado: UNVERIFIED
> Alcance: síntesis de producto, marketing y estilo alineada al briefing completo (AGENT CONSTITUTION v3.1 + Plan Tienda + Plan Backoffice + Plan Cuenta + marca.md + bahaus y neo bahaus.md). Nada borrado, cero modificaciones de código. Documento de referencia, no spec delta.

---

## 0. Ficha de marca (fuente única de verdad de identidad)

| Elemento | Definición |
|---|---|
| Nombre oficial | **trino.** (siempre minúscula, con punto final) |
| Rubro | Productos esotéricos multi-creencia (tarot, velas, inciensos, cristales, amuletos, altares, aceites, libros) |
| Redes | @holatrino (IG / TikTok) |
| Email | holatrino@gmail.com |
| Dominio futuro | trino.com.ar |
| Estilo visual | Neo-Bauhaus: geometría pura, color blocking, formas orgánicas simples (arcos, círculos) |
| Voz de marca | Minúscula siempre, cálida, cercana, nunca dogmática ni new-age genérica |

### Paleta (Design Tokens — heredar, nunca inventar colores nuevos)
- `--bg-blanco` #FFFFFF — fondo principal
- `--bg-crema` #FDFBF7 — fondo secundario
- `--text-grafito` #212529 — reemplaza al negro puro en todo el sitio
- `--color-terracota` #D95D39 — CTAs, botones de compra
- `--color-verde` #2B4731 — botones secundarios, naturaleza/ritual
- `--color-mostaza` #E6AF2E — badges, alertas, descuentos
- `--color-celeste` #7A9E9F — decorativo, arcos, formas orgánicas

### Tipografía
- `--font-chunky` (Poppins/Clash Display/Montserrat) — títulos en minúscula, peso 900
- `--font-lectura` (Inter/Roboto/Lato) — texto de lectura

---

## 1. Producto

### 1.1 Estructura de categorías (triple entrada, filtros combinables — no tres menús)
1. **Por tipo de producto** (catálogo): Tarot y oráculos · Velas · Inciensos y resinas · Cristales y piedras · Amuletos y talismanes · Aceites y esencias · Altares y elementos rituales · Libros y guías · Joyería simbólica · Sets de regalo.
2. **Por tradición/creencia** (filtro transversal, no excluyente): Tarot y astrología · Wicca y paganismo · Budismo · Santería y religiones afro · Feng Shui · Cristaloterapia · Chamanismo · Misticismo cristiano popular · Espiritualidad general.
3. **Por intención** (el filtro más usado en la práctica): amor · protección · abundancia · limpieza energética · sueño y descanso · conexión espiritual · duelo y sanación.

Resolución práctica: filtros combinables en buscador y listado (PLP), el usuario entra por la entrada que le resulte más natural.

### 1.2 Curaduría respetuosa multi-creencia (crítico, no opcional)
- Ninguna tradición se presenta como superior a otra en copy, descripción o blog — tono descriptivo y respetuoso.
- Ficha de producto con **contexto de origen** cultural/religioso real (no solo "úsalo para la abundancia") — evita apropiación vacía.
- Reconocimiento de proveedores artesanales (resinas, tejidos, figuras) al menos con una línea en la ficha.
- **Disclaimers** en lecturas de tarot / sanación energética: no reemplazan diagnóstico o tratamiento médico/psicológico (requisito legal en varios países).
- Moderación de reseñas con el mismo criterio: evitar que se vuelvan debates religiosos.

### 1.3 Funcionalidades específicas del rubro
- **Sets/kits curados por ocasión** con lógica propia de armado ("kit de protección", "primer altar"), no como un producto más.
- **Suscripción "caja ritual mensual"** (opcional, evaluar demanda) — envío recurrente curado por luna/temporada.
- **Empaque como experiencia:** "envoltorio ritual" o nota personalizada en checkout — el unboxing es parte del producto.
- **Restricciones de envío por producto:** inciensos/resinas y velas (materiales combustibles) → reglas de envío especiales marcables desde catálogo, impacta módulo de Envíos del backoffice.
- **Devoluciones por categoría:** productos rituales usados (velas encendidas, inciensos abiertos) no se devuelven — política específica, no una única general.
- **Nota "uso responsable"** en productos que combinan con fuego (seguridad del cliente).

### 1.4 Conexión con el plan general (lo ya definido que aplica directo)
- PDP con "cómo se usa" (cargar un cristal, armar un altar) — reduce dudas que hoy se resuelven por WhatsApp.
- Verificación de identidad progresiva en cuenta; ficha completa con especificaciones, variantes, pago y calculadora de envío por CP.
- Precios mayorista/minorista como listas por tipo de cliente (impacta catálogo del backoffice).

---

## 2. Marketing

### 2.1 Contenido educativo como canal de adquisición real (no fase 3)
- **Glosario / mini-enciclopedia** de términos del rubro — captura tráfico informativo ("qué significa la carta de la torre", "para qué sirve el cuarzo rosa"), nadie del nicho lo captura hoy con buen diseño.
- **Calendario ritual/lunar** (fase lunar actual, próximos eclipses, equinoccios) como bloque editorial en home o sección propia — razón orgánica para volver, sin notificación invasiva.
- **Quiz de bienvenida "elegí tu camino"** (3-4 preguntas: ¿buscás protección, claridad, abundancia?) que recomienda categorías/productos — mejor que dejar al usuario perdido ante 8 tradiciones.
- **SEO de contenido orgánico** es probablemente el canal de tráfico más grande disponible para la marca → contemplado desde el inicio, no al final.

### 2.2 Canales y prueba social
- **Instagram/TikTok ya activo (@holatrino):** feed embebido o casos de uso reales en home (el rubro se apoya fuerte en contenido visual).
- Prueba social liviana: reseñas destacadas, insignias de confianza (envío gratis desde $X, devolución en N días), sin saturar.
- Captación de email NO con pop-up a los 3 segundos: banner discreto en footer u oferta real ("10% off primera compra") mostrada una sola vez.

### 2.3 Notificaciones no invasivas (coherentes con la marca)
- Aviso **opcional** (el usuario activa, no llega por default) tipo "hoy es luna llena" + productos relacionados.
- Centro de notificaciones en cuenta + preferencias de comunicación por canal (email/WhatsApp/ambos/ninguno), separadas de las transaccionales (operativas, no desactivables).

### 2.4 Motor on-site (backoffice)
- Campañas de descuento con fecha inicio/fin y alcance (catálogo/categoría/productos).
- Cupones (uso único/múltiple, por cliente, monto mínimo).
- Reportes de rendimiento (conversión, ingresos atribuidos).
- Carritos abandonados con recuperación por email/WhatsApp vía n8n (un clic desde CRM Vista 360°).
- Segmentación básica: recurrentes, en riesgo de churn, alto valor.

### 2.5 Abandono de carrito y ciclo (conectado a automatizaciones)
- Trigger/cron identifica carritos sin modificar >4h → evento asíncrono a n8n/Resend (nunca sincrónico en el request).
- Estado del carrito en DB desde el primer producto agregado (no solo localStorage), merge de carrito anónimo al loguear sin duplicar SKU.

---

## 3. Estilo (Neo-Bauhaus aplicado a la tienda)

### 3.1 Principio rector
"La forma sigue a la función" = UX moderna. La Bauhaus nació del misticismo (Kandinsky, Itten: colores que vibran en el alma, rituales de purificación). trino. rescata esa etapa: geometría y espíritu como una sola cosa. Trasladó a "Geometría y Espíritu" (sección "Nuestra Propuesta"): lo esotérico asociado al exceso y al caos es lo opuesto a esta marca — la verdadera espiritualidad aporta claridad.

### 3.2 Reglas de composición por pantalla
- **Home:** hero con figura (vela, mazo de tarot) sobre forma geométrica (arco de medio punto en mostaza o celeste), no fotos rectangulares. Cada bloque de categoría con forma geométrica propia de fondo (círculo, arco, media luna). RESUELTA (owner 2026-09-14, ORN-178): hero geométrico confirmado; título gigante "TRINO" + carrousel horizontal queda RECHAZADO por el CEO (marcado en marca.md §2). Implementado en `feat/hero-geometrico-home`.
- **PLP:** foto vertical (3:4 o 4:5), bordes redondeados, fondo con color blocking — los 4 colores de acento rotando por categoría (ritmo visual sin caos). Badges de oferta SIEMPRE mostaza + grafito, minúscula ("30% off.", "nuevo."), nunca rojo/verde genérico.
- **Botones:** píldora (`border-radius: 50px`), minúscula, negrita gruesa. Terracota = acción principal ("agregar al carrito."), verde = secundaria ("ver más.", "guardar.").
- **Íconos y formas decorativas:** arcos y círculos como recurso recurrente (separadores, marcos de imagen, fondos de banner) — es lo que hace reconocible al Neo-Bauhaus frente al new-age genérico con degradés y estrellas.

### 3.3 Voz y copy (reglas firmes)
- Todo texto de interfaz en minúscula (títulos, botones, badges) — convención técnica: `text-transform: lowercase` a nivel de componente, no escribir manualmente cada texto.
- Copy en segunda persona ("tu ritual", "elegí tu carta"), cálido, nunca venta agresiva ("¡última oportunidad!").
- Nombres de producto simples y descriptivos, sin adjetivos místicos densos ("energía ancestral cósmica").

### 3.4 Compatibilidad con la CONSTITUTION (reglas de estilo ya vinculantes)
Las reglas de estilo del briefing persisten y aplican sobre la identidad trino. sin conflicto:
- UX-01 mobile-first, zonas de pulgar, CTA sticky en tercio inferior, target touch 44×44.
- UX-02 microinteracciones 4 estados; UX-03 optimistic updates; UX-04 zero ghost clicks.
- UX-06 progressive disclosure, modales ≤1 paso/5 campos, focus trap + backdrop-blur + close outside.
- UX-07 espaciado múltiplos de 4/8, un solo botón primario por pantalla.
- UX-08 tipografía fluida (`clamp()`), UX-09 WCAG 2.2 AA, a11y por teclado.
- CQ-09 skeletons con geometría exacta y colores de la paleta (no gris genérico).
- I18N-02 cero strings literales (`t('ns.key')`), ICU plural; I18N-03 Intl.NumberFormat para moneda.

### 3.5 Diseño como diferencial
La marca apunta a un e-commerce esotérico que hoy NADIE resuelve con buen diseño: limpio, geométrico, curado, móvil-first y performante (gama baja + 3G). Ese vacío de "buen diseño en el nicho" es justamente la propuesta de valor visual de trino.

---

## 4. Pendientes / decisiones abiertas para el dueño

1. Categorías finales de lanzamiento: 3-4 tradiciones bien curadas (no nueve genéricas).
2. RESUELTA (2026-09-14, ORN-178): hero con figura geométrica GANA — título gigante + carrousel rechazado por el CEO. Implementado en `feat/hero-geometrico-home` (arco de medio punto mostaza/celeste + categorías con círculo/arco/media luna).
3. Política de devoluciones por tipo de producto (usado vs. sin abrir) antes de habilitar checkout.
4. Contenido educativo (glosario, calendario lunar) en MVP o fase 2 — recomendado en MVP por el peso SEO.
5. Certificación de origen de piedras (minería ética) como diferencial futuro; mientras tanto, no prometer lo que no se sostiene.
6. Flujo de aprobación de cuentas mayoristas (bandeja en backoffice, no automático).

---

## 5. Estado y trazabilidad

- **Estado:** UNVERIFIED — síntesis de referencia del briefing, sin cambios de código ni de spec.
- **Fuentes leídas (briefing completo):** AGENT CONSTITUTION.MD (v3.1, 154 reglas/43 secciones), Plan Tienda 2026, Plan Backoffice 2026, Plan Cuenta 2026, marca.md, bahaus y neo bahaus.md.
- **Nada borrado, cero notificaciones.**
- Engram: `topic_key trino/producto`.