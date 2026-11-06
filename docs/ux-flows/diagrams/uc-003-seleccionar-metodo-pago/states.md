```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Iniciar Seleccionar método de pago
    Processing --> Success: Acción completada
    Processing --> Error: Error ocurrido
    Success --> [*]
    Error --> Idle: Intentar nuevamente o cancelar
```