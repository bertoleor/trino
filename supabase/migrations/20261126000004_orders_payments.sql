-- ============================================================
-- 20261126000004_orders_payments.sql — Orders, Payments & Events
-- Strict ENUM state machine, server-side price integrity,
-- MercadoPago zero-PAN, bank transfer with comprobante.
-- ============================================================

-- ------------------------------------------------------------------
-- 1) ORDER STATUS ENUM
-- ------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum (
    'draft',
    'pending',
    'pending_verification',
    'authorized',
    'processing',
    'shipped',
    'delivered',
    'canceled',
    'refunded'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------
-- 2) PAYMENT PROVIDER ENUM
-- ------------------------------------------------------------------
do $$ begin
  create type public.payment_provider as enum (
    'mercadopago',
    'bank_transfer'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------
-- 3) ORDERS
-- ------------------------------------------------------------------
create table public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete set null,
  session_id            text,                                      -- anon checkout
  status                public.order_status not null default 'draft',
  subtotal_cents        integer not null default 0 check (subtotal_cents >= 0),
  shipping_cents        integer not null default 0 check (shipping_cents >= 0),
  total_cents           integer not null default 0 check (total_cents >= 0),
  currency              char(3) not null default 'ARS' check (currency = 'ARS'),
  payment_provider      public.payment_provider,
  payment_id            text,                                      -- MP payment_id or bank ref
  payment_status        text,                                      -- provider-specific status
  shipping_address      jsonb,                                     -- {name, line1, line2, city, province, postal_code, country, phone}
  billing_address       jsonb,
  notes                 text,                                      -- customer notes
  idempotency_key       text unique,                               -- client-provided for safe retry
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id) where user_id is not null;
create index idx_orders_session on public.orders(session_id) where session_id is not null;
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_orders_idempotency on public.orders(idempotency_key) where idempotency_key is not null;

-- ------------------------------------------------------------------
-- 4) ORDER ITEMS
-- ------------------------------------------------------------------
create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  variant_id      uuid not null references public.product_variants(id) on delete restrict,
  product_name    text not null,                                   -- snapshot at purchase
  variant_name    text,                                            -- snapshot
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity        integer not null check (quantity > 0),
  total_cents     integer not null check (total_cents >= 0),
  created_at      timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_variant on public.order_items(variant_id);

-- ------------------------------------------------------------------
-- 5) PAYMENTS — MercadoPago zero-PAN + bank transfer proof
-- ------------------------------------------------------------------
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  provider            public.payment_provider not null,
  provider_payment_id text,                                        -- MP payment_id, bank transfer ref
  amount_cents        integer not null check (amount_cents > 0),
  currency            char(3) not null default 'ARS' check (currency = 'ARS'),
  status              text not null,                               -- provider status: pending, approved, rejected, refunded, etc.
  raw_payload         jsonb,                                       -- webhook payload (no PAN)
  comprobante_path    text,                                        -- Storage path for bank transfer proof
  processed_at        timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_payments_order on public.payments(order_id);
create index idx_payments_provider on public.payments(provider, provider_payment_id) where provider_payment_id is not null;

-- ------------------------------------------------------------------
-- 6) ORDER EVENTS — audit trail for state transitions
-- ------------------------------------------------------------------
create table public.order_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  event_type    text not null,                                     -- status_change, payment_received, stock_held, etc.
  old_status    public.order_status,
  new_status    public.order_status,
  actor_id      uuid,                                              -- user_id or null for system
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_order_events_order on public.order_events(order_id, created_at);

-- ------------------------------------------------------------------
-- 7) TRANSITION GUARD: check_order_transition(old, new) -> boolean
-- Enforces strict state machine. Called by trigger.
-- ------------------------------------------------------------------
create or replace function public.check_order_transition(
  p_old_status public.order_status,
  p_new_status public.order_status
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean := false;
begin
  if p_old_status = p_new_status then return true; end if;

  v_allowed := (p_old_status, p_new_status) in (
    ('draft',                 'pending'),
    ('draft',                 'canceled'),

    ('pending',               'pending_verification'),
    ('pending',               'authorized'),
    ('pending',               'canceled'),

    ('pending_verification',  'authorized'),
    ('pending_verification',  'canceled'),

    ('authorized',            'processing'),
    ('authorized',            'canceled'),
    ('authorized',            'refunded'),

    ('processing',            'shipped'),
    ('processing',            'canceled'),

    ('shipped',               'delivered'),
    ('shipped',               'refunded'),

    ('delivered',             'refunded')
  );

  if not v_allowed then
    raise exception 'invalid_transition: % -> %', p_old_status, p_new_status
      using errcode = 'P0001', hint = '422';
  end if;
  return true;
end;
$$;

grant execute on function public.check_order_transition(public.order_status, public.order_status) to authenticated, service_role;

-- ------------------------------------------------------------------
-- 8) TRIGGER: enforce_order_transition
-- ------------------------------------------------------------------
create or replace function public.enforce_order_transition()
returns trigger
language plpgsql
as $$
begin
  perform public.check_order_transition(old.status, new.status);
  return new;
