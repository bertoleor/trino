# Plan Arquitectónico y Funcional: Backoffice E-commerce White-Label 2026

> Documento de referencia para iniciar el desarrollo. Reúne la visión de negocio, la estructura funcional del panel y la lógica técnica detrás de cada módulo. Pensado para que un modelo de IA o un equipo de desarrollo lo tome como punto de partida del plan de acción.

---

## 0. Resumen ejecutivo

No es un panel de admin genérico: es un **sistema operativo de negocio** para e-commerce, vendible como producto White-Label a múltiples marcas/clientes, sin reescribir código entre uno y otro. Se apoya en tres decisiones de diseño que lo diferencian de plataformas monolíticas (Tienda Nube, Mercado Shops, Shopify básico):

1. **Navegación tipo "Configuración de iOS" (drill-down):** 5-6 categorías principales, cada clic lleva a una subpantalla. Nunca mega-menús. El usuario siempre sabe dónde está.
2. **Dos patrones de interacción secundaria, sin mezclarlos:**
   - **Modales (pop-ups):** solo para confirmar acciones destructivas o irreversibles.
   - **Slide-overs (cajones laterales):** para crear/editar, sin perder el contexto de la tabla o pantalla de origen.
3. **UI Optimista + procesamiento en segundo plano:** toda acción (cambiar estado de pedido, aplicar descuento masivo) se refleja al instante en pantalla; la sincronización real ocurre por detrás. Si falla, se revierte con un toast de error. Las tareas pesadas (exportar clientes, subir 1000 productos) nunca corren en el request principal: van a un worker en background con feedback visual de progreso.

---

## 1. Arquitectura Multi-Marca (White-Label / Rebranding instantáneo)

Objetivo: vender el mismo panel a distintos dueños de tienda sin tocar código cuando cambia el cliente o la marca.

- **CSS Variables como motor de theming:** nada de colores "quemados" en las clases (nada de `bg-blue-500` fijo). Todo pasa por variables (`--primary-color`, `--secondary-color`, `--font-family`) que se inyectan en el `:root` al cargar la sesión, leídas desde una tabla `global_settings` / `tenants` en la base de datos.
- **Manifiesto PWA dinámico:** el `manifest.json` (nombre, ícono, colores de la app instalada en el celular) se genera dinámicamente vía una Route Handler (`/api/manifest?tenant=id`), no es un archivo estático.
- **Rebrandeo = cambiar 3 valores en base de datos**, sin deploy, sin tocar código: nombre, logo, paleta.
- **Aislamiento de datos por tenant:** cada fila relevante (productos, pedidos, clientes, configuración) lleva `tenant_id`, y las políticas de acceso a la base de datos (Row Level Security en Supabase/Postgres) lo hacen cumplir a nivel de motor, no solo de lógica de aplicación — así un bug en el frontend nunca puede filtrar datos de otro cliente.

---

## 2. Filosofía UI/UX

- **Divulgación progresiva:** el menú principal solo muestra categorías amplias (Ventas, Catálogo, Clientes, Envíos, Marketing, Contenido, Configuración). Cada una abre su propia subpantalla con su propio submenú, igual que Ajustes de un smartphone.
- **Editores de texto enriquecido (TipTap, estilo Notion)** para todo el contenido editorial: Quiénes Somos, Políticas, descripciones de producto largas.
- **Popups funcionales de verdad:** no solo decorativos — deben poder editar datos en línea, mostrar previews en vivo (ej: cómo se ve el producto en Google antes de guardar el SEO).
- **Evitar "cara de IA genérica":** tipografía con jerarquía real, microinteracciones sutiles (no genéricas de librería sin ajustar), estados vacíos diseñados (no un simple "no data"), skeleton loaders en vez de spinners genéricos.

---

## 3. Módulos Core del Negocio

### A. Ventas / Pedidos (Orders)
- Máquina de estados estricta (ENUM, no texto libre): `Pendiente → Pagado → En Proceso → Enviado → Entregado → Cancelado` (+ `Reembolsado` / `Disputado`, ver sección de faltantes).
- Vista Kanban o lista, con filtros por estado, fecha, cliente, método de pago.
- Slide-over de pedido: estado actual, timeline de cambios (auditoría), datos del comprador, dirección, productos, notas internas.
- Cambio de estado optimista en UI + webhook a n8n en segundo plano.
- Generación on-demand de comprobantes/recibos en PDF (sin valor fiscal salvo integración con facturación electrónica local).

### B. Catálogo e Inventario
- Edición granular: stock, toggle "fuera de stock" (visible u oculto en la tienda), precio base, precio de oferta con `sale_start_date` / `sale_end_date`.
- Variantes dinámicas (talle, color, peso) que afectan stock individual y cotización de envío.
- SEO por producto: `meta_title`, `meta_description`, slug amigable, generación de JSON-LD para rich snippets en Google.
- Acciones masivas: seleccionar N productos y aplicar descuento %, desactivar, eliminar (con modal de confirmación), o exportar.
- Carga masiva por CSV/Excel vía Background Worker: el admin ve "Procesando 847 productos..." y puede seguir trabajando.
- Gestión de reseñas de producto (moderar, aprobar, ocultar) — vive dentro de Catálogo.

