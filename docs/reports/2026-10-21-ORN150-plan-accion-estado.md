# Plan de acción ORN-150 — estado verificado y ruteo (2026-10-21)

> **Fecha:** 2026-10-21 · **Autor:** 24-orquestador (card kanban t_47855617, run 1532) · **Motivo:** Linear ORN-150 "[TRINO] plan de accion 2026-09-14" — ejecutar el plan de los 4 ítems del 14-09 (política devoluciones por categoría pre-checkout, categorías de lanzamiento 3-4, flujo mayoristas, home hero geométrico). Este doc actualiza `plan-accion-2026-09-12.md` con el estado REAL verificado de cada ítem y su ruteo.
> **Búsqueda:** keywords: `trino, orn-150, plan de accion, hero geometrico, devoluciones por categoria, categorias de lanzamiento, mayoristas, gate fase 1, pre-checkout` · clasificación: `plan-accion` · estado: `canónico` · actualizado: 2026-10-21
> **Gemelos Linear:** ORN-150 (umbrella) · ORN-91 devoluciones · ORN-92 categorías (ORN-176 = dup declarado por la owner 14-09) · ORN-93 mayoristas (ORN-177 = dup) · ORN-178 hero (Done 20-10) · Fuente del plan original: `plan-accion-2026-09-12.md` (mudanza raíz→docs/ = ORN-218)

## Resumen

Los 4 ítems tienen trabajo real detrás pero **ninguno llegó a main**: el hero geométrico está implementado y verificado en rama (sin PR), y las 3 decisiones Fase 1 siguen **sin firma del owner** — el gate que bloquea el diseño del checkout desde el 2026-09-19 (due original del plan). Acciones 2026-10-21: brief consolidado de las 3 decisiones al owner (Telegram), card `t_c66c92b2` (01-frontend) para landear el hero gated al fix del CI (`t_6ec623de`), y las 3 cards de implementación a `needs_input` hasta el OK.

## 1. Estado verificado por ítem (receipts, 2026-10-21)

| # | Ítem | Estado real | Evidencia |
|---|---|---|---|
| 1 | **Política devoluciones por categoría** | ⛔ Decisión owner nunca presentada (hasta hoy); páginas legales inexistentes | `DOCS/legal/03-pages-coverage.md`: L-04 `/cambios-devoluciones` ❌ crear ("Gap — prioridad ALTA"), L-05 `/envios` ❌ crear ("**bloquea checkout**"); draft de política en `DOCS/marca.md` §8.2 (velas encendidas / inciensos abiertos / aceites abiertos NO retornables); stub en `TERMS.md` (art. 34, 10 días). Card: t_0db4857c [ORN-91] |
| 2 | **Categorías de lanzamiento 3-4** | ⏳ Propuesta enviada al owner 16-10 (Telegram msg 966, opción a: tarot-astrología, cristaloterapia, chamanismo, espiritualidad-general) — sin respuesta; DB viva con 0 categorías y 0 productos | Comment ORN-92 16-10; engram `trino/categorias-lanzamiento` #1621; PostgREST anon `*/0`. Cards: t_bf70f5a7 [ORN-92] + t_8c010ba4 [ORN-176, histórico de la propuesta] |
| 3 | **Flujo mayoristas** | ⛔ 0 código, 0 propuesta (hasta hoy) | grep `mayorista` → solo docs (plan/marca/reporte); design recomendado: bandeja backoffice no automática + listas de precio por tipo de cliente (reporte 09-12 §1.4). Card: t_10621df9 [ORN-93] |
| 4 | **Home hero geométrico** | ✅ Decisión cerrada + implementado y verificado en rama · ⛔ sin PR ni merge | Decisión: ORN-178 Done 20-10. Rama `feat/hero-geometrico-home` = `a78b4d7` (1 commit sobre df51a5b, "All tests pass, design-QA gate constraints satisfied"); `gh pr list` sin PR de hero; `git log origin/main..feat/hero-geometrico-home` = solo a78b4d7. Card done previa: t_b11acb91 (01-frontend). Nueva card de landing: t_c66c92b2 |

