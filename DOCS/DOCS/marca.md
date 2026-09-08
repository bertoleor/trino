# trino. — Plan de Marca y Experiencia de Tienda (Rubro Esotérico)

> Documento que aplica la identidad de marca de **trino.** a la estructura de tienda ya definida en "Plan Tienda E-commerce 2026" y "Plan Panel de Usuario 2026". No los reemplaza: los especializa para el rubro de productos esotéricos multi-creencia (tarot, velas, inciensos, cristales, amuletos, altares, aceites, libros, etc.).

---

## 1. Identidad de marca (resumen de referencia)

| Elemento | Definición |
|---|---|
| Nombre oficial | **trino.** (siempre minúscula, con punto final) |
| Redes sociales | @holatrino (IG / TikTok) |
| Email | holatrino@gmail.com |
| Dominio futuro | trino.com.ar |
| Estilo visual | Neo-Bauhaus: geometría pura, color blocking, formas orgánicas simples (arcos, círculos) |
| Voz de marca | Minúscula siempre, cálida, cercana, nunca dogmática ni new-age genérica |

**Paleta:**
- `--bg-blanco` #FFFFFF — fondo principal
- `--bg-crema` #FDFBF7 — fondo secundario
- `--text-grafito` #212529 — reemplaza al negro puro en todo el sitio
- `--color-terracota` #D95D39 — CTAs, botones de compra
- `--color-verde` #2B4731 — botones secundarios, textos vinculados a naturaleza/ritual
- `--color-mostaza` #E6AF2E — badges, alertas, descuentos
- `--color-celeste` #7A9E9F — decorativo, arcos, formas orgánicas

**Tipografía:** `--font-chunky` (Poppins/Clash Display/Montserrat) para títulos en minúscula, peso 900; `--font-lectura` (Inter/Roboto/Lato) para texto de lectura.

**Componentes ya definidos:** botón píldora (`border-radius: 50px`), badges circulares o rectángulo redondeado en mostaza, imágenes de figuras (yeso, objetos rituales) recortadas sin fondo y montadas sobre formas geométricas (arco superior en mostaza, círculo en celeste, etc.).

Este bloque de CSS ya provisto se toma como fuente única de verdad para el diseño — cualquier componente nuevo que se agregue (filtros, tarjetas de producto, formularios) debe heredar estas variables, nunca definir colores nuevos por fuera de la paleta.

---

## 2. Cómo se traduce el Neo-Bauhaus a cada pantalla

El estilo no es solo "colores lindos" — es un sistema de composición. Aplicado a la tienda definida en el documento general:

- **Home:** el hero no usa fotos rectangulares comunes — usa el mismo tratamiento de "figura sobre forma geométrica" definido en el brief (ej. una vela o un mazo de tarot flotando sobre un arco de medio punto en mostaza o celeste). Cada bloque de categoría en la home puede tener su propia forma geométrica de fondo (círculo, arco, media luna) como identificador visual, no solo un ícono plano. - NO ME CONVENCE CEO QUE EL HOME VA A TENER EL TITULO EN GANDE "TRINO" Y UN CARROUSEL HORIZONTAL.
- **Grilla de producto (PLP):** la foto no cuadrada ya definida en el plan general (proporción vertical, bordes redondeados) se combina acá con el color blocking — el fondo detrás del producto recortado usa uno de los 4 colores de acento (terracota, verde, mostaza, celeste) rotando según categoría, para que el catálogo tenga ritmo visual sin caos.
- **Badges de oferta:** siempre mostaza + grafito, círculo o rectángulo redondeado, texto en minúscula ("30% off.", "nuevo.", "últimas unidades.") — nunca rojo/verde genérico de e-commerce tradicional, rompería la identidad.
- **Botones:** siempre píldora, siempre minúscula, negrita gruesa. Terracota para la acción principal ("agregar al carrito."), verde para acciones secundarias ("ver más.", "guardar.").
- **Íconos y formas decorativas:** arcos y círculos como recurso recurrente (separadores de sección, marcos de imagen, fondos de banner) — es el elemento que hace reconocible al Neo-Bauhaus por sobre un e-commerce esotérico genérico (que suele caer en estética "new age" con degradés y estrellas).

---

## 3. Estructura de categorías específica del rubro

A diferencia de un e-commerce genérico, acá la categorización por "tipo de producto" no alcanza — el usuario esotérico navega por **intención** y por **tradición/creencia** al mismo tiempo. Se recomienda una estructura doble:

