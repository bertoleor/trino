# Plan Funcional y de Experiencia: Tienda E-commerce 2026 (Lado Cliente)

> Documento de referencia para el frontend público de la tienda (storefront). Complementa el "Plan Backoffice E-commerce 2026". Pensado para que un modelo de IA o un equipo de desarrollo lo tome como punto de partida del plan de acción.

---

## 0. Resumen ejecutivo

El objetivo es una tienda que se sienta **premium y liviana a la vez**: con la fluidez visual de Shein/Temu (grillas de producto, carruseles, ofertas visibles) pero sin la sobrecarga tediosa de Mercado Libre, y sin verse "hecha con IA" — o sea, con criterio de diseño de un senior, tipografía cuidada, espaciados consistentes y micro-animaciones discretas, no genéricas de librería sin ajustar.

Tres principios rectores:

1. **Mobile-first con prioridad al pulgar (thumb zone):** las acciones más frecuentes (carrito, buscar, cuenta, filtros) viven en la mitad inferior de la pantalla o en zonas fácilmente alcanzables con el pulgar, no arriba de todo.
2. **Rendimiento como feature, no como detalle técnico:** la tienda debe sentirse instantánea en un celular de gama baja con red 3G/4G inestable. Esto condiciona decisiones de diseño (formato de imagen, cantidad de animaciones, qué carga de entrada y qué carga después).
3. **Fricción cero para comprar, fricción normal para registrarse:** se puede armar el carrito y comprar sin cuenta (checkout como invitado). El registro se reserva para lo que realmente lo necesita — favoritos, historial de pedidos, checkout más rápido la próxima vez.

---

## 1. Filosofía de Header y Footer

- **Header en desktop:** logo, buscador prominente, categorías principales, ícono de cuenta, ícono de favoritos, ícono de carrito con contador. Sticky (se mantiene visible al scrollear).
- **Header en mobile:** se oculta automáticamente al deslizar hacia abajo (para dar más espacio a la pantalla) y reaparece al deslizar hacia arriba. Queda un **menú compacto en la esquina superior derecha** (hamburguesa o ícono de perfil) siempre accesible, más el ícono de carrito.
- **Barra de búsqueda:** accesible con un toque desde cualquier pantalla, no escondida a dos o tres clics.
- **Footer:** información institucional (Quiénes Somos, Contacto, Políticas, Términos), medios de pago aceptados (logos), redes sociales, selector de idioma/moneda si aplica, newsletter (opcional, no invasivo — ver sección de contacto).

---

## 2. Página de Inicio (Home)

- **Hero/carrusel principal:** 2-4 slides máximo, con ofertas o colecciones destacadas — no un carrusel infinito de 10 banners que nadie ve completo.
- **Bloques de categorías útiles:** navegación visual por categoría (ícono/foto + nombre), pensada para que el usuario llegue a lo que busca en 1-2 toques, no como una lista de texto plano.
- **Carruseles temáticos que invitan a seguir navegando:** "Más vendidos", "Ofertas de la semana", "Recién llegados", "Recomendados para vos" (si hay historial) — cada uno con scroll horizontal táctil fluido, no paginado.
- **Prueba social liviana:** reseñas destacadas, cantidad de compras, insignias de confianza (envío gratis desde $X, devolución en N días) — sin saturar.
- **Fin de la home siempre invita a seguir comprando:** nunca debe sentirse "cerrada", el último bloque lleva a más categorías o al catálogo completo.

---

## 3. Listado de Productos (PLP) y Categorías

- **Grilla de producto tipo Shein/Temu, pero curada:**
  - Foto del producto **no cuadrada** — proporción vertical (ej. 3:4 o 4:5), con **bordes ligeramente redondeados** (no completamente rectos ni excesivamente ovalados).
  - Debajo de la foto: título corto (1-2 líneas, truncado con elipsis si es más largo), precio (y precio tachado si hay oferta + badge de % de descuento).
  - Ícono de favorito superpuesto en la esquina de la foto, accesible con un toque, sin abrir el producto.
  - Indicador sutil de stock bajo ("Últimas unidades") solo cuando es relevante, no siempre.
- **Filtros y ordenamiento sin fricción:** un botón fijo de "Filtrar/Ordenar" en la zona del pulgar (parte inferior en mobile) que abre un slide-over o bottom-sheet, no una página nueva. Filtros útiles reales: precio, talle, color, categoría, disponibilidad — no filtros decorativos que no se usan.
- **Carga progresiva (infinite scroll o "cargar más"):** nunca un spinner largo bloqueando toda la pantalla; se usan skeleton loaders con la forma de la grilla mientras carga.
- **Breadcrumbs** (Inicio > Categoría > Subcategoría) para que el usuario sepa dónde está y pueda volver un nivel sin usar el botón "atrás" del navegador.

---

## 4. Página de Producto (PDP)

Todo lo que pediste, más lo estándar de una ficha de producto completa:

