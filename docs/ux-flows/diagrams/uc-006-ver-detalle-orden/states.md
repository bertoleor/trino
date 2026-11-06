```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Iniciar Ver detalle de orden (historial)
    Processing --> Success: Acción completada
    Processing --> Error: Error ocurrido
    Success --> [*]
    Error --> Idle: Intentar nuevamente o cancelar
```