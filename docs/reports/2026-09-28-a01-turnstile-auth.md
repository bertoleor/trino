# TRINO A-01 — Turnstile fail-closed en login/signup (brute-force auth)

> **Búsqueda:** keywords: `trino, a-01, turnstile, login, signup, brute-force, captcha, fail-closed, csp, onload, widget` · clasificación: `remediación-auditoría` · estado: canónico · actualizado: 2026-09-29

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

## Review round 1 (34-auditor, run 895) — defecto F1 y rework

**Veredicto: REQUEST CHANGES.** Gate server-side aprobado con evidencia (14/14 tests A-01, fail-closed antes de signIn/signUp, CSP oficial, receipt cf4a9ca83e7e verificado). Pero el widget client tenía un defecto BLOCKER que el handoff no ejercitó en runtime:

- **F1 [BLOCKER]** `turnstile-widget.tsx` — `loadTurnstile()` nunca resolvía: la promesa solo resolvía vía `window.onA01TurnstileLoad`, pero `SCRIPT_SRC` no declaraba `&onload=onA01TurnstileLoad` (mecanismo oficial CF), y api.js jamás invoca un global no declarado en `&onload=`. Evidencia empírica del reviewer (browser real vs api.js): sin el param, `turnstileGlobal:true` pero `callbackFired:false` tras 12s. Consecuencia: primer mount → promesa eterna → `turnstile.render` nunca corre → nunca hay token → `disabled={pending || !token}` deja Entrar/Registrarme deshabilitados para siempre. **Login y signup bricked en prod.** Defecto adicional detectado en rework: el branch "script ya existe" pisaba el callback del waiter anterior, rompiendo también remounts (key-bump tras intento fallido).
- **F2 [REQ]** Sin regression guard que exigiera `&onload=` en el SRC.
- **F3 [REQ]** Este reporte no registraba el defecto (trazabilidad).

**Fix (commit de rework, rama `fix/a01-auth-turnstile`):**
1. `SCRIPT_SRC` ahora declara `&onload=onA01TurnstileLoad` — el mecanismo oficial ("Using onload callback", developers.cloudflare.com/turnstile/get-started/client-side-rendering/).
2. Loader single-flight: promesa compartida a nivel módulo (`turnstileLoader`) — un mount en vuelo no puede perder su waiter, los remounts reusan el script, y `onerror` libera el slot para retry. `window.turnstile` ya presente → resolve inmediato.
3. Guards nuevos en `t-a01-auth-turnstile-guards.test.ts`: (a) SRC exige `&onload=onA01TurnstileLoad`; (b) single-flight (`turnstileLoader` module-level, reuse, free-on-error).
4. **E2E smoke** `tests/e2e/a01-turnstile-onload.spec.ts`: extrae el `SCRIPT_SRC` real del componente, sirve una página con el mecanismo del widget y sitekey testing CF `1x00000000000000000000AA`, y contra **api.js real de Cloudflare** asevera la cadena completa: onload callback dispara → `turnstile.render` → token callback → submit habilitado. RED contra el código defectuoso (falla en el guard del SRC), GREEN con el fix (passed 16.9s). Es el repro A/B del reviewer automatizado y permanente.

**Evidencia del rework:** unit RED 2 failed → GREEN 9/9; e2e RED (guard del SRC) → GREEN 1 passed vs api.js real.

## Rework round 2 — verificación final (2026-09-29)

- Commit: `b3ebcff` (rama `fix/a01-auth-turnstile`, stacked; base 399f740 = head PR al momento del rework). +162/−11, 4 files: widget, guards, e2e spec nuevo, este reporte.
- Suite completa: **561/561 vitest passed** (`--maxWorkers=1`, 339s) — 101 files.
- E2E playwright: **4/4 passed** (a01-turnstile-onload + auth-sync × 3) — el smoke contra api.js real de Cloudflare pasó 2 veces (21.2s, 16.9s).
- `npx tsc --noEmit` → 0 errores; `npx eslint <4 files>` → 0; `prettier --check <4 files>` → clean.
- gitleaks commit b3ebcff → **no leaks**.
- RDD: assess → Risk: **high** (hot_path auth), transición del motor: stop `rdd_disabled` (runtime hermes no elegible) → receipt MVP `receipt-78a51052c30a.json` firmado sobre el staging frozen (4 files), copiado a `.rdd/` del checkout principal.
- PR #14 head actualizado a b3ebcff, **MERGEABLE**, Vercel deploy en curso. CI de GitHub Actions roto a nivel repo (PR #12 lo repara; merge PR #12 → luego este).
- Decisiones de rework: (1) e2e smoke = repro A/B del reviewer automatizado, self-contained via route-fulfill + api.js real de CF + sitekey testing `1x00000000000000000000AA` — no requiere server de Next ni jsdom (evita tocar el lockfile, conflicto abierto con PR #12); (2) unit jsdom del loader descartado por lo mismo; (3) loader single-flight a nivel módulo cubre tanto primer mount como remounts por key-bump.
