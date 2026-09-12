# ADR-0001 — Next.js 16 + Supabase SSR + Upstash (UNVERIFIED)

- Status: accepted (reconstructed 2026-09-12 from package.json + src/proxy.ts + supabase/)
- Context: high-end e-commerce needs SSR/RLS, rate-limit, i18n routing.
- Decision: Next.js 16 App Router, @supabase/ssr, Upstash Redis ratelimit, next-intl, Zod 4, TanStack Query.
- Consequences: vendor coupling (Supabase/Upstash/Vercel); needs key rotation + RLS tests (exist in tests/integration).
