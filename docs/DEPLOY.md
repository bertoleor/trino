# Deploy — santisima-trinidad

Cost-zero high-end e-commerce deployment guide.

## Domain

Two domains serve the same Next.js app: `santisima-trinidad.com.ar` (primary) and `santisima-trinidad.com` (global).

- `santisima-trinidad.com.ar`: manage DNS at NIC Argentina. Add CNAME `www` -> `cname.vercel-dns.com` and root ALIAS/ANAME or A via NIC panel redirect to Vercel.
- `santisima-trinidad.com`: manage DNS at Namecheap. Add CNAME `www` -> `cname.vercel-dns.com` and URL redirect record for apex via Namecheap Advanced DNS. Both .com.ar and .com point to Vercel.
- In Vercel Dashboard: Add domains both entries, set `santisima-trinidad.com.ar` as primary, enable automatic redirect com -> com.ar if desired. Verify CNAME propagation via `dig`.

## SSL

- SSL is auto-provisioned by Vercel via Let's Encrypt for every domain added. No manual cert.
- Auto renewal before expiry, HSTS enforced via `next.config.ts` `Strict-Transport-Security: max-age=63072000`.
- Force HTTPS redirect in Vercel project settings.

## Cron

- Vercel Cron (free tier 100 executions per day) defined in `vercel.json` `crons` array.
- Example: `POST /api/cron/keepalive` every 6h and daily `06:00 UTC` cultura sync. Config via `vercel.json` `schedule` cron expressions.
- Each cron must return 200 within 10s; logs visible in Vercel Functions logs. Requires `CRON_SECRET` bearer auth.
- Alternate: GitHub Actions fallback if Vercel limit exceeded.

## Keepalive

- Supabase free tier pauses after 7 days inactivity. Keepalive prevents pause.
- `supabase/migrations/0009_cron_keepalive.sql` enables `pg_cron` extension and schedules heartbeat `SELECT 1` every 6 hours via `cron.schedule`.
- pg_cron heartbeat: `SELECT cron.schedule('keepalive-heartbeat', '0 */6 * * *', $$SELECT 1$$)`.
- Vercel Crons also hit `/api/cron/keepalive` which executes `SELECT 1` via service role. Success logged to `keepalive_logs`.
- Monitor: UptimeRobot 5 min HTTP check + Vercel Cron 04:00 UTC daily. If heartbeat fails, DLQ replay.

## Rollback

- `vercel rollback` to previous deployment in <1s via Dashboard or CLI.
- DB migrations use expand/contract, no destructive revert needed. DLQ `failed_webhooks_log` replay.
- Kill switch flag `new_checkout_active` off -> health 200 -> notify. Trigger: 5% error 2min or p95>3s.
- Post-mortem within 48h.
