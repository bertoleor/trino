# DATABASE.md — Modelo de datos Santísima Trinidad

> **Canónico (rol 06-DBA).** Fecha: 2026-09-17. Verificado contra `supabase/migrations/0001..0022` + OpenAPI de prod (`rest/v1/`, 36 paths vivos).
> Cambia schema → actualiza este doc en el MISMO PR que la migración.
> Stack: Supabase (Postgres 17) + PostgREST. Verificación: `curl -H "apikey: $SERVICE_ROLE" https://<ref>.supabase.co/rest/v1/ -H "Accept: application/openapi+json"`.

## 1. Visión

23 migraciones aplicadas a prod (ref `asbyqyxrpfggxjujfqte`), 21 tablas en `public`, 4 tablas técnicas (eventos/idempotencia/auditoría/logs) y ~6 funciones RPC. Modelo de **e-commerce físicos con auth dual** (user registrado via `auth.users` / anónimo via `session_id`) + **entitlements por rol** + flujo de pedido en 8 estados con máquina de transiciones transaccional.

## 2. Dominios y tablas

| Dominio | Tablas `public` | Migraciones |
|---|---|---|
| Identidad/roles | `profiles`, `entitlements` | 0001, 0005 |
| Catálogo | `categories`, `products`, `product_variants`, `launches` | 0003, 0011, 0015 |
| Carrito | `carts`, `cart_items` | 0006, 0019 |
| Pedidos | `orders`, `order_items` | 0007, 0020 |
| Reviews / wishlist | `reviews`, `wishlists` | 0013, 0014 |
| Contenido | `cultura_posts` | 0011, 0012 |
| Intl | `fx_rates` | 0016 |
| Técnica | `audit_logs`, `security_logs`, `processed_events`, `failed_webhooks_log`, `idempotency_keys`, `abandoned_cart_logs`, `keepalive_logs` | 0001, 0004, 0005, 0008-0010, 0013, 0021 |

## 3. Relaciones (FK)

```
auth.users ──┬── profiles(id)              [1:1, trigger on_auth_user_created_profile]
             └── entitlements(user_id)     [1:N, cascade]
            ─── carts(user_id|session_id)  [check: user_id XOR session_id]
products ──┬── product_variants(product_id) [1:N]
           ├── order_items(product_variant_id) → product_variants(id)
           └── cart_items(variant_id) → product_variants(id)
categories ── products(category_id)         [N:1]
orders ── order_items(order_id)             [1:N]
```

## 4. Estados de pedido (máquina transaccional)

`0007_order_enum.sql` — 8 estados: `draft → pending → pending_verification → authorized → processing → shipped → delivered`, ramas `canceled` (desde draft/pending/pending_verification/authorized/processing/shipped) y `refunded` (desde authorized/shipped/delivered).

- `check_order_transition(old,new)` valida la transición, `raise 422 invalid_transition` si es ilegal.
- Trigger `trg_orders_status_check` (BEFORE UPDATE of status) fuerza la transición.
- `authorized` = legacy `paid`; `canceled` = legacy `cancelled` (backfill en la migración).
- Check `orders_status_check9 NOT VALID` (validación a demanda; ver gate DBA antes de quitar `NOT VALID`).

## 5. Auth y roles (RLS / custom claims)

- Rol en `auth.users.app_metadata.role` (`'user' | 'admin'`), set por `set_user_role()`. **Nunca** en `user_metadata` (editable por el cliente, riesgo BOLA).
- `is_admin()` y `has_role()` = gate de las policies admin.
- Funciones `SECURITY DEFINER`: `handle_new_user_claims`, `handle_new_user_profile`, `get_customer_360`, `add_to_cart_serializable`, `merge_cart_serializable`, `check_order_transition`, `enforce_order_transition`. Todas con `auth.uid()` / rol check interno — **no agregar SECURITY DEFINER para bypassear RLS**.
- Cuentas anónimas: carrito vía `session_id` (NO RLS por session en DB — policy "own carts" es OWN+ADMIN, el resto es app layer por `session_id`).

## 6. RLS por tabla (políticas reales, 36 policies)

| Tabla | Policy anónimo/anónimo-session | Policy owner (auth) | Policy admin |
|---|---|---|---|
| `profiles` | — | own select/update | select all |
| `products`, `product_variants` | select (pub) | — | all |
| `reviews` | select approved | owner insert | select all + moderate |
| `wishlists` | anon_session_all | own select/insert/delete (owner_strict) | — |
| `cart_items`, `carts` | own | own | — |
| `orders`, `order_items` | — | owner | admin |
| `entitlements` | — | own select | select all |
| `cultura_posts` | select published | — | all |
| `keepalive_logs` | — | — | select + service insert |
| `audit_logs`, `security_logs`, `processed_events`, `failed_webhooks_log`, `abandoned_cart_logs` | — | — | admin (logs) |

Regla general: **tabla en `public` = RLS ENCENDIDA + policy explícita**. Logs de webhook/eventos = solo service_role insert + admin select (sin exposición postgrest).

## 7. Idempotencia y resiliencia (webhooks/pagos)

- `processed_events(id text PK)` → idempotency de eventos de proveedor (PK = hash del evento).
- `idempotency_keys` → claves idempotencia de operaciones mutantes.
- `failed_webhooks_log` → DLQ: payload crudo + error, para reproducir webhooks fallados.
- `audit_logs` / `security_logs` → pista de auditoría y eventos de seguridad.

## 8. Concurrencia (carts/orders)

- `add_to_cart_serializable`, `merge_cart_serializable` → RPC con nivel `SERIALIZABLE` + retry (`perf_mutex`) para condición de carrera multi-session.
- `update_cultura_occ` / `cultura_tsvector_update` → OCC micro-eventos de cultura.

## 9. Notas de mantenimiento

- Migraciones numeradas 0001..0022 → ya desplegadas. **Nueva migración SIEMPRE con número siguiente libre y `down.sql`** (gate DBA: sin down = bloqueada).
- Revisar `orders_status_check9 NOT VALID`, `cart_owner_check NOT VALID` → validar filas antes de quitar.
- Regenerar `database.types.ts` tras cada migración: `supabase gen types typescript --project-id asbyqyxrpfggxjujfqte --schema public > src/types/database.types.ts`.
- **Cuidado:** existen 2 archivos `0013_*` (`wishlist` + `wishlist_rls_fix`) — numeración duplicada en el repo local; en prod el deploy se resolvió en orden lexical. Consolidar numeración si se genera una nueva branched migration (prevenir colisión).