- **Galería de fotos** con zoom táctil (pinch-to-zoom) y swipe entre imágenes; miniaturas debajo o al costado en desktop.
- **Título, precio, precio tachado si hay oferta, cantidad de reseñas y rating** (si aplica) arriba de todo.
- **Selector de variantes** (talle, color) con feedback visual claro de cuál está seleccionada y cuáles no tienen stock.
- **Botón "Agregar al carrito" fijo en la zona del pulgar** en mobile (sticky al final de la pantalla), no algo que se pierde al scrollear la descripción.
- **Descripción del producto** con formato legible (no un bloque de texto plano — subtítulos, viñetas si aplica).
- **Especificaciones técnicas** en tabla o lista clara (medidas, materiales, peso, etc.).
- **Métodos de pago aceptados**, visibles con sus logos (tarjetas, transferencia, billeteras virtuales), y si hay cuotas, mostrarlas.
- **Calculadora de envío por Código Postal** directamente en la ficha, sin tener que ir al carrito para saber cuánto cuesta o cuánto tarda.
- **Reseñas y preguntas de otros compradores** (con fotos si el sistema lo permite) — es uno de los mayores factores de conversión y hoy no estaba contemplado.
- **Productos relacionados / "También te puede interesar"** al final de la página, para no cortar el recorrido de compra.
- **Política de devolución visible** (aunque sea un resumen corto con link a la página completa) — reduce la ansiedad de compra.

---

## 5. Carrito y Checkout

- **Carrito accesible sin registrarse:** se guarda en el dispositivo (o vía sesión anónima) y persiste aunque el usuario cierre y vuelva a abrir la tienda.
- **Favoritos requieren cuenta:** tiene sentido, porque es algo que el usuario espera encontrar en futuras visitas desde cualquier dispositivo.
- **Checkout como invitado siempre disponible**, con opción de crear cuenta al final (no al principio) para no interrumpir la compra.
- **Checkout en pasos claros y cortos:** datos de envío → método de envío (con costo y tiempo estimado ya calculado) → método de pago → confirmación. Barra de progreso visible.
- **Resumen del pedido siempre visible** (sticky) durante todo el checkout, para que el usuario nunca pierda de vista qué está pagando.
- **Validación en tiempo real de los campos** (no esperar a enviar el formulario para descubrir un error).

---

## 6. Cuenta de Usuario y Autenticación

- **Registro/login social:** Google, Email, Facebook (como pediste) — minimizando fricción, con la posibilidad de completar datos faltantes (teléfono, dirección) después, no todo de entrada.
- **Perfil del cliente:** historial de pedidos con estado y seguimiento, direcciones guardadas, métodos de pago guardados (tokenizados, nunca el número completo), favoritos.
- **Recuperación de contraseña simple** y verificación de email no invasiva (no bloquear la navegación hasta verificar).

---

## 7. Contacto y Comunicación (sin ser invasivo)

- **Botón de contacto discreto pero accesible** (WhatsApp/chat) — flotante, pequeño, en una esquina, que no tape contenido ni aparezca con un pop-up automático a los 3 segundos de entrar (esa práctica es la que se quiere evitar).
- **Sin pop-ups de newsletter apenas se entra al sitio.** Si se quiere captar emails, mejor un banner discreto en el footer o una oferta real a cambio (ej. "10% off en tu primera compra") mostrada una sola vez, con opción de cerrar y no volver a insistir en la misma sesión.
- **Página de contacto/FAQ clara**, con las preguntas frecuentes reales (envíos, cambios, medios de pago) para reducir la necesidad de escribir por WhatsApp para todo.

---

## 8. Búsqueda Intuitiva

- **Autocompletado con sugerencias** mientras el usuario escribe (productos, categorías), no solo texto plano.
- **Tolerancia a errores de tipeo** (búsqueda difusa/fuzzy) — si el usuario escribe "zapatilas" tiene que encontrar "zapatillas".
- **Historial de búsquedas recientes** y búsquedas populares sugeridas cuando el campo está vacío.
- **Resultados con los mismos filtros que el listado de categoría** (precio, talle, disponibilidad).

---

## 9. Rendimiento (crítico en gama baja)

- **Mobile-first real, no solo responsive:** el diseño se piensa primero para pantallas chicas y conexiones lentas, y se expande a desktop — no al revés.
- **Imágenes optimizadas automáticamente:** formato moderno (WebP/AVIF), tamaños servidos según el dispositivo (`srcset`), lazy loading de todo lo que está fuera de la pantalla inicial.
- **Animaciones livianas y con propósito:** transiciones cortas (150-250ms), sin animaciones decorativas que consuman batería o traben en un procesador de gama baja. "Elegante y simple" significa menos movimiento, no más.
- **Carga crítica mínima:** lo que se ve primero (above the fold) carga primero; el resto (carruseles secundarios, footer, chat) puede cargar después sin que el usuario lo note.
- **Presupuesto de performance definido de entrada** (ej. Lighthouse Performance Score objetivo, tiempo a interactivo objetivo en 3G) — no algo que se mide recién al final del proyecto.

---

## 10. Cosas que probablemente te falten (y conviene sumar ahora)

Estos puntos no estaban en tu lista original y suelen notarse recién cuando la tienda ya está en producción y algo falla o un cliente se queja:

