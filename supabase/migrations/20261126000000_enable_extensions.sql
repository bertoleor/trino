-- ============================================================
-- 20261126000000_enable_extensions.sql — Core extensions
-- ============================================================

-- UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- Trigram for fuzzy search (pg_trgm)
create extension if not exists pg_trgm with schema extensions;

-- Cron scheduler for pg_cron jobs
create extension if not exists pg_cron with schema pg_catalog;

-- HTTP client for pg_cron webhook calls
create extension if not exists pg_net with schema extensions;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop extension if exists pg_net;
-- drop extension if exists pg_cron;
-- drop extension if exists pg_trgm;
-- drop extension if exists "uuid-ossp";