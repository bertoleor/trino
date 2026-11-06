```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Iniciar Ver confirmation de orden
    Processing --> Success: Acción completada
    Processing --> Error: Error ocurrido
    Success --> [*]
    Error --> Idle: Intentar nuevamente o cancelar
```