1. **SEO técnico real:** meta tags dinámicos por producto/categoría (ya contemplado del lado admin), datos estructurados (JSON-LD de producto ya previsto), sitemap.xml y robots.txt generados automáticamente, URLs limpias y estables.
2. **Accesibilidad (a11y):** contraste de colores adecuado, navegación por teclado, textos alternativos en imágenes, tamaños de texto legibles — además de ser buena práctica, mejora el SEO y evita quedar afuera de parte de los usuarios.
3. **Página de error 404 y estados vacíos diseñados:** "no hay resultados para tu búsqueda", "tu carrito está vacío" — con sugerencias de qué hacer, no una pantalla en blanco.
4. **Página/módulo de seguimiento de pedido** para el cliente sin necesidad de escribir por WhatsApp — muestra el estado igual que ve el dueño en el backoffice, pero en versión simplificada.
5. **Transparencia de costos antes del pago final:** el costo de envío y cualquier impuesto debe verse ANTES del último paso del checkout, nunca como sorpresa — es una de las principales causas de abandono de carrito.
6. **Indicador de "en camino" / "confirmado" inmediato tras la compra**, más el email/WhatsApp de confirmación automático (esto ya conecta con el hub de automatizaciones de n8n del lado admin).
7. **Multi-moneda / multi-idioma reales**, no solo un selector decorativo: precios, textos y hasta métodos de pago pueden cambiar según el país si se vende a más de un mercado (conecta con la arquitectura White-Label del backoffice).
8. **Seguridad del lado del cliente:**
   - HTTPS y cabeceras de seguridad (CSP, HSTS) desde el día uno.
   - Anti-bot en formularios de contacto, newsletter y creación de cuenta (captcha invisible, no uno molesto que interrumpa).
   - Nunca guardar datos sensibles de tarjeta en el propio servidor — todo tokenizado a través de la pasarela de pago (Stripe/MercadoPago).
   - Rate limiting en login para evitar fuerza bruta.
9. **PWA también del lado tienda (opcional pero recomendable):** "Agregar a pantalla de inicio" para que el comprador recurrente tenga la tienda como un ícono más, sin ser una app nativa completa.
10. **Analítica de comportamiento:** Google Analytics 4 / Meta Pixel (ya previsto en el CMS del admin) + idealmente un mapa de calor (Hotjar o similar) para detectar en qué parte del embudo se cae la conversión.
11. **Política de cookies / consentimiento**, sobre todo si se vende a más de un país — conecta con el punto de privacidad ya anotado del lado admin.
12. **Modo oscuro (opcional):** cada vez más esperado en sitios "modernos", pero no crítico — se puede dejar para una segunda fase.
13. **Comparador de productos o guía de talles**, según el rubro — si se vende indumentaria/calzado, una guía de talles interactiva reduce muchísimo las devoluciones.
14. **Página "Sin resultados de stock" con aviso de reposición:** el cliente puede dejar su email para que le avisen cuando el producto vuelva a tener stock, en vez de perder la venta directamente.

---

## 11. Guía técnica de referencia (stack sugerido)

| Aspecto | Patrón / Tecnología sugerida |
|---|---|
| Imágenes optimizadas | `next/image` (o equivalente) con WebP/AVIF, `srcset`, lazy loading |
| Carruseles táctiles | Librería liviana con scroll nativo (evitar librerías pesadas de JS) |
| Búsqueda con autocompletado | Algolia / Meilisearch / Typesense (búsqueda difusa incluida) |
| Autenticación social | NextAuth / Auth.js (Google, Facebook, Email) |
| Carrito sin registro | Sesión anónima persistida en cookie/local storage server-synced |
| Checkout | Pasos con validación en tiempo real, resumen sticky |
| Calculadora de envío por CP | Conectada a la misma lógica de zonas del backoffice (PostGIS/CP) |
| SEO técnico | Meta tags dinámicos, JSON-LD, sitemap.xml, robots.txt automáticos |
| Analítica | GA4 + Meta Pixel vía `next/third-parties`, mapa de calor opcional |
| Seguridad | HTTPS, CSP/HSTS, captcha invisible, tokenización de pagos, rate limiting |
| PWA cliente | Manifest + Service Worker para "agregar a inicio" |

---

## 12. Próximos pasos sugeridos

1. Definir el/los rubros piloto (indumentaria, electrónica, general) porque condiciona decisiones de diseño (guía de talles, variantes, tipo de galería de fotos).
2. Priorizar el MVP de tienda: Home + PLP + PDP + Carrito + Checkout invitado + Búsqueda básica + Cuenta con login social. El resto (mapa de calor, modo oscuro, comparador) puede ir en fases posteriores.
3. Definir el presupuesto de performance objetivo (ej. Lighthouse ≥ 90 en mobile) como criterio de aceptación antes de sumar cualquier feature visual nueva.
4. Validar el flujo completo de compra (desde home hasta confirmación) en un celular de gama baja real, no solo en el emulador del navegador, antes de dar por cerrada cada etapa.