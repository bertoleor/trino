> Part of: [[INDICE-SISTEMA]] · Related: [[plan-accion-2026-09-12]], [[DOCS/marca]], [[DOCS/funciones]], [[DOCS/catalog/README]]

# ODD Feature — orn-94-glosario-calendario-quiz

> **Búsqueda:** keywords: `orn-94, glosario, glossary, calendario lunar, ritual calendar, quiz, elegi tu camino, cultura, seo, trino` · clasificación: `odd-feature` · estado: in-progress · actualizado: 2026-10-22
> Linear mirror: ORN-94 · Kanban parent: t_8c23b370 · Type: feature (ODD pesado) · Created by: 24-orquestador

## Objective

Ship ORN-94: the content/SEO discovery channel for trino — a glossary/mini-encyclopedia (10+ entries), a public ritual/lunar calendar, and the "elegí tu camino" quiz — meeting the Fase 3 gate of `plan-accion-2026-09-12.md` ("glosario con 10 entradas + calendario publicados").

## Problem / Why

- The Fase 3 gate is 100% unmet as of 2026-10-22: `cultura_posts` has **0 rows** in production (verified via Supabase Management API, ref `asbyqyxrpfggxjujfqte`: `select status, count(*) group by status` → `[]`).
- Quiz and public lunar/ritual calendar have **0 code** (grep `quiz|lunar` over `src/` → no matches; only the admin editorial calendar exists).
- Content/SEO is the largest organic acquisition channel for this niche (marca.md §110; funciones.md: "canal SEO orgánico principal del rubro (no fase 3)"). Three docs recommend MVP inclusion — the "MVP o fase 2, decide dueño" note in the plan is a launch-scope question, not a build blocker (see D7).
- The platform half already exists: `cultura_posts` (FTS `search_vector` GIN, tags GIN, RLS anon-read-published, `social_source` incl. `manual`), routes `/cultura` + `/cultura/[slug]`, `articleJsonLd`, admin editorial calendar + bulk publish, social sync cron. Only content + 3 pages are missing.

## Scope

- In:
  - Content pack (es-AR master): 10+ glossary entries extending `docs/catalog/cultura-20-template.csv`; ritual-dates dataset; quiz copy (questions, options → intencion mapping, results, tarot/healing disclaimers) + short-string translations for en/fr/pt-BR.
  - Pages: `/cultura/glosario` (alphabetical index of tag `glosario` entries, definition cards), `/cultura/calendario` (lunar phases computed + ritual dates), `/cultura/quiz` (3-4 questions → intencion scoring → recommendations + disclaimers).
  - i18n: new `cultura` namespace × 4 locales (en/es-AR/fr/pt-BR), zero drift (missing-keys-report cron).
  - Idempotent import of CSV rows into `cultura_posts` (upsert by slug).
- Out:
  - Category wiring + home/PLP/quiz entry points → ORN-92 card t_bf70f5a7 (blocked on owner decision since 2026-10-16).
  - Opt-in "hoy es luna llena" notifications → future (needs the notification center).
  - Glossary translations to en/fr/pt-BR → later (cultura_posts is one row per locale; es-AR first, same as catalog plan).
  - @holatrino feed + social proof → separate home lane.
  - Any new DB table or migration → none needed (D1).

## Constraints

- TDD strict (red-green-refactor), runner `pnpm test` (vitest, TEMP redirect built into the script), e2e playwright only if touched flows require it.
- Voice: lowercase ALWAYS + second person ("tu ritual", "elegí tu carta"), calm curated tone, no aggressive sales, no tradition hierarchy, multi-belief respectful (marca.md §7/§9; lowercase enforced via CSS + copy).
- Design tokens official only — never invent colors (Neo-Bauhaus palette, tokens in repo).
- `intencion` taxonomy is CLOSED: 7 values from `DOCS/catalog/README.md` §1 (amor, proteccion, abundancia, limpieza-energetica, sueno-descanso, conexion-espiritual, duelo-sanacion). Quiz options must map onto these.
- i18n: 4 locales, no missing keys (drift cron + `tests/unit` CSP/drift guards pattern).
- CSP: `/cultura/:path*` is already in the static-allowlist (`next.config.ts`) — new pages stay under `/cultura/`.
- Reserved slugs in `cultura_posts`: `glosario`, `calendario`, `quiz` (static segments beat `[slug]` in Next.js).
- Branches off `origin/main` ONLY (local main is known-diverged); host pnpm quirk: `NODE_OPTIONS=--dns-result-order=ipv4first pnpm install --store-dir <repo>/.pnpm-store-local --prefer-offline`, validate with `--frozen-lockfile`.
- Merge gate: CI lint fix t_6ec623de (P1, blocked) — eslint crashes on ALL PRs (typescript-eslint 8.69.0 vs TS 7.0.2). Develop on branch; PR + merge only after it lands.
- File deletions via `python E:/Hermes/scripts/trash.py <path> --agent <n> --reason "..."` — never raw rm.

## Decisions (orchestrator, 2026-10-22)