**Por tipo de producto** (la clásica, necesaria para el catálogo):
Tarot y oráculos · Velas · Inciensos y resinas · Cristales y piedras · Amuletos y talismanes · Aceites y esencias · Altares y elementos rituales · Libros y guías · Joyería simbólica · Sets de regalo.

**Por tradición/creencia** (filtro transversal, no categoría excluyente — un mismo producto puede pertenecer a varias):
Tarot y astrología · Wicca y paganismo · Budismo · Santería y religiones afro · Feng Shui · Cristaloterapia · Chamanismo · Misticismo cristiano popular · Espiritualidad general/sin tradición específica.

**Por intención** (el filtro más usado en la práctica, ideal para búsqueda y home): amor · protección · abundancia · limpieza energética · sueño y descanso · conexión espiritual · duelo y sanación.

Esta triple entrada (producto / tradición / intención) conviene resolverla como **filtros combinables en el buscador y el listado**, no como tres menús separados que confunden — el usuario entra por la que le resulte más natural.

---

## 4. Curaduría respetuosa multi-creencia (crítico en este rubro)

Vender productos de religiones y creencias distintas bajo una misma marca requiere cuidado explícito, no solo buen gusto:

- **Ninguna tradición se presenta como "superior" o "más verdadera" que otra** en el copy del sitio — ni en descripciones de producto ni en contenido de blog. El tono es descriptivo y respetuoso, no promocional de una creencia sobre otra.
- **Ficha de producto con contexto de origen:** cada producto vinculado a una tradición específica (ej. un elemento de santería, una figura budista) debería tener una breve reseña de su origen cultural/religioso real, no solo "úsalo para la abundancia" — evita la sensación de apropiación vacía y educa al comprador.
- **Fuentes/proveedores:** si hay productos artesanales vinculados a comunidades o prácticas específicas (ej. resinas, tejidos, figuras religiosas), vale la pena tener un espacio (aunque sea una línea en la ficha) que reconozca el origen — refuerza la autenticidad de la marca y evita quedar como "genérico de bazar esotérico".
- **Disclaimers donde corresponda:** productos vinculados a lecturas de tarot, sanación energética o similares deben incluir una nota breve y no alarmista de que no reemplazan diagnóstico o tratamiento médico/psicológico — buena práctica y en algunos países un requisito legal para este tipo de comercio.
- **Moderación de reseñas con este mismo criterio:** si se habilitan reseñas (recomendado, ver plan de tienda general), la moderación debe cuidar que no se conviertan en debates religiosos en el espacio de comentarios de un producto.

---

## 5. Contenido educativo integrado (además de vender)

En este rubro, el contenido no es "extra" — es lo que genera confianza y traducción de intención de compra en la mayoría de los clientes nuevos que no conocen bien el producto:

- **Ficha de producto con "cómo se usa":** más allá de la descripción/especificaciones ya definidas en el plan general, acá conviene un bloque específico de modo de uso (ej. cómo cargar un cristal, cómo armar un altar simple) — reduce dudas que hoy probablemente se resuelven por WhatsApp uno a uno.
- **Glosario o mini-enciclopedia** (sección de contenido, no bloqueante para comprar) con términos del rubro — también ayuda mucho al SEO orgánico, que en este nicho suele tener búsquedas de tipo "qué significa la carta de la torre" o "para qué sirve el cuarzo rosa", tráfico valioso que hoy probablemente no está capturando nadie del rubro con buen diseño.
- **Calendario ritual/lunar** (fase de luna actual, próximo eclipse, equinoccios) como bloque editorial en la home o en una sección propia — encaja perfecto con el público de la marca y da una razón orgánica para volver al sitio sin ser una notificación invasiva.
- **Quiz de bienvenida opcional ("elegí tu camino"):** para usuarios nuevos que no saben por dónde arrancar, un mini-cuestionario de 3-4 preguntas (¿qué buscás: protección, claridad, abundancia...?) que recomienda categorías/productos — mejor que dejarlos perdidos frente a 8 tradiciones distintas sin guía.

---

## 6. Funcionalidades específicas del rubro a sumar al plan general de tienda