### C. Clientes / CRM (Vista 360°)
- Al abrir un cliente: LTV (gasto histórico total), cantidad de compras, última compra, pedidos activos, historial completo, dirección(es) guardadas.
- **Carritos abandonados:** vista en vivo de clientes con productos sin pagar, valor total del carrito, y botón de un clic para disparar recuperación por email o WhatsApp (vía n8n).
- Segmentación básica de clientes (recurrentes, en riesgo de churn, de alto valor) para targeting de campañas.

### D. Envíos y Logística
- Zonas de envío por polígono (PostGIS) o agrupación de códigos postales: "Envío Local", "Envío Nacional".
- Cotizador en vivo conectado a APIs logísticas locales (correo, transportistas).
- Batching: agrupar pedidos pagados por código postal y generar ruta de entrega en un clic; generación de etiquetas (ZPL para térmicas o PDF A4).
- Vista de seguimiento para el cliente final (estado de su envío) y para el dueño (mapa/lista de entregas del día).

### E. Marketing
- Campañas de descuento con fecha de inicio/fin, alcance (todo el catálogo, categoría, productos puntuales).
- Cupones/códigos promocionales (uso único, uso múltiple, por cliente, monto mínimo de compra).
- Reportes básicos de rendimiento de campaña (conversión, ingresos atribuidos).

### F. Contenido (CMS)
- Constructor de páginas legales/institucionales: Quiénes Somos, Políticas de Devolución, Términos y Condiciones, Contacto — editor TipTap.
- SEO global: OpenGraph, Meta Pixel, Google Tag Manager (inyectados vía `next/third-parties` o equivalente).
- Datos de pago y métodos habilitados: activación/desactivación de Stripe, MercadoPago, transferencia bancaria como feature flags.

### G. Configuración
- Branding/colores (theming del tenant).
- Integraciones: n8n, Telegram, WhatsApp, Email.
- Usuarios y roles.
- SEO global.
- **Test de checkout integrado:** botón que simula un pedido completo end-to-end para que el dueño verifique que la tienda funciona, sin gastar dinero real.

---

## 4. Infraestructura Avanzada

### A. PWA instalable + Notificaciones en vivo
- El panel se instala como app nativa en el celular del dueño/empleados.
- Supabase Realtime + Web Push API: notificaciones de ventas llegan aunque la app esté cerrada o en segundo plano.
- Sonido de "caja registradora" vía Web Audio API cuando entra una venta en tiempo real.
- Contador de notificaciones (campana) que se actualiza al instante.

### B. Optimización multimedia (Edge Compression)
- Subida vía Presigned URL (Zero-Trust Upload): el frontend nunca sube directo a producción sin pasar por una URL temporal firmada.
- Edge Function que comprime la imagen sin pérdida visible, convierte a WebP, y genera un BlurHash para carga progresiva del lado del cliente final.

### C. Operaciones masivas (Bulk Actions)
- Toda acción pesada (exportar base de clientes, importar 1000 productos, recalcular precios por categoría) va a un Background Worker (Inngest, Upstash QStash, o similar) — nunca bloquea el request HTTP principal.
- Barra lateral con panel de "tareas en curso" y su progreso.

### D. Hub de automatizaciones (n8n / Webhooks)
- Arquitectura event-driven: el sistema no manda emails/WhatsApp de forma directa y bloqueante, inserta eventos en cola.
- Cada cambio de estado relevante dispara un webhook a n8n, que reparte hacia WhatsApp (cliente), Telegram (dueño) y Email (cliente/dueño según el evento).

### E. Seguridad y Roles (RBAC)
- Roles mínimos: **Dueño** (acceso total) y **Empleado** (gestiona pedidos, no ve pagos, no elimina productos, no exporta base de clientes).
- Cada Server Action valida no solo autenticación sino el rol del token antes de ejecutar — nunca confiar solo en ocultar el botón en el frontend.
- **Auditoría de acciones (Activity Log):** todo cambio de un empleado queda registrado (quién, qué, cuándo). Es lo que separa un sistema vendible a empresas medianas de un panel amateur.

---

## 5. Cosas que probablemente te falten (y conviene sumar ahora, no después)

Estos puntos no estaban en tu lista original y suelen aparecer recién cuando el cliente real los pide — conviene dejarlos previstos en el modelo de datos desde el día uno, aunque la funcionalidad completa se implemente después:

