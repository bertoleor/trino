# Changelog — TRINO

> UNVERIFIED — reconstructed from `git log --oneline` 2026-09-12. Not a release record.

## Unreleased (audit baseline @ ebf2ac7, main)

- SDD project-state persist batch (319 files)
- SDD 2.3/2.4/3.2 + verification 10/10
- Shipping: SSE batch ReadableStream grouped postal_code, requireRole editor; labels
  groupByPostalCode p-limit A4/ZPL
- Customer360 single-join LTV view RPC fallback + p95 metric
- Realtime auth-sync BroadcastChannel + storage fallback (<1s); e2e two-tab
- RLS two-role integration (has_role DEFINER, anon A!=B 403)
- Headers: private no-cache/no-store admin/account/api/catalog s-maxage
- Proxy deny-default hierarchy gate 403 (security_logs, audit_logs)
- Auth roles hierarchy hasRole/requireRole/isEditorOrAbove

## 0.1.0 — initial scaffold

- Next.js 16 + React 19 + Tailwind 4 + next-intl (es-AR/en/fr/pt-BR) + Supabase SSR + Upstash + Zod
  4