## 2. Bloqueador transversal — CI rojo (2026-10-21)

`eslint` crashea al cargar config en TODOS los PRs (typescript-eslint 8.69.0 no soporta TS 7.0.2 del lockfile). Fix despachado hoy: **t_6ec623de** (P1, 16-backend: downgrade typescript ~6.0.3 + lockfile regenerado) — en requeue tras 3 crashes de gateway. Gates rojos adicionales con cards propias gated: Security Scan / pnpm audit (t_283025e1, 13-security) y Supabase Types Drift Guard (t_216aefc4, 04-data-engineer). **Nada mergea con CI verde hasta que t_6ec623de aterrice** — por eso la card del hero está gated en ella.

## 3. Plan de acción (despachado 2026-10-21)

1. **Decisiones Fase 1 al owner (gate humano)** — brief consolidado por Telegram con recomendación a-a-a: (1) categorías = re-envío msg 966; (2) devoluciones = firma del draft marca.md §8.2 (arrepentimiento 10 días solo productos sin abrir + no-retornables por higiene + flete a cargo del cliente); (3) mayoristas = aprobación manual por bandeja backoffice + listas de precio por tipo de cliente. Sin las 3 firmadas no se diseña checkout (gate del plan original).
2. **Hero a main** — card t_c66c92b2 (01-frontend, P2, gated t_6ec623de): merge origin/main dentro de la rama, checks con receipts, PR + merge con autoridad delegada, deploy Vercel post-merge.
3. **Post-OK del owner** (cards ya existen, hoy a needs_input):
   - t_0db4857c [ORN-91]: páginas legales L-04 `/cambios-devoluciones` + L-05 `/envios` con la política firmada por categoría (P1: bloquea checkout) + wiring de la política en checkout.
   - t_bf70f5a7 [ORN-92]: wiring de las 3-4 categorías de lanzamiento (home/PLP/quiz "elegí tu camino").
   - t_10621df9 [ORN-93]: diseño + backend del flujo mayorista (bandeja de aprobación + listas de precio).
4. **Linear** — ORN-150 pasa a In Progress con este plan como comment de trazabilidad.

## 4. Ruteo kanban (board default)

| Trabajo | Card | Asignee | Estado tras esta corrida | Gate |
|---|---|---|---|---|
| Landear hero (PR+merge) | t_c66c92b2 | 01-frontend | todo (gated) | t_6ec623de merged |
| Decisión+impl devoluciones | t_0db4857c | 24-orquestador | needs_input | Telegram 21-10 (a2) |
| Decisión+wiring categorías | t_bf70f5a7 | 24-orquestador | needs_input | Telegram 21-10 (a1) |
| Decisión+diseño mayoristas | t_10621df9 | 24-orquestador | needs_input | Telegram 21-10 (a3) |
| Histórico propuesta categorías | t_8c010ba4 [ORN-176 dup] | 24-orquestador | needs_input (ya estaba) | — |
| Fix CI lint (bloquea todo merge) | t_6ec623de | 16-backend | requeue del dispatcher | — |

## 5. Fuera de scope de este plan

- **ORN-94** glosario + calendario ritual + quiz (Fase 3 del plan original) — card t_8c23b370 ready, se despacha en la fase siguiente (loop ORN-105).
- Mudanza de `plan-accion-2026-09-12.md` raíz→docs/ y fleet-wide plan docs = **ORN-218** (PM docs-infaltables); higiene DOCS→docs = ORN-224 (In Review).
- ORN-175/176/177: duplicados declarados por la owner el 14-09 — los canónicos son ORN-91/92/93; no se re-abren mirrors.
- Estrategia de lanzamiento/comercialización: la fase 2 de contenido (feed @holatrino, prueba social) entra con ORN-94.

*Generado por 24-orquestador · card t_47855617 · receipt de verificación: git a78b4d7/origin/main, gh pr list 21-10, Linear searchIssues 21-10, DOCS/legal coverage matrix.*
