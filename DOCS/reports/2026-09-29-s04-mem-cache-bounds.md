# TRINO S-04 — Maps de cache en-memoria unbounded sin eviction (OOM DoS)

> **Búsqueda:** keywords: `trino, s-04, unbounded-map, cwe-400, cwe-770, eviction, bounded-map, fifo` · clasificación: `remediación-auditoría` · estado: canónico · actualizado: 2026-09-29

**Fecha:** 2026-09-29 (verificado con `date`)
**Ticket:** t_fa5a4c6a — [TRINO][S-04][MEDIUM] (parent t_15446fa4, auditoría Modo A 34-auditor)
**Rama:** `fix/s04-mem-cache-bounds` (base f1acd4d = `fix/a01-auth-turnstile`)
**Commit:** e930919 — receipt RDD `ec0f9e73ca81` (6 files, frozen SHA pre-commit)
**Riesgo assess:** MEDIUM por defecto del hallazgo; assess no ejecutado en runtime (ver “Verificación”): fix defensivo de memoria, sin rutas auth/pagos/db en el diff → passive boundary, receipt MVP firmado

## Hallazgo (fuente: auditoría estática)

Cinco Maps module-level sin bound ni eviction; las entradas solo expiraban lazy en lectura. Bajo tráfico sostenido con keys distintas (session-id × postal × hash), crecimiento sin límite hasta OOM en instancia long-running. Referencia: CWE-400 / CWE-770.

**Estado por sitio contra HEAD (verificado antes de tocar):**

| Sitio (citado) | Estado real en f1acd4d | Bound |
|---|---|---|
| `src/lib/shipping/cache.ts:15` | Bounded por S-01 (commit 327d609): `MAX_MEM_ENTRIES=1000` + FIFO `evictIfNeeded()` en cada `cacheSet` | ✓ previo |
| `src/lib/rate-limit.ts:17` memoryStore | Bounded por hermano A-04 (commit 233a354): extraído a `src/lib/rate-limit/memory-store.ts`, `MEMORY_STORE_CAP=1000` + purge TTL + oldest-first | ✓ previo |
| `src/lib/cultura-sync.ts:11` | **Path citado inexistente**; el real es `src/lib/social/cultura-sync.ts` — bounded por hermano S-05 (commit f1acd4d): `MAX_MEM_DEDUP=1000` + FIFO | ✓ previo |
| `src/lib/shipping/index.ts:10` MEM | **Unbounded** — corregido acá | ✓ este fix |
| `src/lib/shipping/carriers/international.ts:8` MEM | **Unbounded** — corregido acá | ✓ este fix |

Barrido colateral (`new Map<` full-src): `social/graph.ts:13` (keys por enum de 3 plataformas, `clearSocialCache` exportado — bounded de facto, out of scope), `shipping/labels.ts` (Maps function-local/transientes), `rate-limit.ts:60 limiterCache` (6 tiers estáticos).

## Fix (qué/cómo)

1. **Helper compartido `src/lib/bounded-map.ts`**: `MAX_RATE_MEM_ENTRIES = 1000` (única declaración — doctrina S-02 de single source of truth para bounds) + `evictOldestIfNeeded(map)` FIFO por insertion order del Map (precedente S-01 cache.ts).
2. **Wire en los 5 sitios `MEM.set`**: 2 en `index.ts` (éxito de carrier + fallback total) y 3 en `international.ts` (flag-off, éxito DHL, fail DHL). Eviction inmediatamente antes de cada insert — el guard test fija `evictions == sets`.
3. **Cap re-exportado** desde ambos módulos + **exports de observabilidad** (`clearShippingMem`/`shippingMemSize`/`clearIntlMem`/`intlMemSize`) para que la suite resetee/inspeccione sin exponer el Map.

## Verificación (evidencia real)

- RED (forma final): `Tests 6 failed (6)` — 2026-09-29 05:44, worktree s04
- GREEN: `Tests 6 passed (6)` — 05:58; re-verificado 6/6 post-prettier (06:34)
- Suite completa en worktree: 551/552 — único fallado `t-g02-reviews` timeout 5s = flake de carga del host (pasa aislado 4/4 dos veces; corridas full subsecuentes mostraron flakes no-determinísticos en sets disjuntos, todos pasando aislados — patrón documentado en ODD S-01 para este host)
- Guards que leen los archivos tocados: `t-imports-guard` + `t-s1-hygiene` 10/10 verdes aislados
- `tsc --noEmit` → 0 errores · `eslint <4 archivos>` → 0 · `prettier --check <4>` → canonical
- Receipt MVP: `.rdd/receipt-ec0f9e73ca81.json` (frozen SHA del staging pre-commit, 6 files)
- `gentle-ai review assess` no ejecutado en runtime: el diff no toca auth/pagos/db/RLS (<400 líneas, 248) — per doctrina queda en passive boundary con receipt firmado

## ⚠️ Hotspot flag (para merge)

`src/lib/shipping/index.ts` + `src/lib/shipping/carriers/international.ts` — hermanos S-02 (zod bound en lib boundary) y S-03 (shippingHash key) tenían esos archivos dirty mid-flight en el checkout principal. Este fix se ejecutó en worktree aislado `.worktrees/s04` para no barrer su trabajo. Regiones de diff disjuntas (hermanos: imports/hash; S-04: cap+eviction): merge de `fix/s04-mem-cache-bounds` debería auto-resolver; si conflictúa, síntesis = conservar líneas import/hash del hermano + la línea `evictOldestIfNeeded(MEM)` sobre cada `MEM.set`.

## Decisiones (por qué)

- **Helper compartido vs copia inline #4/#5**: mecanismo único auditable + diff mínimo en los dos archivos hotspot (menor riesgo de conflicto con hermanos in-flight).
- **Cap 1000**: consistente con los tres precedentes del repo (S-01, A-04, S-05) — una sola política de bound.
- **FIFO, no LRU**: entradas de 60s-TTL de quotes de envío; oldest-first es suficiente para un working set bounded (misma decisión aceptada en S-01).
- **TTL lazy en lectura sin sweeper**: a cap 1000 el worst case de memoria es acotado y chico; un sweeper agrega complejidad sin ganancia medible.
- **No duplicar A-04/S-05**: sus fixes ya están en ramas propias; re-implementar acá generaría merge conflicts y doble-ticketing (gate anti-duplicados).

## Next step

- Merge `fix/s04-mem-cache-bounds` después de que aterricen los commits de S-02/S-03 en el checkout principal (auto-merge esperado por regiones disjuntas).
