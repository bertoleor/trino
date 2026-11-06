# Índice de Wireframes
| Screen name | File link | Related use cases | Key elements | Outgoing links |
|-------------|-----------|-------------------|--------------|----------------|
| Tienda | [tienda.html](tienda.html) | UC-001 | Lista de productos destacados | producto-detalle.html |
| Producto Detalle | [producto-detalle.html](producto-detalle.html) | UC-001, UC-002 | Información del producto, botón agregar al carrito | tienda.html, carrito.html |
| Carrito | [carrito.html](carrito.html) | UC-001 | Lista de items, total, botón proceder a checkout | producto-detalle.html, checkout-envio.html |
| Checkout: Envío | [checkout-envio.html](checkout-envio.html) | UC-002 | Formulario de dirección de envío | carrito.html, checkout-pago.html |
| Checkout: Pago | [checkout-pago.html](checkout-pago.html) | UC-003 | Selección de método de pago y formularios | checkout-envio.html, checkout-revision.html |
| Checkout: Revisión | [checkout-revision.html](checkout-revision.html) | UC-004 | Resumen de orden, envío, pago, botón confirmar | checkout-pago.html, orden-confirmada.html |
| Orden Confirmada | [orden-confirmada.html](orden-confirmada.html) | UC-004, UC-005 | Número de orden, total, botones de acción | detalle-orden.html, tienda.html |
| Detalle de Orden | [detalle-orden.html](detalle-orden.html) | UC-005, UC-006 | Detalle completo de la orden | orden-confirmada.html |
