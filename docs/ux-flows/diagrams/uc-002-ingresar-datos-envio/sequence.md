```mermaid
sequenceDiagram
    actor Usuario
    participant UI as Frontend UI
    participant API as Backend API
    Usuario ->> UI: Iniciar Ingresar datos de envío
    UI ->> API: Solicitud relacionada
    API-->> UI: Respuesta
    Usuario ->> UI: Mostrar resultado
    UI ->> Usuario: Notificación
```