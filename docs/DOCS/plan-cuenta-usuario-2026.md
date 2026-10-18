# Plan Funcional: Panel de Usuario Registrado (Mi Cuenta) 2026

> Documento de referencia para el área de cuenta del cliente final. Complementa el "Plan Backoffice E-commerce 2026" y el "Plan Tienda E-commerce 2026". Pensado para que un modelo de IA o un equipo de desarrollo lo tome como punto de partida del plan de acción.

---

## 0. Resumen ejecutivo

"Mi Cuenta" es el espacio donde el cliente vuelve una y otra vez — tiene que sentirse **liviano, personal y útil**, nunca como un formulario burocrático. Tres principios rectores, en línea con el resto del sistema:

1. **Misma filosofía de navegación que el resto del sitio (drill-down, mobile-first, zona del pulgar):** Mi Cuenta no es una pantalla aparte con otras reglas de diseño, es una extensión natural de la tienda.
2. **Invita a seguir comprando sin ser invasivo:** recomendaciones y accesos rápidos a comprar de nuevo, pero nunca banners intrusivos ni pop-ups dentro del propio panel de cuenta — el usuario ya está ahí por una razón puntual (ver un pedido, cambiar un dato), no hay que interrumpirlo.
3. **La seguridad es visible, no solo interna:** el cliente tiene que poder ver y controlar sus propios datos (sesiones activas, tarjetas guardadas, historial) — la confianza en un e-commerce se construye en gran parte acá.

---

## 1. Estructura de navegación

Mismo patrón que el backoffice: menú principal con categorías amplias, cada una lleva a su subpantalla (drill-down tipo "Configuración de iOS"), no un dashboard sobrecargado de entrada.

- **Resumen (Home de la cuenta):** saludo personalizado, acceso directo a "tu último pedido" / "pedido en camino", accesos rápidos a Pedidos, Favoritos, Direcciones, Datos personales.
- **Mis Pedidos** (compras anteriores y en curso).
- **Mi Perfil** (datos personales, foto, tipo de cuenta minorista/mayorista).
- **Seguridad** (contraseña, email, sesiones activas, verificación en dos pasos).
- **Direcciones guardadas**.
- **Métodos de pago guardados**.
- **Favoritos**.
- **Notificaciones y preferencias de comunicación**.
- **Ayuda / Contacto**.
- **Cerrar sesión / Eliminar cuenta** (al final, nunca como acción prominente).

En mobile, este menú vive en el mismo cajón/menú compacto ya definido para el resto del sitio (esquina superior derecha), no un menú nuevo con otra lógica.

---

## 2. Mi Perfil

- **Datos personales editables:** nombre, apellido, teléfono, fecha de nacimiento (opcional), género (opcional) — todo editable en línea (inline) o vía slide-over, con guardado inmediato y confirmación visual, sin recargar la página.
- **Foto de perfil:** subida desde galería o cámara, con recorte simple antes de guardar (mismo motor de compresión de imágenes que ya está previsto del lado admin — reutilizar, no duplicar lógica).
- **Perfil Minorista / Mayorista:**
  - El usuario puede solicitar cuenta mayorista desde acá (formulario simple: CUIT/RFC/RUT según el país, razón social, rubro).
  - La solicitud queda pendiente de aprobación del dueño (visible en su propio panel de cuenta como "En revisión").
  - Una vez aprobado, la cuenta mayorista puede tener: precios diferenciados, cantidades mínimas de compra por producto, y catálogo o categorías exclusivas — esto conecta directo con el módulo de Catálogo del backoffice, que debería soportar listas de precios por tipo de cliente.
- **Idioma y moneda preferidos** (si la tienda opera en más de un país), guardado como preferencia de la cuenta, no solo de la sesión del navegador.

---

## 3. Seguridad de la cuenta

- **Cambio de contraseña:** siempre pidiendo la contraseña actual primero, con indicador de fortaleza de la nueva, y notificación por email al cliente avisando que su contraseña cambió (aunque haya sido él mismo) — es un estándar de seguridad esperado.
- **Cambio de email:** requiere confirmación en el email nuevo antes de aplicarse, y aviso en el email viejo por si no fue el usuario quien lo pidió.
- **Verificación en dos pasos (2FA) opcional para el cliente**, obligatoria más adelante si se detecta actividad sospechosa (login desde ubicación nueva, por ejemplo).
- **Sesiones activas / dispositivos conectados:** lista de dónde está iniciada la sesión (navegador, aproximado de ubicación, última actividad) con opción de "Cerrar sesión en todos los dispositivos" — clave si el cliente compró desde un cyber o celular prestado.
- **Historial de accesos recientes** (fecha, dispositivo) — transparencia que genera confianza sin ser técnicamente complejo de mostrar.

