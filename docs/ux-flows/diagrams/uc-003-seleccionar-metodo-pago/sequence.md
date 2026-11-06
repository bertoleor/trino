```mermaid
sequenceDiagram
    actor Usuario
    participant UI as Frontend UI
    participant API as Backend API
    Usuario ->> UI: Iniciar Seleccionar método de pago
    UI ->> API: Solicitud relacionada
    API-->> UI: Respuesta
    Usuario ->> UI: Mostrar resultado
    UI ->> Usuario: Notificación
```