# UX Flows — Trino

## Master Screen Map
[Ver mapa de pantalla](diagrams/screen-map.md)

## Screen Inventory
| Screen | Purpose | Wireframe | Use Cases |
|--------|---------|-----------|-----------|
| Tienda | Listado de productos disponibles | [tienda.html](wireframes/tienda.html) | UC-001 |
| Producto Detalle | Información específica de un producto | [producto-detalle.html](wireframes/producto-detalle.html) | UC-001, UC-002 |
| Carrito | Revisión y modificación del carrito de compras | [carrito.html](wireframes/carrito.html) | UC-001 |
| Checkout: Envío | Ingreso de dirección de envío | [checkout-envio.html](wireframes/checkout-envio.html) | UC-002 |
| Checkout: Pago | Selección e ingreso de datos de pago | [checkout-pago.html](wireframes/checkout-pago.html) | UC-003 |
| Checkout: Revisión | Revisión final antes de confirmar la orden | [checkout-revision.html](wireframes/checkout-revision.html) | UC-004 |
| Orden Confirmada | Pantalla de éxito tras compra | [orden-confirmada.html](wireframes/orden-confirmada.html) | UC-004, UC-005 |
| Detalle de Orden | Visualización detallada de una orden específica | [detalle-orden.html](wireframes/detalle-orden.html) | UC-005, UC-006 |

## Use Case Diagrams
### UC-001: Ver carrito
- [Flowchart](diagrams/uc-001-ver-carrito/flow.md)
- [State diagram](diagrams/uc-001-ver-carrito/states.md)
- [Sequence diagram](diagrams/uc-001-ver-carrito/sequence.md)

### UC-002: Ingresar datos de envío
- [Flowchart](diagrams/uc-002-ingresar-datos-envio/flow.md)
- [State diagram](diagrams/uc-002-ingresar-datos-envio/states.md)
- [Sequence diagram](diagrams/uc-002-ingresar-datos-envio/sequence.md)

### UC-003: Seleccionar método de pago
- [Flowchart](diagrams/uc-003-seleccionar-metodo-pago/flow.md)
- [State diagram](diagrams/uc-003-seleccionar-metodo-pago/states.md)
- [Sequence diagram](diagrams/uc-003-seleccionar-metodo-pago/sequence.md)

### UC-004: Revisar y confirmar orden
- [Flowchart](diagrams/uc-004-revisar-confirmar-orden/flow.md)
- [State diagram](diagrams/uc-004-revisar-confirmar-orden/states.md)
- [Sequence diagram](diagrams/uc-004-revisar-confirmar-orden/sequence.md)

### UC-005: Ver confirmation de orden
- [Flowchart](diagrams/uc-005-ver-confirmacion-orden/flow.md)
- [State diagram](diagrams/uc-005-ver-confirmacion-orden/states.md)
- [Sequence diagram](diagrams/uc-005-ver-confirmacion-orden/sequence.md)

### UC-006: Ver detalle de orden (historial)
- [Flowchart](diagrams/uc-006-ver-detalle-orden/flow.md)
- [State diagram](diagrams/uc-006-ver-detalle-orden/states.md)
- [Sequence diagram](diagrams/uc-006-ver-detalle-orden/sequence.md)

## Clickable Prototype Links
| From Screen | Element | To Screen |
|-------------|---------|-----------|
| tienda.html | [Incienso de Sándalo] link | producto-detalle.html |
| tienda.html | [Velas Aromáticas] link | producto-detalle.html |
| tienda.html | [Estatuilla de la Virgen] link | producto-detalle.html |
| producto-detalle.html | [Agregar al carrito] button | carrito.html |
| carrito.html | [Proceder a checkout] button | checkout-envio.html |
| checkout-envio.html | [Continuar al pago] button | checkout-pago.html |
| checkout-pago.html | [Continuar a revisión] button | checkout-revision.html |
| checkout-revision.html | [Confirmar y pagar] button | orden-confirmada.html |
| orden-confirmada.html | [Ver detalle de orden] link | detalle-orden.html |
| orden-confirmada.html | [Continuar comprando] link | tienda.html |
| detalle-orden.html | (no outgoing links in this view) | |

## Navigation Patterns
- **Flujo lineal**: El proceso de compra sigue pasos secuenciales: carrito → envío → pago → revisión → confirmación.
- **Persistencia del carrito**: El carrito se mantiene mediante una cookie httpOnly (trino_cart_sid) que almacena el ID de sesión anónima.
- **Validación en cada paso**: Cada paso valida los datos ingresados antes de permitir avanzar.
- **Resumen antes del pago**: El usuario revisa todos los detalles de la orden y los costos antes de confirmar el pago.
- **Opciones de pago múltiples**: Se soportan tarjeta, transferencia y Mercado Pago (u otra pasarela).
- **Confirmación de orden**: Tras el pago exitoso, se muestra una página de éxito con número de orden y opción para ver el detalle o continuar comprando.

## Open Questions
- ¿Se requiere autenticación para ver el historial de órdenes o se permite acceso como invitado con número de orden?
- ¿Cómo se manejan los cambios de dirección o método de pago después de iniciar el checkout pero antes de confirmar?
- ¿Se guarda el carrito indefinidamente o expira después de cierto tiempo?
- ¿Se ofrecen opciones de envío gratis o con costo basado en ubicación?
- ¿Cómo se calculan los impuestos (IVA) y se muestran en el resumen?
- ¿Se permite aplicar cupones o códigos de descuento durante el checkout?
- ¿Se envían notificaciones por email o WhatsApp al cambiar el estado de la orden (pagada, enviada, entregada)?
- ¿Se muestra el tiempo estimado de entrega basado en la región?
- ¿Se permite crear una cuenta durante el checkout (registro opcional)?