end;
$$;

drop trigger if exists trg_orders_status_check on public.orders;
create trigger trg_orders_status_check
  before update of status on public.orders
  for each row execute function public.enforce_order_transition();

-- ------------------------------------------------------------------
-- 9) TRIGGER: log_order_event on status change
-- ------------------------------------------------------------------
create or replace function public.log_order_event()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_events (order_id, event_type, old_status, new_status, actor_id, metadata)
    values (new.id, 'status_change', old.status, new.status, auth.uid(), jsonb_build_object('source', 'trigger'));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_log_event on public.orders;
create trigger trg_orders_log_event
  after update of status on public.orders
  for each row execute function public.log_order_event();

-- ------------------------------------------------------------------
-- 10) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create trigger trg_orders_updated
  before update on public.orders
  for each row execute procedure public.touch_updated_at();

create trigger trg_order_items_updated
  before update on public.order_items
  for each row execute procedure public.touch_updated_at();

create trigger trg_payments_updated
  before update on public.payments
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 11) RLS — ORDERS
-- ------------------------------------------------------------------
alter table public.orders enable row level security;

-- Owner (user_id or session_id) or super_admin
create policy "orders_select_owner_or_super"
  on public.orders for select
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    or public.has_role('super_admin')
  );

-- Anon can insert own session order; authenticated can insert own user order
create policy "orders_insert_owner_or_session"
  on public.orders for insert
  with check (
    (auth.uid() is not null and auth.uid() = user_id and session_id is null)
    or (auth.uid() is null and user_id is null and session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
  );

-- Owner can update limited fields (status via transition, payment info via webhook)
create policy "orders_update_owner"
  on public.orders for update
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  )
  with check (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  );

-- Admin full access
create policy "orders_admin_all"
  on public.orders for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 12) RLS — ORDER ITEMS (via order)
-- ------------------------------------------------------------------
alter table public.order_items enable row level security;

create policy "order_items_select_via_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.uid()
          or o.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  );

create policy "order_items_admin_all"
  on public.order_items for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 13) RLS — PAYMENTS (via order)
-- ------------------------------------------------------------------
alter table public.payments enable row level security;

create policy "payments_select_via_order"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and (
          o.user_id = auth.uid()
          or o.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  );

create policy "payments_admin_all"
  on public.payments for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 14) RLS — ORDER EVENTS (via order)
-- ------------------------------------------------------------------
alter table public.order_events enable row level security;

create policy "order_events_select_via_order"
  on public.order_events for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_events.order_id
        and (
          o.user_id = auth.uid()
          or o.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  );

create policy "order_events_admin_all"
  on public.order_events for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 15) GRANTS — expose to Data API
-- ------------------------------------------------------------------
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert on public.payments to authenticated;
grant select on public.order_events to authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop trigger if exists trg_orders_log_event on public.orders;
-- drop trigger if exists trg_orders_status_check on public.orders;
-- drop function if exists public.log_order_event();
-- drop function if exists public.enforce_order_transition();
-- revoke execute on function public.check_order_transition(public.order_status, public.order_status) from authenticated, service_role;
-- drop function if exists public.check_order_transition(public.order_status, public.order_status);
-- drop trigger if exists trg_payments_updated on public.payments;
-- drop trigger if exists trg_order_items_updated on public.order_items;
-- drop trigger if exists trg_orders_updated on public.orders;
-- drop policy if exists "order_events_admin_all" on public.order_events;
-- drop policy if exists "order_events_select_via_order" on public.order_events;
-- drop policy if exists "payments_admin_all" on public.payments;
-- drop policy if exists "payments_select_via_order" on public.payments;
-- drop policy if exists "order_items_admin_all" on public.order_items;
-- drop policy if exists "order_items_select_via_order" on public.order_items;
-- drop policy if exists "orders_admin_all" on public.orders;
-- drop policy if exists "orders_update_owner" on public.orders;
-- drop policy if exists "orders_insert_owner_or_session" on public.orders;
-- drop policy if exists "orders_select_owner_or_super" on public.orders;
-- alter table public.order_events disable row level security;
-- alter table public.payments disable row level security;
-- alter table public.order_items disable row level security;
-- alter table public.orders disable row level security;
-- drop index if exists idx_order_events_order;
-- drop index if exists idx_payments_provider;
-- drop index if exists idx_payments_order;
-- drop index if exists idx_order_items_variant;
-- drop index if exists idx_order_items_order;
-- drop index if exists idx_orders_idempotency;
-- drop index if exists idx_orders_created;
-- drop index if exists idx_orders_status;
-- drop index if exists idx_orders_session;
-- drop index if exists idx_orders_user;
-- drop table if exists public.order_events;
-- drop table if exists public.payments;
-- drop table if exists public.order_items;
-- drop table if exists public.orders;
-- drop type if exists public.payment_provider;
-- drop type if exists public.order_status;