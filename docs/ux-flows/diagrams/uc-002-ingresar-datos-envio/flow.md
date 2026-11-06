```mermaid
flowchart TD
    A[Inicio] --> B[Paso 1: Ingresar datos de envío]
    B --> C[Paso 2: Acción]
    C --> D{Decisión: Continuar?}
    D -->|Sí| E[Resultado exitoso]
    D -->|No| F[Manejo de error]
    E --> G[Fin]
    F --> G
```