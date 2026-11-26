# Plan de Acción — Rebuild Base de Datos TRINO v1

**Fecha:** 2026-11-26  
**Autor:** agente (con aprobación del owner)  
**Estado:** READY TO EXECUTE  
**Objetivo:** Reemplazar el esquema público actual (collage histórico 0001–0028) por una base v1 limpia de e-commerce de belleza, eliminando todo rastro del dominio esotérico anterior.

---

## 1. Contexto y Decisiones Confirmadas

- **Alcance aprobado:** catálogo belleza, cuentas/RBAC, carrito, checkout/pedidos/pagos, reseñas, wishlist, configuración legal, auditoría/seguridad, contenido editorial belleza.
- **Eliminado:** `makeup_products`, `makeup_categories`, `categories` legacy, `fx_rates`, `launches`, `keepalive_logs`, `abandoned_cart_logs`, `perf_mutex`, `cultura_posts`, `return_policy_by_tipo`, facetas `tipo/tradicion/intencion` en producto.
- **Regla monetaria:** solo `integer` centavos + `currency='ARS'`. Nada de `numeric price`.
- **Producto + variante:** una SKU por variante; `product_variants` tiene precio, stock y `shade`.
- **Estado simple:** `products.status IN ('draft','published','archived')`. Sin `is_active` ni `deleted_at`.
- **RBAC real:** `entitlements.role` con `super_admin > admin > editor > viewer`. Cambio de rol → token invalidado.
- **RLS deny-by-default:** grants explícitos, vistas con `security_invoker=true`.
- **Storage:** `products` público; `reviews`, `bank_proofs` privados.

---

## 2. Estado Actual Verificado (Solo Lectura)

| Elemento | Estado |
|---|---|
| BD Supabase (hcyxsbxhpddgikbriayh) | 0 filas en todas las tablas de negocio; 290 solo en `keepalive_logs` |
| Auth users | 0 |
| Storage buckets | `reviews` (privado); faltan `products`, `bank_proofs` |
| Migraciones repo | 28 archivos, dos `0023`, 0027/0028 no aplicados |
| `global_settings` | No existe en vivo |
| Types generados | Desactualizados vs repo |

**Riesgo de datos:** casi nulo. Backup/PITR disponible.

---

## 3. Modelo de Datos Objetivo (Tablas)

| Dominio | Tablas | Notas |
|---|---|---|
| Identidad | `profiles`, `entitlements` | `entitlements` con CHECK 4-tier |
| Catálogo | `products`, `product_variants`, `product_images`, `product_translations` | `products` = entidad comercial; variante = SKU/precio/stock/shade |
| Carrito | `carts`, `cart_items` | Anon via `session_id`, merge on login via RPC |
| Comercio | `orders`, `order_items`, `payments`, `order_events` | ENUM estricto, precio recalculado server-side |
| Engagement | `wishlists`, `reviews` | RLS owner/admin |
| Contenido/Config | `editorial_posts`, `global_settings` | Reemplaza `cultura_posts` y legal por categoría |
| Plataforma | `audit_logs`, `security_logs`, `processed_events`, `failed_webhooks_log`, `idempotency_keys` | Append-only, retención 1yr |

---

## 4. Secuencia de Migraciones (Nueva Baseline)

Cada migración: **una preocupación**, timestamp real, RLS + políticas + grants + rollback documentado.

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `20261126000000_enable_extensions.sql` | `uuid-ossp`, `pg_trgm`, `pg_cron`, `pg_net` |
| 2 | `20261126000001_identity_rbac.sql` | `profiles`, `entitlements`, `has_role()` SECURITY DEFINER, RLS |
| 3 | `20261126000002_catalog_core.sql` | `products`, `product_variants`, `product_images`, `product_translations`, constraints, índices, RLS |
| 4 | `20261126000003_cart_persistence.sql` | `carts`, `cart_items`, RPCs `add_to_cart_serializable` / `merge_cart_serializable` |
| 5 | `20261126000004_orders_payments.sql` | `orders` (ENUM), `order_items`, `payments`, `order_events`, trigger transición |
| 6 | `20261126000005_engagement.sql` | `wishlists`, `reviews` (rating 1–5, status), `product_avg_rating` view security_invoker |
| 7 | `20261126000006_content_config.sql` | `editorial_posts` (belleza), `global_settings` (JSONB legal por categoría) |
| 8 | `20261126000007_platform_audit.sql` | `audit_logs`, `security_logs`, `processed_events`, `failed_webhooks_log`, `idempotency_keys` |
| 9 | `20261126000008_storage_buckets.sql` | Buckets `products` (public), `reviews`/`bank_proofs` (private) + policies |
| 10 | `20261126000009_seed_beauty.sql` | Seed idempotente: 3–5 productos belleza, posts editorial, settings legal |
| 11 | `20261126000010_grants_exposure.sql` | `GRANT SELECT` a `anon`/`authenticated` solo en tablas expuestas; revoke en resto |

