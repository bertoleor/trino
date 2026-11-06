```mermaid
flowchart TD
    %% Screen Map for Trino Checkout Flow
    Tienda[Tienda] --> Producto[Producto]
    Producto --> Carrito[Carrito]
    Carrito --> CheckoutShipping[Checkout: Envío]
    CheckoutShipping --> CheckoutPayment[Checkout: Pago]
    CheckoutPayment --> CheckoutReview[Checkout: Revisión]
    CheckoutReview --> OrderSuccess[Orden Confirmada]
    OrderSuccess --> VerOrden[Ver Orden]
    OrderSuccess --> Tienda
    %% Additional links
    Producto --> Tienda
    Carrito --> Tienda
    %% Account flow
    Cuenta[Cuenta] --> HistorialOrdenes[Historial de Órdenes]
    HistorialOrdenes --> DetalleOrden[Detalle de Orden]
    %% Login/Signup
    Login[Iniciar Sesión] --> Cuenta
    Signup[Registrarse] --> Cuenta
```