---

## 4. Pedidos (anteriores y en curso)

- **Lista de pedidos** con estado visual claro (mismo lenguaje de estados que usa el dueño en el backoffice: Pendiente, Pagado, En Proceso, Enviado, Entregado, Cancelado — nunca dos nomenclaturas distintas entre admin y cliente).
- **Seguimiento del envío dentro del propio pedido:** mapa o timeline simple del estado logístico, conectado a la misma info que ve el dueño (zonas/CP, transportista), sin que el cliente tenga que escribir por WhatsApp para preguntar "¿dónde está mi pedido?".
- **Detalle de cada pedido:** productos comprados (con foto, para reconocerlos rápido), precio pagado, método de pago usado (enmascarado), dirección de envío, comprobante descargable en PDF.
- **Acciones desde el pedido:**
  - "Volver a comprar" (repite el mismo carrito con un clic) — es la forma no invasiva de "invitar a seguir comprando": aparece solo en el contexto de un pedido ya entregado, no como banner suelto.
  - "Solicitar devolución/cambio" sobre un pedido entregado — conecta con el punto de RMA que ya quedó anotado como pendiente del lado backoffice.
  - "Contactar por este pedido" — abre el canal de contacto (WhatsApp/chat) con el contexto del pedido ya cargado, para no tener que explicar todo de cero.

---

## 5. Direcciones guardadas

- Múltiples direcciones (casa, trabajo, etc.), con una marcada como predeterminada.
- Autocompletado de dirección (Google Places API o similar) para reducir errores de tipeo que después generan problemas de envío.
- Edición y eliminación simple, con confirmación solo al eliminar (modal), nunca al editar.

---

## 6. Métodos de pago guardados

- **Agregar tarjeta:** el número completo nunca toca el servidor propio — se tokeniza directo con la pasarela de pago (Stripe/MercadoPago), el sistema solo guarda un token y los últimos 4 dígitos + marca de la tarjeta para mostrar ("Visa terminada en 4242").
- **Marcar tarjeta predeterminada**, eliminar tarjetas guardadas.
- **Aviso de vencimiento próximo** de la tarjeta guardada (opcional, evita fallos de pago en compras recurrentes o suscripciones si el rubro las tiene).

---

## 7. Favoritos

- Lista de productos guardados, con indicador si bajó de precio o se quedó sin stock desde que se agregó — es lo que convierte un simple "guardado" en una razón real para volver a la tienda, sin ser invasivo (el aviso vive dentro de la sección, no como notificación push agresiva).
- Botón directo "Agregar al carrito" desde la propia lista de favoritos.

---

## 8. Notificaciones y preferencias de comunicación

- **Centro de notificaciones dentro de la cuenta:** estado de pedidos, respuestas a preguntas hechas sobre productos, aviso de reposición de stock de un favorito — todo centralizado, no solo por email/WhatsApp.
- **Preferencias de comunicación editables por canal:** el cliente elige si quiere recibir novedades/ofertas por email, WhatsApp, ambos o ninguno — separado de las notificaciones transaccionales (confirmación de compra, cambio de estado de envío), que no se pueden desactivar del todo porque son operativas, no de marketing.
- Esto es lo que hace que la comunicación se sienta invitante y no invasiva: el cliente decide el volumen y el canal, no el sistema.

---

## 9. Ayuda / Contacto

- Acceso directo al mismo canal de contacto no invasivo ya definido en el sitio (WhatsApp/chat), pero con el historial de conversación o al menos el contexto de cuenta ya cargado.
- **FAQ contextual** dentro de la propia sección de Pedidos (ej. "¿Cómo cambio un producto?" al lado de un pedido entregado) en vez de mandar siempre a una página de FAQ genérica.

---

## 10. Cosas que probablemente te falten (y conviene sumar ahora)

Estos puntos no estaban en tu pedido original y suelen notarse recién cuando el volumen de usuarios registrados crece:

1. **Eliminar cuenta / exportar mis datos:** por buenas prácticas de privacidad (y obligatorio en varios países), el usuario debería poder pedir la baja de su cuenta y/o descargar sus datos personales. Puede ser un flujo simple (solicitud → confirmación por email → procesamiento manual al principio), no hace falta automatizarlo del todo desde el día uno, pero sí que exista la opción visible.
2. **Diferenciación real de precios mayorista vs. minorista a nivel de catálogo:** no alcanza con "marcar" la cuenta como mayorista si el catálogo no soporta listas de precios distintas por tipo de cliente y cantidades mínimas — esto es una definición que también impacta el backoffice (sección Catálogo).
3. **Aprobación de cuentas mayoristas desde el backoffice:** el dueño necesita una bandeja donde ver y aprobar/rechazar solicitudes de cuenta mayorista, no puede ser automático sin revisión (riesgo de que cualquiera se autoasigne precios mayoristas).
4. **Referidos / "invitá a un amigo" (opcional):** si el negocio lo permite, es una forma de crecimiento orgánico y encaja bien como sección de cuenta, no como pop-up.
5. **Historial de facturación/comprobantes descargables en un solo lugar**, no solo dentro de cada pedido individual — útil sobre todo para cuentas mayoristas que necesitan varios comprobantes para su propia contabilidad.
6. **Verificación de identidad progresiva:** no pedir todo de entrada al registrarse (fricción innecesaria), pero sí pedir verificación de teléfono o email antes de la primera compra, y datos fiscales completos recién cuando se solicita cuenta mayorista.
7. **Estado "cuenta inactiva/suspendida"** con mensaje claro si el dueño necesita bloquear una cuenta (ej. fraude, disputa de pago) — hoy solo estaba previsto el bloqueo de empleados en el backoffice, no de clientes.
8. **Accesibilidad también acá:** los mismos criterios de contraste, navegación por teclado y textos alternativos definidos para la tienda pública aplican dentro de la cuenta — es una sección que suele quedar afuera de las revisiones de accesibilidad por error.
9. **Rendimiento igual de exigente que el resto del sitio:** la sección de cuenta muchas veces se deja "para después" en performance porque "solo la ve el que ya compró", pero es justamente el usuario recurrente de mayor valor — no puede sentirse más pesada que el resto de la tienda.
10. **Consistencia de estados entre admin y cliente:** ya se mencionó en Pedidos, pero vale remarcarlo como principio general — cualquier dato que el cliente vea en su cuenta (estado de pedido, stock de un favorito, precio) tiene que ser exactamente el mismo dato en tiempo real que maneja el dueño en el backoffice, nunca una copia desincronizada.

---

## 11. Guía técnica de referencia (stack sugerido)

| Aspecto | Patrón / Tecnología sugerida |
|---|---|
| Autenticación y sesión | Reutilizar el mismo proveedor de auth de la tienda (NextAuth/Auth.js) |
| Foto de perfil | Presigned URL + Edge Function de compresión (misma que backoffice) |
| Tarjetas guardadas | Tokenización vía Stripe/MercadoPago — nunca PAN completo en servidor propio |
| Direcciones | Autocompletado con Google Places API o similar |
| Seguimiento de pedido | Misma fuente de datos que el módulo de Envíos del backoffice, en tiempo real |
| Notificaciones dentro de la cuenta | Supabase Realtime (mismo motor que las notificaciones del admin) |
| Precios mayorista/minorista | Tablas de precios por tipo de cliente en el modelo de datos de Catálogo |
| 2FA | TOTP estándar (Google Authenticator/Authy) o código por email/SMS |
| Exportar/eliminar datos | Flujo de solicitud con confirmación por email, procesamiento asistido inicialmente |

---

## 12. Próximos pasos sugeridos

1. Definir el modelo de datos de "tipo de cliente" (minorista/mayorista) y cómo impacta precios y mínimos de compra en el Catálogo del backoffice — es la pieza que más conecta ambos sistemas.
2. Priorizar el MVP de cuenta: Perfil + Seguridad básica (cambio de contraseña/email) + Pedidos con seguimiento + Direcciones + Favoritos. Mayorista, referidos y 2FA pueden ir en una segunda fase.
3. Definir junto con el dueño el flujo de aprobación de cuentas mayoristas antes de habilitar el formulario de solicitud en la cuenta del cliente.
4. Validar que el estado de un pedido se vea idéntico y en tiempo real tanto en el backoffice como en la cuenta del cliente antes de dar por cerrado el módulo de Pedidos.