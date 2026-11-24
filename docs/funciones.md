# trino. — funciones (qué hace el producto)

> Canónico baseline. Verificado contra `src/app/`, `src/app/api/`,
> `src/lib/`, `openspec/specs/` (16 caps). Solo documentación.

## Tienda (ecom-engine)

- PLP `/tienda` con filtros combinables, paginación 25/100, ISR 300, CSP
  estática (`next.config.ts`). Modelo objetivo: categoría (5) × subcategoría ×
  marca × tono × acabado. El runtime aún usa las facetas heredadas
  `tipo`/`tradicion`/`intencion` (`src/lib/db/facets.ts`) — deuda migratoria.
- PDP `/producto/[slug]` + `/reviews`: ficha completa (especificaciones,
  variantes, "cómo se usa"), calculadora de envío por CP, precios
  mayorista/minorista por tipo de cliente.
- Carrito en DB desde el primer agregado (no solo localStorage); merge de
  carrito anónimo al loguear sin duplicar SKU; checkout en
  `src/app/api/checkout/route.ts` + `src/lib/checkout/`, `src/lib/orders/`.
- Carrito abandonado: cron 1h → evento asíncrono a n8n/Resend (nunca
  sincrónico en el request).
- Evidencia: `src/lib/{checkout,orders,money,validations}/`,
  `openspec/specs/{ecom-engine,concurrency-inventory,money-arithmetic}/`.

## Pagos (payments)

- MercadoPago zero-PAN + webhooks Stripe / PayPal / MercadoPago
  (`src/app/api/webhooks/{mercadopago,paypal,stripe}/`, `src/lib/payments/`).
- Cancel bancaria 72h idempotente (cron). Flags `PAYMENTS_*` en false por
  defecto. Evidencia: `openspec/specs/payments/`.

## Envíos (shipping-carriers)

- Cotización por CP (`src/app/api/shipping/rates/`), batch admin
  (`src/app/api/admin/shipping/batch/`), carriers en
  `src/lib/shipping/carriers/`.
- `SHIPPING_INTERNATIONAL_ENABLED=false` → fallback flat.
- Devoluciones por categoría: productos cosméticos abiertos o usados no se
  devuelven por higiene — pendiente de firma del dueño (el borrador vivía en
  `docs/branding.md`, cancelado el 2026-11-23; reincorporarlo al manual nuevo
  antes de implementarlo).

## Cuenta y backoffice (admin-backoffice)

- Auth Supabase SSR + RLS `is_admin()`; login/signup/callback; wishlist con
  uniques parciales + merge anónimo/sesión (`src/lib/auth/`,
  `openspec/specs/{wishlist,admin-backoffice}/`).
- Admin: cultura, calendar, easter, lanzamientos
  (`src/app/[locale]/admin/`). Campañas/cupones, reportes de conversión,
  CRM Vista 360° con recuperación de carrito en un clic (plan backoffice).
- Cuenta: verificación progresiva, centro de notificaciones + preferencias
  por canal (email/WhatsApp/ambos/ninguno); transaccionales no
  desactivables. Captación email sin pop-up agresivo.

## Cultura / contenido (cultura-blog)

- Blog/glosario `/cultura` + `[slug]` con `search_vector` GIN; sync diario
  06:00 con dedup hash (`src/app/api/cron/cultura-sync/`).
- Calendario de lanzamientos/temporadas, quiz "encontrá tu tono", feed
  @holatrino embebido — canal SEO orgánico del rubro, pendiente de ratificar
  su forma definitiva contra `docs/brand/`.
- Reviews 1..5 con cola de moderación (`openspec/specs/reviews/`).

## Transversales

| Capacidad | Evidencia |
|---|---|
| i18n + routing (4 locales, ICU, `Intl.NumberFormat`) | `messages/`, `src/i18n/`, `openspec/specs/i18n-routing/` |
| Seguridad + resiliencia (CSP nonce, rate limit, circuit breaker) | `src/lib/security/`, `src/proxy.ts`, `src/lib/{rate-limit.ts,circuit.ts}` |
| Observabilidad + health | `instrumentation.ts`, `src/app/api/health*/`, `src/lib/{logger.ts,analytics}/` |
| Performance + escalabilidad | `src/lib/perf/`, `lighthouserc.json`, `openspec/specs/performance-scalability/` |
| Social stats | `src/app/api/social/stats/`, `src/lib/social/` |
| Easter eggs (`EASTER_ENABLED=true`) | `src/lib/easter/`, `src/app/[locale]/admin/easter/` |
| Bank proof | `src/app/api/bank-proof/url/` |
| Motion de marca (reveals, transiciones de forma) | `src/styles/motion.css`, `src/lib/motion/` |
| Tooling / change hygiene | `openspec/specs/{build-tooling-freshness,tooling-config,change-hygiene}/` |

## Específicas del rubro (pendiente de ratificar contra `docs/brand/`)

- Sets/kits curados por ocasión con lógica propia de armado.
- Suscripción "caja de belleza mensual" (opcional, evaluar demanda).
- Nota personalizada en checkout y unboxing como experiencia.
- Notificaciones opt-in ligadas a lanzamientos y temporadas.