1. **Devoluciones y reembolsos (RMA):** flujo separado del estado de pedido normal — solicitud del cliente, aprobación, reembolso parcial/total, reingreso a stock.
2. **Facturación fiscal real:** distinguir el "recibo" interno (PDF sin valor fiscal, ya contemplado) de una eventual integración con facturación electrónica según el país (AFIP en Argentina, SAT en México, etc.) — al menos dejar el modelo de datos preparado para sumarlo.
3. **Multi-moneda y multi-impuesto:** si el mismo panel se va a revender a marcas en distintos países, precios y tasas de impuesto no pueden estar hardcodeados en una sola moneda.
4. **Alertas de stock bajo / quiebre de stock:** notificación automática al dueño cuando un producto baja de cierto umbral, no solo el toggle manual de "fuera de stock".
5. **Multi-depósito / multi-sucursal:** si mañana el cliente tiene más de un depósito físico, el stock necesita estar particionado por ubicación, no ser un número único por producto.
6. **Gestión de soporte/tickets del comprador:** un canal donde el cliente final pueda reclamar o preguntar sobre su pedido, y quede trazado (hoy solo está contemplado el WhatsApp/Email vía n8n, que no queda registrado en el sistema).
7. **Programas de fidelización / puntos:** opcional, pero es común que se pida después de que el e-commerce ya está andando.
8. **Backups y recuperación ante desastres:** política explícita de backup de base de datos y de archivos (imágenes), con retención y prueba de restauración — no asumir que "Supabase ya hace backup".
9. **Monitoreo y logging de errores en producción:** Sentry (o similar) + logs estructurados, para poder debuggear cuando algo falla en un tenant específico sin acceso directo a la base.
10. **Entorno de staging/pruebas separado de producción:** especialmente crítico en un sistema multi-tenant, donde un error de un cliente no puede afectar a los demás.
11. **Consentimiento de cookies / cumplimiento de privacidad (GDPR-like):** aunque el foco sea LATAM, si se vende a distintos países conviene tenerlo desde el modelo de datos (consentimiento por usuario, exportación/borrado de datos personales a pedido).
12. **2FA (doble factor de autenticación)** para el rol Dueño como mínimo — es el usuario con más poder en el sistema y el objetivo más obvio de un ataque.
13. **Rate limiting / protección anti-bots** en el checkout y en endpoints públicos (formularios de contacto, cotizador de envío) para evitar abuso.
14. **Idempotencia en webhooks de pago:** un mismo evento de pago (ej. reintento de MercadoPago/Stripe) no debe generar dos pedidos o dos notificaciones duplicadas.
15. **Versionado de contenido del CMS:** poder ver el historial de cambios de "Quiénes Somos" o Políticas y volver atrás si alguien edita mal.
16. **Preferencias de notificación por usuario/empleado:** no todos los empleados necesitan recibir todas las alertas (ej. un empleado de despacho no necesita alertas de carritos abandonados).

---

## 6. Guía técnica de referencia por módulo (stack sugerido)

| Módulo | Patrón / Tecnología sugerida |
|---|---|
| Tabla de pedidos | `tanstack-table` con filtros de estado, búsqueda, menú contextual por fila |
| Theming multi-tenant | CSS Variables inyectadas en `:root` desde `tenants.settings` |
| Manifest PWA dinámico | Route Handler `/api/manifest?tenant=id` |
| Realtime + notificaciones | Supabase Realtime + Web Push API + Web Audio API |
| Editor de contenido | TipTap |
| Carga masiva / tareas pesadas | Background Worker (Inngest / Upstash QStash) + UI de progreso |
| Subida y compresión de imágenes | Presigned URL + Edge Function (compresión, WebP, BlurHash) |
| Automatizaciones externas | Webhooks salientes → n8n → WhatsApp / Telegram / Email |
| Envíos con geolocalización | PostGIS (Supabase/Postgres) o agrupación por CP |
| Roles y permisos | RBAC a nivel de Server Action, no solo de UI |
| Auditoría | Tabla `activity_log` (usuario, acción, entidad, timestamp, diff) |
| Multi-idioma del panel | `next-intl` desde el inicio del proyecto |
| PDFs (recibos, etiquetas) | `react-pdf` |

---

## 7. Próximos pasos sugeridos

1. Definir el modelo de datos (schema) completo incluyendo los campos de la sección 5, aunque no se implemente la funcionalidad completa todavía — es mucho más barato prever el campo ahora que migrar después.
2. Priorizar el MVP: Ventas + Catálogo + Clientes + RBAC básico + PWA con notificaciones. El resto de los módulos (Marketing avanzado, multi-depósito, fidelización) pueden ir en fases posteriores.
3. Definir el primer tenant real (marca piloto) para validar el flujo de rebrandeo de punta a punta antes de vender el sistema a un segundo cliente.
4. Armar el checklist de seguridad (RBAC, 2FA, rate limiting, RLS) como criterio de salida antes de cualquier lanzamiento a producción.