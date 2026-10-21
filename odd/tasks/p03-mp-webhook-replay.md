> **Búsqueda:** keywords: `p03, webhook, mercadopago, replay, hmac, timestamp, tolerancia, cwe-294, cwe-384, owasp-a02` · clasificación: `odd-feature` · estado: closed · actualizado: 2026-10-21

# ODD Feature — p03-mp-webhook-replay

## Objective
Cerrar el hallazgo P-03: la firma `t=<ts>,v1=<hmac>` del webhook de MercadoPago se verifica por HMAC pero su timestamp jamás se contrasta contra el reloj del servidor, así que un request capturado con firma válida se puede reinyectar (replay) indefinidamente — `processed_events` solo deduplica event ids exactos.

## Problem / Why
Audit finding P-03 (MEDIUM, STATIC, 34-auditor, 2026-09-17, ticket t_b40a581d): `verifyHmac` parseaba `t` y firmaba `${t}.${payload}` pero nunca chequeaba frescura (CWE-294/384 / OWASP A02). Peor: un sobre SIN `t` caía en el fallback `v1 ?? header` y se aceptaba un HMAC del payload pelado — firma sin timestamp = replay sin NINGÚN límite temporal. Los tests legacy codificaban ambos comportamientos (t-c02 firmaba con `1710000000` fijo; t-s03:32 afirmaba que el fallback sin-`t` era VÁLIDO), o sea la vulnerabilidad estaba pinned como contrato.

## Scope
- In: `src/app/api/webhooks/mercadopago/route.ts` (guard de ventana en `verifyHmac` + `MERCADOPAGO_SIG_TOLERANCE_SECONDS`), `tests/unit/t-p03-mp-webhook-replay.test.ts` (nuevo), `tests/unit/t-c02-webhook.test.ts` y `tests/unit/t-s03-security.test.ts` (timestamps frescos + aserción invertida del fallback), `.changeset/p03-mp-webhook-replay.md`.
- Out: el esquema de firma real de MP (`ts=`/manifest `id:...;request:...;ts:...`) — es otro hallazgo de la misma familia que el sobre actual ni siquiera matchea el de producción; P-03 scopea SOLO frescura. También out: rutas stripe (P-01, ya fixeada en e3176d8) y paypal (P-02), proxy/CORS, DLQ.

## Constraints
- Strict TDD: RED primero (`t-p03` 5 failing / 2 passing sobre código pre-cambio), luego implementación mínima, luego GREEN.
- vitest runner, `TEMP=E:/temp` (Windows), `tsc --noEmit` 0, prettier check 0. ESLint gate bloqueado por toolchain PREEXISTENTE (ver Verification).
- Contrato idéntico al sibling P-01 Stripe: tolerancia ±300s (`STRIPE_SIG_TOLERANCE_SECONDS` ↔ `MERCADOPAGO_SIG_TOLERANCE_SECONDS`).

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-p03-mp-webhook-replay.test.ts` (7 contract tests)
  - evidence: `vitest run tests/unit/t-p03-mp-webhook-replay.test.ts` → `Tests 5 failed | 2 passed (7)` (2026-10-21, worktree .worktrees/p03): stale -600s → 200 (vulnerable), future +600s → 200, sin-`t` → 200, `t` no-numérico → 200, `MERCADOPAGO_SIG_TOLERANCE_SECONDS` undefined. La vulnerabilidad quedó reproducida en vivo.
- [x] T2: implementación — en `verifyHmac`: `t` obligatorio (`/^\d+$/`), `Math.abs(now - ts) > 300` → reject 401 antes de cualquier trabajo DB; export `MERCADOPAGO_SIG_TOLERANCE_SECONDS = 300`; muere el ternario `parsed.t ? \`${t}.${payload}\` : payload` (el branch sin-`t` era el fallback del replay). POST no cambia (el guard vive en el verify; complejidad de POST intacta, disable COMP-3 intacto).
  - evidence: trío `t-p03` + `t-c02` + `t-s03` → `Test Files 3 passed (3), Tests 20 passed (20)` (2 corridas: 05:46 y 05:53)
- [x] T3: tests legacy actualizados al contrato nuevo — t-c02 firma con `String(Math.floor(Date.now()/1000))` (antes `1710000000`/`1710000001`/`1700000000` fijos); t-s03:32 invertido de "handles header without t prefix fallback" (esperaba true) a "rejects a signature without t (audit P-03: unbounded replay)" (espera false).
  - evidence: mismo trío 20/20; en-suite: los 3 archivos verdes dentro de la corrida full (abajo)
- [x] T4: changeset `.changeset/p03-mp-webhook-replay.md` (patch, `@santisima-trinidad/lockfile`)

## Verification
- `vitest run` (suite completa, 111 files): `Tests 13 failed | 596 passed | 7 skipped (616)` — las 13 fallas son TODAS clase ambiental (spawnSync cmd.exe ETIMEDOUT, hook timeout 300000ms, test timeout 5000ms en import) sobre archivos SIN relación con el diff (auth-sync, t-a02-gitignore, t-c04-proxy, t-csp-drift-guard, t-imports-guard, t-prettier-guard, t-d01c, t-d03b, t-s1, t-s2, t-s07). Mis 3 archivos de test pasaron VERDES dentro de esa misma corrida. El host (4 vCPU, flota residente) spawneó 111 workers → contención. Batch de re-verificación de los 11 archivos: ver card.
- `tsc --noEmit` → exit 0 (typescript 7.0.2)
- `prettier --check` sobre los 5 archivos del diff → "All matched files use Prettier code style!"
- **ESLint: bloqueado por toolchain PREEXISTENTE, no por este cambio.** `eslint <cualquier-archivo>` muere con `typescript-eslint does not support TS 7.0` (typescript 7.0.2 vs typescript-eslint — tracking typescript-eslint#10940). Reproducido idéntico en `src/lib/logger.ts`, archivo jamás tocado por este diff. Además: `pnpm-lock.yaml` de main está desincronizado de su `package.json` (specifiers: supabase ^2.112.4 vs ^2.117.1, zod ^4.5.4 vs ^4.6.5, resend, tailwind-merge, react-query) — un install fresco re-resuelve y produce ese TS 7.0.2. El lockfile NO forma parte de este commit (se deja como estaba en main); el desync se escala al lane SRE (FLEET-STABLE).
- `gitleaks protect --staged` (v8.30.1) sobre el commit → limpio (evidencia en la card)
- Pre-commit hook del repo (`npx lint-staged || true`) no bloquea ni corre gitleaks; el gate de secretos se suple manual con gitleaks.

## Regression risk
- Bajo: el único caller de `verifyHmac`/`parseSignature` es la propia ruta (grep 2026-10-21). El 413 (size) y el 401 (firma) preceden a todo trabajo DB y no cambian de orden. dedup `processed_events` intocado (t-c02 dedup test verde).