**Nota:** Las migraciones 0001–0028 del repo **se archivan** (se mueven a `supabase/migrations/archive/`). El historial remoto se repara con `supabase migration repair`.

---

## 5. Unidades de Trabajo (Work Units)

| Unidad | Archivos Típicos | Verificación |
|---|---|---|
| **U1** `feat(db): establish clean identity and catalog baseline` | Migraciones 1–3, `src/lib/db/catalog.ts`, types | `db reset --local` + `db lint` + tipos alineados |
| **U2** `feat(db): rebuild cart and checkout persistence` | Migraciones 4–5, `src/lib/actions/cart.ts`, `src/lib/checkout/price-integrity.ts`, RPCs | Carrito anon + merge + checkout → orden `draft` |
| **U3** `feat(db): rebuild customer engagement and content` | Migraciones 6–7, wishlist/reviews actions, editorial API | RLS A≠B probado; wishlist anon+user; reviews approved-only |
| **U4** `refactor(db): remove legacy schema consumers and modules` | Eliminar imports de `makeup_products`, `categories`, `fx_rates`, `launches`, `keepalive`, `cultura_posts`; routes FX/cultura/launches | `pnpm typecheck` 0 errores; `grep -r` legacy = 0 hits |
| **U5** `chore(db): rewrite seeds and database documentation` | `supabase/seed.sql`, `docs/DATABASE.md`, `docs/catalog/README.md` | `db reset --local --no-seed` + seed idempotente |
| **U6** `chore(db): reset linked database and verify cutover` | Scripts de backup, `migration repair`, smoke test E2E | Funnel completo home→PLP→PDP→cart→checkout→orden |

> Cada unidad ≤ 400 líneas. Si supera, se divide en PRs encadenados por dominio (catálogo, comercio, engagement, plataforma).

---

## 6. Cambios en la Aplicación (Blast Radius)

| Área | Archivos a tocar (representativos) |
|---|---|
| Catálogo / PLP / PDP | `src/lib/catalog/catalog-data.ts`, `src/app/[locale]/tienda/page.tsx`, `src/app/[locale]/producto/[slug]/page.tsx`, `src/lib/db/facets.ts`, `src/components/storefront/*` |
| Carrito / Wishlist | `src/lib/actions/cart.ts`, `src/lib/actions/wishlist.ts`, `src/lib/db/cart-view.ts`, `src/components/storefront/cart-drawer-*.tsx` |
| Checkout / Pagos | `src/app/api/checkout/route.ts`, `src/app/api/webhooks/mercadopago/route.ts`, `src/app/api/bank-proof/url/route.ts`, `src/lib/checkout/price-integrity.ts` |
| Cuenta / Reseñas | `src/app/[locale]/(account)/wishlist/page.tsx`, `src/app/[locale]/producto/[slug]/reviews/page.tsx`, `src/lib/actions/reviews.ts` |
| Admin / Legal | `src/app/[locale]/admin/*`, `src/app/[locale]/(legal)/*`, `src/lib/merchant/identity.ts`, `src/lib/customer360.ts` |
| Platform / Security | `src/proxy.ts`, `src/lib/proxy/rbac-audit.ts`, `src/app/api/cron/*`, `src/lib/supabase/keepalive.ts` |
| Tests / Seeds | `tests/unit/*.test.ts`, `tests/integration/rls-two-role.test.ts`, `supabase/seed.sql` |
| Types / Config | `src/types/database.types.ts` (regenerado), `supabase/config.toml` |

