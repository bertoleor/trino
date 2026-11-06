```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Iniciar Ingresar datos de envío
    Processing --> Success: Acción completada
    Processing --> Error: Error ocurrido
    Success --> [*]
    Error --> Idle: Intentar nuevamente o cancelar
```