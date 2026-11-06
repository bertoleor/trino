# Casos de Uso - Flujo de Checkout (Trino)

## UC-001: Ver carrito
**Actores:** Usuario visitante o registrado, Sistema  
**Precondiciones:** Usuario ha agregado al menos un producto al carrito.  
**Flujo Principal:**
1. Usuario hace clic en el ícono del carrito (en el header) o en "Ver carrito" tras agregar un producto.
2. Sistema muestra una página o modal con los items del carrito: producto, cantidad, precio unitario, subtotal.
3. Sistema muestra el total de items y el total a pagar (incluyendo impuestos y envío si aplica).
4. Usuario puede modificar la cantidad de un item o eliminar un item.
5. Tras modificar, sistema actualiza subtotales y total.
6. Usuario procede a checkout.

**Flujos Alternativos:**
- A1: Si el carrito está vacío, se muestra mensaje "Tu carrito está vacío" y un botón para continuar comprando.
- A2: Si el usuario intenta modificar cantidad a cero, se elimina el item.
- A3: Si el stock de un producto cambió, se muestra advertencia y se ajusta la cantidad máxima disponible.

**Postcondiciones:** Usuario tiene revisado su carrito y está listo para ingresar datos de envío.

## UC-002: Ingresar datos de envío
**Actores:** Usuario, Sistema  
**Precondiciones:** Usuario está en la página de checkout y tiene items en el carrito.  
**Flujo Principal:**
1. Sistema muestra un formulario para datos de envío: nombre completo, dirección, ciudad, provincia, código postal, teléfono, email (opcional si ya está autenticado).
2. Usuario completa los campos obligatorios.
3. Sistema valida que los campos obligatorios estén llenos y que el email tenga formato válido (si se proporciona).
4. Sistema guarda los datos de envío (temporalmente en session o en el carrito).
5. Usuario continúa al paso de pago.

**Flujos Alternativos:**
- A1: Si falta algún campo obligatorio, se muestra error inline y se permite corregir.
- A2: Si el usuario está autenticado y tiene una dirección guardada, se muestra como opción predeterminada y puede usarla o ingresar una nueva.
- A3: Si el código postal no corresponde a un área de servicio, se muestra mensaje y se sugiere verificar.

**Postcondiciones:** Usuario ha proporcionado datos de envío válidos.

## UC-003: Seleccionar método de pago
**Actores:** Usuario, Sistema  
**Precondiciones:** Usuario ha completado los datos de envío.  
**Flujo Principal:**
1. Sistema muestra opciones de pago: Tarjeta de crédito/débito, Transferencia bancaria, Mercado Pago (o equivalente).
2. Usuario selecciona un método de pago.
3. Si se selecciona tarjeta, sistema muestra formulario para número de tarjeta, fecha de vencimiento, CVV, nombre del titular.
4. Si se selecciona transferencia, sistema muestra instrucciones bancarias y datos de cuenta.
5. Si se selecciona Mercado Pago, sistema redirige a la pasarela externa (o muestra modal integrado).
6. Usuario confirma el pago.

**Flujos Alternativos:**
- A1: Si se ingresan datos de tarjeta inválidos (número, fecha, CVV), se muestra error inline.
- A2: Si el usuario cancela el pago en la pasarela externa, regresa al paso de pago con mensaje de cancelación.
- A3: Si ocurre un error de comunicación con la pasarela, se muestra mensaje y se permite reintentar o cambiar método.

**Postcondiciones:** Usuario ha seleccionado y confirmado el método de pago.

## UC-004: Revisar y confirmar orden
**Actores:** Usuario, Sistema  
**Precondiciones:** Usuario ha proporcionado datos de envío y seleccionado método de pago.  
**Flujo Principal:**
1. Sistema muestra un resumen de la orden: lista de productos con cantidades, total de productos, costo de envío (si aplica), impuestos, total a pagar.
2. Sistema muestra los datos de envío ingresados (solo lectura).
3. Sistema muestra el método de pago seleccionado (solo lectura).
4. Usuario confirma la orden.
5. Sistema crea la orden en el backend, genera un número de orden y redirige a página de éxito.
6. Sistema envía correo de confirmación (si está configurado).

**Flujos Alternativos:**
- A1: Si el stock de un producto se agotó durante el proceso, se notifica y se permite ajustar cantidad o eliminar item.
- A2: Si el pago falla (por ejemplo, tarjeta rechazada), se muestra error y se permite corregir datos de pago o elegir otro método.
- A3: Si el usuario decide modificar algo (envío o pago), puede volver a los pasos anteriores.

**Postcondiciones:** Orden creada y confirmada; usuario recibe notificación.

## UC-005: Ver confirmation de orden
**Actores:** Usuario, Sistema  
**Precondiciones:** Usuario ha completado la compra y recibió un número de orden.  
**Flujo Principal:**
1. Sistema muestra una página de éxito con número de orden, fecha, y resumen breve.
2. Sistema muestra botones para: "Ver orden", "Continuar comprando", "Rastrear envío" (si aplica).
3. Usuario puede hacer clic en "Ver orden" para ver el detalle de la orden.
4. Sistema envía correo de confirmación con detalle de la orden.

**Flujos Alternativos:**
- A1: Si el usuario no recibió el correo, puede solicitar reenvío desde la página de detalle de orden.
- A2: Si la orden está pendiente de pago (ej. transferencia), se muestra estado pendiente y instrucciones.

**Postcondiciones:** Usuario visualiza la confirmación de su compra.

## UC-006: Ver detalle de orden (historial)
**Actores:** Usuario registrado, Sistema  
**Precondiciones:** Usuario ha iniciado sesión.  
**Flujo Principal:**
1. Usuario navega a "Mis órdenes" o sección de historial en su cuenta.
2. Sistema obtiene lista de órdenes del usuario desde el backend.
3. Sistema muestra cada orden con número, fecha, estado (pendiente, pagada, enviada, entregada, cancelada), total y botón para ver detalle.
4. Usuario selecciona una orden para ver su detalle.
5. Sistema muestra detalle de la orden: items, cantidades, precios, datos de envío, método de pago, estado actual, historial de cambios.

**Flujos Alternativos:**
- A1: Si no hay órdenes, se muestra mensaje "No tienes órdenes todavía".
- A2: Si hay error al cargar, se muestra mensaje de intento de recarga.

**Postcondiciones:** Usuario visualiza el detalle de una orden específica.