---

## 7. Criterios de Verificación (Gates Obligatorios)

### Local (antes de cualquier push)

```bash
# 1. Baseline reproducible
supabase db reset --local
supabase db lint

# 2. Types alineados
pnpm gen:types      # supabase gen types typescript --local > src/types/database.types.ts
pnpm typecheck      # tsc --noEmit

# 3. Calidad de código
pnpm lint           # eslint + prettier
pnpm format:check

# 4. Tests
pnpm test           # vitest run (TEMP=E:/temp)
pnpm test:e2e       # playwright test

# 5. Build
pnpm build

# 6. RLS real (two-role)
# - Requiere supabase local up
# - Tests integration/rls-two-role.test.ts verdes
```

### Remoto (Cutover)

1. **Backup confirmado:** PITR + `pg_dump --data-only --table='*'` con conteos.
2. **Reparar historial:** `supabase migration repair --linked --status reverted <old-versions>` + `supabase db pull --linked` para baseline limpio.
3. **Reset remoto:** `supabase db reset --linked` (con aprobación explícita).
4. **Storage:** recrear buckets `products`, `reviews`, `bank_proofs` + policies.
5. **Smoke E2E:** funnel completo contra proyecto enlazado.
6. **Verificación post-cutover:** 0 tablas legacy, 0 amounts no-centavos, RLS activa en todo, aislamiento A≠B probado.

---

## 8. Documentación a Actualizar

| Doc | Qué cambia |
|---|---|
| `docs/DATABASE.md` (nuevo) | Esquema v1 completo, relaciones, RLS, enums, RPCs |
| `docs/catalog/README.md` | CSV template ajustado a `products` + `product_variants` |
| `docs/legal/01-product-specs-requirements.md` | Políticas por categoría (no por `tipo`) |
| `docs/overview.md` | Referencia al nuevo modelo |
| `ARCHITECTURE.md` | Cap DB actualizada |
| `README.md` | Stack y migraciones notas |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Reset remoto falla por lock/contención | Baja | Alto | Ejecutar en ventana de bajo tráfico; tener `pg_dump` listo para restore |
| Tests RLS locales no corren (Docker) | Media | Medio | CI corre contra preview; local valida migraciones + lint + typecheck |
| Código legacy no detectado por grep | Baja | Medio | `knip` + `tsc --noEmit` + búsqueda manual de patrones conocidos |
| Seed no idempotente | Baja | Bajo | `ON CONFLICT DO NOTHING` en todo insert; validar con `db reset --local` repetido |
| Types desincronizados tras cutover | Media | Alto | Regenerar y commitear types **inmediatamente** después de `db reset --linked` |

---

## 10. Próximos Pasos Inmediatos

1. **Crear worktree** `trino-db-rebuild` para aislar el trabajo.
2. **Archivar migraciones viejas** a `supabase/migrations/archive/`.
3. **Escribir migración 1** (`enable_extensions.sql`) y validar `db reset --local`.
4. **Iterar migraciones 2–11** en orden, regenerando types tras cada una.
5. **Ejecutar U4–U5** (limpieza código + seeds + docs) en paralelo cuando el esquema esté estable.
6. **Solicitar aprobación explícita** para cutover remoto (paso U6).

---

## 11. Comandos de Referencia

```bash
# Worktree
git worktree add ../trino-db-rebuild main
cd ../trino-db-rebuild

# Archivar migraciones viejas
mkdir -p supabase/migrations/archive
git mv supabase/migrations/00*.sql supabase/migrations/archive/

# Desarrollo local
supabase start
supabase db reset --local
supabase db lint
pnpm gen:types
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e

# Cutover (solo tras aprobación)
supabase migration repair --linked --status reverted 20240101000000 20240102000000 ... # todas las viejas
supabase db pull --linked --schema public
supabase db reset --linked
# Recrear Storage buckets via Dashboard o SQL
pnpm test:e2e --project=linked
```

---

**Fin del plan.**  
Listo para ejecutar cuando des el OK. La primera acción concreta será crear el worktree y archivar las migraciones históricas.