- **Sets/kits de regalo curados por ocasión** (ej. "kit de protección para el hogar", "primer altar") — ya contemplado como categoría en la sección 3, pero conviene que tengan su propia lógica de armado en el catálogo, no ser simplemente "un producto más".
- **Suscripción tipo "caja ritual mensual"** (opcional, evaluar demanda): envío recurrente curado según luna/temporada — encaja con la lógica de fidelización sin ser un programa de puntos genérico.
- **Empaque como parte de la experiencia:** opción de "envoltorio ritual" o nota personalizada en el checkout — el unboxing es parte del producto en este rubro, vale la pena que el checkout lo contemple como opción, no como after-thought.
- **Restricciones de envío para ciertos productos:** inciensos/resinas y velas pueden tener restricciones de transporte según el courier (materiales combustibles) — esto impacta directo en el módulo de Envíos del backoffice: conviene poder marcar productos con reglas de envío especiales desde el catálogo.
- **Notificaciones no invasivas ligadas al calendario propio de la marca:** por ejemplo, un aviso opcional (que el usuario activa, no que llega por default) de "hoy es luna llena" con productos relacionados — coherente con el principio de "invita a comprar sin ser invasivo" ya definido en el plan de tienda general, pero acá tiene un gancho de contenido genuino en vez de ser una oferta pura.

---

## 7. Tono de voz y copy — reglas de aplicación

- Todo texto de interfaz en minúscula, incluidos títulos, botones y badges — es una regla de marca, no un detalle estético menor, así que conviene que quede como convención técnica (ej. aplicar `text-transform: lowercase` a nivel de componente, tal como ya está en el CSS provisto, en vez de escribir cada texto en minúscula manualmente y arriesgarse a inconsistencias).
- Copy cercano y cálido, en segunda persona ("tu ritual", "elegí tu carta"), nunca en tono de venta agresiva ("¡última oportunidad!", "¡no te lo pierdas!") — desentona con el resto de la identidad calma y curada de la marca.
- Nombres de producto simples y descriptivos, sin sobrecargar de adjetivos místicos genéricos — la estética Neo-Bauhaus (limpia, geométrica) pide un copy igual de limpio, no un texto denso de "energía ancestral cósmica".

---

## 8. Cosas que probablemente falten (específicas de este rubro, no cubiertas en el plan general)

1. **Verificación de edad/consentimiento no aplica por ley en general para este rubro**, pero sí conviene una nota clara de "uso responsable" en productos que combinan con fuego (velas, inciensos) — más por seguridad del cliente que por normativa.
2. **Política de devoluciones adaptada:** productos rituales usados (velas encendidas, inciensos abiertos) probablemente no puedan devolverse por higiene/seguridad — esto necesita una política de devolución específica por categoría, no una única política general para todo el catálogo (conecta con el punto de RMA ya anotado en el plan backoffice).
3. **Certificación de origen de piedras/cristales:** cada vez más compradores del rubro preguntan por minería ética — si en algún momento se puede certificar el origen de las piedras, es un diferencial fuerte de marca; si no, al menos no prometer algo que no se puede sostener.
4. **Multi-idioma con cuidado de traducción cultural, no solo literal:** si en el futuro se vende fuera de Argentina, los nombres de tradiciones y prácticas cambian de connotación según el país — no es una traducción automática directa.
5. **SEO de contenido como canal de adquisición real**, no solo de producto: dado el volumen de búsqueda informativa que tiene este rubro (significados, usos, rituales), vale la pena que el blog/glosario esté contemplado desde el inicio del proyecto y no como fase 3 — es probablemente el canal de tráfico orgánico más grande disponible para esta marca.
6. **Espacio de marca en redes ya activo (@holatrino):** conviene que el sitio tenga integración simple de contenido de Instagram/TikTok (feed embebido o casos de uso reales) en la home — el rubro se apoya mucho en contenido visual de redes, y ya hay una audiencia empezada ahí.

---

## 9. Próximos pasos sugeridos

1. Definir la lista final de categorías de producto y de tradiciones/creencias a cubrir en el lanzamiento — no hace falta cubrir las nueve tradiciones de entrada, mejor lanzar con 3-4 bien curadas que con nueve genéricas.
2. Aplicar la paleta y el CSS ya definidos como Design Tokens del proyecto (ver "Guía técnica de referencia" del plan de tienda general) desde el primer componente que se construya, no como un ajuste visual al final.
3. Definir con el dueño de la marca la política de devoluciones por tipo de producto (usado vs. sin abrir) antes de habilitar el checkout.
4. Decidir si el contenido educativo (glosario, calendario lunar) entra en el MVP o en una segunda fase — dado el peso que tiene en SEO orgánico para este rubro, se recomienda no dejarlo para el final.