- **D1 — No new table/migration.** Glossary rides `cultura_posts` with `tags @> ['glosario']`. Schema (0011_cultura.sql) already covers FTS, tags, RLS, manual source. Rationale: Fase 3 gate says "glosario con 10 entradas", not "glosario con schema propio"; import + index are the only deltas.
- **D2 — Routing.** `/cultura/glosario`, `/cultura/calendario`, `/cultura/quiz`. All public, static-CSP covered, ISR (revalidate 300 like /cultura). Reserve those 3 slugs.
- **D3 — Lunar phases computed**, not fetched: pure function in `src/lib/cultura/lunar.ts` (synodic-month algorithm), unit-tested; no external API, no runtime network.
- **D4 — Ritual dates = dataset** (from content pack) rendered by the calendar page; es-AR MVP.
- **D5 — Quiz scoring → intencion** (closed taxonomy); result CTA → `/tienda?intencion=<top>` (PLP intencion facet exists) + cross-links to glossary entries by tag. Final category wiring stays with ORN-92/t_bf70f5a7. Disclaimers (tarot/healing ≠ treatment) shown on results.
- **D6 — Content lands via idempotent import script** (upsert by slug into `cultura_posts`, admin can republish later). NOT manual admin entry (not auditable). `cover_image` optional — index cards already render a no-cover fallback; never invent images.
- **D7 — MVP vs fase 2** (plan's "decide dueño"): treated as launch-scope ratification, surfaced to the owner with the standing decisions brief; build proceeds under the documented MVP recommendation (report 2026-09-12 §4, marca.md §110/§120, funciones.md).
- **D8 — Locale fix rides along.** `/cultura/page.tsx` list currently ignores `locale` (verified 2026-10-22); the new pages filter by active locale, and the glosario index fixes the same bug pattern.
- **D9 — Sequencing.** Content card (21-content) first; build card (01-frontend) kanban-gated on it (parent). Merge gated on t_6ec623de. No hotspot: new files only, plus one contained edit in `src/app/[locale]/cultura/page.tsx`.

## Tasks (stable IDs)

- [ ] T1: Glossary content — 10+ entries extending `docs/catalog/cultura-20-template.csv` (tags include `glosario`, es-AR, excerpt 20-155 SEO meta, tipTap jsonb body: definition / multi-belief origin / how it's used / responsible-use note where fire/consumables apply). Owner: 21-content.
  - evidence: row count + `python -c` CSV parse (RFC 4180, exact header) + voice/taxonomy checklist in card comment.
- [ ] T2: Ritual dates dataset + quiz copy — `docs/catalog/calendario-ritual.csv` (12-20 dates: name, month/day, description, intencion, tags) + quiz JSON (3-4 questions × 2-4 options → intencion points, result texts, disclaimers) with es-AR master + en/fr/pt-BR short-string translations. Owner: 21-content.
  - evidence: dataset parse + intencion coverage check (every intencion reachable by ≥1 option path) + 4-locale key parity.
- [ ] T3: `/cultura/glosario` index (tag filter, alphabetical, locale-aware, definition cards) + section links on `/cultura` page (contained edit). Owner: 01-frontend.
  - evidence: new vitest tests red→green; `pnpm test` output.
- [ ] T4: `/cultura/calendario` — `src/lib/cultura/lunar.ts` pure phase calc + ritual dates render + month navigation. Owner: 01-frontend.
  - evidence: lunar unit tests (known phase dates), page test.
- [ ] T5: `/cultura/quiz` — client flow, intencion scoring, results with CTA `/tienda?intencion=…` + glossary cross-links + disclaimers, graceful empty-products state. Owner: 01-frontend.
  - evidence: scoring unit tests; results view test.
- [ ] T6: i18n `cultura` namespace × 4 locales + idempotent cultura import script (upsert by slug) + seed update; drift check green. Owner: 01-frontend.
  - evidence: 4-locale key parity check + import dry-run output on real CSV + idempotent second-run diff = 0.
- [ ] T7: Full verification + PR + merge (gated on t_6ec623de) + deploy check + close this doc + final `mem_save` (topic `odd/orn-94-glosario-calendario-quiz/tasks`).
  - evidence: `pnpm test` full suite output, PR URL, merge commit, post-deploy smoke of the 3 routes.

## Accumulated evidence

- 2026-10-22 (24-orquestador, card t_8c23b370): production `cultura_posts` = 0 rows (Supabase MAPI query, PAT_2, ref asbyqyxrpfggxjujfqte). Routes present: `src/app/[locale]/cultura/{loading.tsx,page.tsx,[slug]/page.tsx}`; `/cultura/page.tsx` ignores locale in query (D8). Migrations 0011/0012 = schema + daily sync cron; RLS anon=published-only. `grep -ri "quiz|lunar" src/` → 0 code hits. `articleJsonLd` present in `[slug]/page.tsx`. `docs/catalog/cultura-20-template.csv` exists with 3 example rows (tarot torre, cuarzo rosa…). i18n: 8 namespaces × 4 locales, no `cultura` namespace. Board: t_6ec623de (CI fix) blocked; t_c66c92b2 (hero) todo; t_bf70f5a7 (ORN-92 categorías) blocked on owner decision.

## Accepted changes and rationale

- (none yet — record accepted deviations from D1-D9 here as they happen.)

## Next step

- 21-content executes T1+T2 (content card); 01-frontend picks up T3-T6 once content lands (kanban parent gate).

## Progress

- 2026-10-22: Feature doc created by 24-orquestador; decomposition dispatched (content card + build card); ORN-94 Linear moved Backlog → In Progress with routing comment.
