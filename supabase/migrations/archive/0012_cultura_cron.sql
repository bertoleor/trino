-- 0012_cultura_cron.sql - T-E05 auto-import TikTok/IG via SocialProvider into draft, pg_cron daily 06:00 UTC + QStash CRON_SECRET + Upstash dedup hash
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $$ begin perform cron.unschedule('cultura-sync-daily'); exception when others then null; end $$;
select cron.schedule('cultura-sync-daily', '0 6 * * *', $$
  select net.http_post(url:='http://localhost/api/cron/cultura-sync', headers:='{"Authorization":"Bearer '||coalesce(current_setting('app.cron_secret', true),'')||'"}'::jsonb) from (select 1) s;
$$);
-- Upstash dedup hash handled in src/lib/social/cultura-sync.ts via seen Set + Redis in prod
-- SocialProvider draft manual approve: inserts with status='draft' social_source tiktok/instagram
