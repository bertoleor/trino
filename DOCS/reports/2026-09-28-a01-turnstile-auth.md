# TRINO A-01 — Turnstile fail-closed en login/signup (brute-force auth)

> **Búsqueda:** keywords: `trino, a-01, turnstile, login, signup, brute-force, captcha, fail-closed, csp` · clasificación: `remediación-auditoría` · estado: canónico · actualizado: 2026-09-28

**Fecha:** 2026-09-28 (verificado con `date`)
**Ticket:** t_51c528c9 — [TRINO][A-01][HIGH] (parent t_15446fa4, auditoría Modo A 34-auditor)
**Rama:** `fix/a01-auth-turnstile` (stacked sobre `fix/ci-pnpm-version-and-keepalive` = PR #12)
**Commit:** 6d403f0 — receipt RDD `cf4a9ca83e7e` (10 files, frozen SHA pre-commit)
**Riesgo assess:** HIGH (hot_path: auth + security) — falla solo en: ruta sin gate captcha; runtime no elegible para RDD nativo (hermes) → receipt MVP firmado en `.rdd/receipt-cf4a9ca83e7e.json`

## Hallazgo (fuente: auditoría estática)

`src/proxy.ts:156-175` solo ejecutaba `verifyTurnstile` para POSTs a `/api/contact` o paths con `/reviews`. Login/signup son Server Actions (`src/app/auth/actions.ts`) — **postean a la URL de la página**, no a un path distinguishing: el middleware nunca las pudo gatear por path. Resultado: brute-force de credenciales frenado solo por el tier auth 5/15m por IP — además eludible (A-03/A-04, tickets hermanos).

Referencia: CWE-799 / OWASP A07:2021 (Identification and Authentication Failures).
Fuentes oficiales consultadas 2026-09-28:
- https://developers.cloudflare.com/turnstile/reference/content-security-policy/ (CSP: script-src + frame-src challenges.cloudflare.com)
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/ (server-side validation mandatory; render=explicit)

## Fix (qué/cómo)

1. **Gate fail-closed dentro de las actions** (`src/app/auth/actions.ts`): `login`/`signup` llaman `verifyAuthTurnstile(token)` ANTES de `signInWithPassword`/`signUp`. Token ausente/inválido → denegación con mensaje + `enqueueSecurityAudit('turnstile_403', ...)`. Sin llamada a Supabase → sin user-enumeration ni intento de credencial.
2. **Widget client** (`src/components/auth/turnstile-widget.tsx`): api.js oficial `?render=explicit`, `window.turnstile.render` con `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, callbacks latest-ref (cumple react-hooks/refs).
3. **Forms** (`login-form.tsx` / `signup-form.tsx`): hidden input `cf-turnstile-response` + widget + re-arm tras intento fallido (patrón render-time adjust, sin useEffect → pasa react-hooks/set-state-in-effect).
4. **CSP** (`src/lib/security/csp.ts`): `script-src ... https://challenges.cloudflare.com` + `frame-src https://challenges.cloudflare.com` (directiva oficial CF).
5. **Env** (`src/config/env.ts` + `.env.example`): `NEXT_PUBLIC_TURNSTILE_SITE_KEY` required en schema Zod.
6. **Tests**: `t-a01-auth-turnstile.test.ts` (14 casos behavior: fail-closed matrix, dummy-token immunity, audit) + `t-a01-auth-turnstile-guards.test.ts` (guards estáticos).

## Verificación (evidencia real)

- RED inicial: 12 failed / 2 passed (tests escritos primero)
- GREEN final: **528/528 vitest** (runs 3 y 4 con `--maxWorkers=1`; run 5: 527/528 con flake conocido de entorno `t-a02-gitignore` git-status race — pasa aislado, PC saturada)
- `npx eslint .` → 0 errores (sort-imports alfabético case-sensitive por primer nombre + multiple-antes-single descifrados a prueba de probe)
- `npx prettier --check .` → All matched files clean
- `npx tsc --noEmit` → 0 errores
- gitleaks commit 6d403f0 → **no leaks** (el único hit del history es fixture de test preexistente en ebf2ac7, fuera de scope)
- Pre-commit husky lint-staged → passed
- E2E de CI verificado: specs self-contained, no usan el login form → no rotos
- `gentle-ai review assess --base-ref 263cdb2` → **Risk: high** (hot_path auth+security), transición determinista del motor: stop rdd_disabled (runtime hermes no elegible) → receipt MVP firmado

## ⚠️ DEPLOY (owner): env obligatorio en prod

**Antes del deploy a producción, provisionar:**
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (sitekey del widget CF, dominio trino)
- `TURNSTILE_SECRET_KEY` (secret de siteverify CF)

Sin ambos, el login/signup queda bloqueado por diseño (fail-closed). Es la postura correcta de seguridad, pero requiere el alta de las claves en el host (Vercel/hosting vault) ANTES de que este fix llegue a prod. Cloudflare dashboard → Turnstile → crear widget para el dominio → copiar sitekey+secret.

## Decisiones (por qué)

- **Verificación dentro de la action, no en middleware**: Server Actions postean a la page URL; no hay path que gatear. La unica barrera posible es server-side dentro de la action.
- **Stack sobre PR #12**: mi PR depende de la unificación prettier/eslint (PR #12 MERGEABLE, CI verde). Basar en main generaba conflictos cosméticos en 5 archivos overlapeados. Stacked-to-main es la estrategia standing de la flota.
- **Sitekey required en boot schema**: sitekey ausente + verify fail-closed = login bricked silencioso; boot-fail es el fallo lindo. (El schema solo aplica cuando `env` proxy se consume; el widget lee `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` directo inlineado por Next en build.)
- **max-lines 150**: spec partido en behavior + guards (misma convención slice-B del repo).

## Hotspot flag

`src/app/auth/actions.ts` + `.env.example` + `t-a03-env.test.ts` — también tocados por PR #12 (abierto). Mi PR es stacked sobre él: merge PR #12 primero, este después.
