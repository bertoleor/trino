```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Iniciar Revisar y confirmar orden
    Processing --> Success: Acción completada
    Processing --> Error: Error ocurrido
    Success --> [*]
    Error --> Idle: Intentar nuevamente o cancelar
```