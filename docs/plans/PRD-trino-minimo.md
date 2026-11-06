# PRD — trino. — e-commerce esotérico multi-creencia (PRD mínimo)

> Parte de: [[INDICE-SISTEMA]] · Relacionados: [[PRD-TEMPLATE]], [[2026-10-16-revision-p17-1-prds]]

> Proyecto: trino. (santisima-trinidad) · Autor: 19-writer (Technical Writer) · Fecha: 2026-10-18
> Estado: DRAFT
> Links: t_330b3a36 (P17-1 rework, parent t_99bc1b88) · auditoría `E:/Hermes/docs/audits/2026-10-16-revision-p17-1-prds.md` · ADRs `docs/adr/0001-stack-next-supabase-upstash.md`, `docs/adr/0002-i18n-locales.md`, `docs/adr/0003-money-decimal.md`

> **Búsqueda:** keywords: `trino, prd, ecommerce-esoterico, multi-creencia, neo-bauhaus, triple-entrada, checkout-invitado, i18n-4-locales` · clasificación: `prd` · estado: `draft` · actualizado: 2026-10-18

> Generado desde material verificado del repo: `README.md`, `docs/overview.md`, `docs/DOCS/marca.md`, `docs/DOCS/plan-tienda-ecommerce-2026.md`, `docs/legal/01-product-specs-requirements.md`, `docs/ux-flows/use-cases.md`, `docs/ROADMAP-NEXT-SDD.md`. Es un documento de producto (DRAFT, requiere aprobación del owner): no cambia código por sí mismo; cada sección cita su fuente.

## 1. Problema

Comprar productos esotéricos online en Argentina obliga a elegir entre sitios "new age" genéricos (degradés, estrellas, sin curaduría ni contexto) y marketplaces donde un mazo de tarot compite con cualquier importación. Quien busca una vela para un ritual específico, un cristal con origen verificable o un elemento de santería con contexto cultural real, no puede filtrar por **intención** ni por **tradición** — y el segmento premium del rubro no tiene oferta. Duela a dos: al comprador esotérico (no encuentra lo que su práctica necesita) y a la marca (curaduría multi-creencia respetuosa no existe como propuesta). Fuentes: `docs/overview.md` §Qué es, `docs/DOCS/marca.md` §2-§4.

## 2. Contexto

- **trino. en una línea:** e-commerce high-end de productos esotéricos multi-creencia (tarot y oráculos, velas, inciensos y resinas, cristales, amuletos, aceites, altares, libros, joyería simbólica, sets de regalo) con estética Neo-Bauhaus y curaduría respetuosa multi-creencia. (`docs/overview.md`)
- **Usuarios objetivo:** practicantes y curiosos serios de 20-45 años que navegan por **intención** (amor, protección, abundancia, limpieza energética, sueño, conexión espiritual, duelo) y por **tradición** (tarot/astrología, wicca, budismo, santería y religiones afro, feng shui, cristaloterapia, chamanismo, misticismo cristiano popular, espiritualidad general); compradores de regalo ritual (sets curados); móvil-first, gama baja con red 3G/4G. (`docs/DOCS/marca.md` §3, `docs/DOCS/plan-tienda-ecommerce-2026.md` §0)
- **Estado del repo:** `main` activo. Next.js 16 · React 19 · TS 5 · Tailwind 4 · shadcn/ui · Zod 4 · next-intl (es-AR default, en, fr, pt-BR) · Supabase SSR + RLS two-role · Upstash Redis (rate limit + cache) · decimal.js · Vitest 4 + Playwright · pnpm · deploy Vercel. 24 migraciones SQL, 16 caps en `openspec/specs/`. (`README.md`, `docs/stack.md`)
- **Marca:** trino. (siempre minúscula, con punto final) · dominios santisima-trinidad.com.ar + .com · @holatrino (IG/TikTok) · paleta Neo-Bauhaus como tokens únicos. (`docs/overview.md`, `docs/DOCS/marca.md` §1)
- **Antecedentes:** P17 generó 8 PRDs placeholder (FAIL, auditoría 2026-10-16); el de trino además quedó varado en `feat/a-08-account-auth-guard`. Este PRD lo regenera con contenido real y lo asienta en `main` junto con la unificación `docs/` (case-rename de `DOCS/`).

## 3. Scope explícito (tienda mínima)

Funnel mínimo (caso de uso núcleo):

```
1. Descubrimiento (SEO cultura/glosario, redes @holatrino)
   → 2. PLP con filtros combinables: tipo / tradición / intención
   → 3. PDP: contexto de origen cultural, precio IVA incluido, envío por CP, reseñas
   → 4. Carrito sin cuenta → checkout invitado (envío → pago → confirmación)
   → 5. Pago MercadoPago → confirmación + email transaccional (Resend)
   → 6. Cuenta opcional al final: wishlist, historial de órdenes (UC-001..006)
```

Lo que SÍ entra (verificado en `src/app/[locale]/` y planes citados):

- **Catálogo con triple entrada** — tipo (10) / tradición (9) / intención (7) como **filtros combinables**, no tres menús. (`docs/overview.md` §Triple entrada, `docs/DOCS/marca.md` §3, enums Zod `tipo/tradicion/intencion`)
- **Storefront** — Home + PLP (grilla vertical 3:4/4:5, color blocking rotando 4 acentos, badges mostaza) + PDP (galería, variantes, tabs, relacionados, calculadora de envío por CP). (`docs/DOCS/plan-tienda-ecommerce-2026.md` §2-§4, `docs/DOCS/marca.md` §2)
- **Carrito + checkout invitado** — carrito persiste sin cuenta; pasos cortos con resumen sticky; validación en tiempo real; cuenta opcional al final. (plan tienda §5, `docs/ux-flows/use-cases.md`)
- **Pagos** — MercadoPago (tarjeta / transferencia / MP) según UC-003; precios INT cents ARS; total recomputado server-side. (`README.md` §Env, `openspec/specs/payments`)
- **Cuenta** — wishlist, historial de órdenes con estados y detalle (UC-006), direcciones; auth Supabase con hardening Turnstile + rate limit (A01). (rutas `(account)/`, `docs/reports/2026-09-28-a01-turnstile-auth.md`)
- **Cultura/blog + SEO** — contenido editorial y glosario como canal de adquisición del rubro; JSON-LD Product, sitemap, hreflang x4. (`docs/DOCS/marca.md` §5, rutas `cultura/`)
- **Admin backoffice mínimo** — catálogo, órdenes, lanzamientos, calendario editorial. (rutas `admin/`, `docs/DOCS/plan-backoffice-ecommerce-2026.md`)
- **i18n** — 4 locales (es-AR default, en, fr, pt-BR). (`docs/adr/0002-i18n-locales.md`)
- **Legal AR bloqueante** — precio final IVA incluido, stock real, arrepentimiento 10 días, garantía 6 meses, botón Defensa del Consumidor, disclaimer no-médico en productos rituales. (`docs/legal/01-product-specs-requirements.md` P-01..P-11 MUST)

## 4. NO-scope

- App nativa; PWA completa (manifest sin icons, evaluar post-F1).
- Multi-moneda real (solo ARS; multi-idioma sí). Checkout online distinto de MP (Stripe queda en lanes experimentales, no en el env baseline). 
- Marketplace con vendedores terceros.
- Suscripción "caja ritual mensual" (diferida hasta validar demanda, marca §6).
- Modo oscuro, comparador de productos, mapa de calor, quiz "elegí tu camino", calendario lunar interactivo (fases posteriores, plan tienda §10/§12, marca §5).
- Lecturas de tarot en vivo o servicios: trino vende productos físicos, no servicios.
- Backoffice 360 avanzado (LTV p95, batch SSE): ya secuenciado en `docs/ROADMAP-NEXT-SDD.md`, no parte del mínimo.

## 5. Restricciones

- **Legales (AR)** — Ley 24.240 (arts. 4, 10 ter, 34), Ley 22.802, Res. SCI 244/2021: copy obligatoria textual de `docs/legal/01` §5; sin launch con algún MUST P-01..P-11 rojo. Consumibles rituales usados no retornables (higiene).
- **Dinero** — `price_cents` INT (centavos ARS) + decimal.js; total recomputado server-side (409 price_mismatch); nunca float. (`docs/adr/0003-money-decimal.md`)
- **Marca** — todo el copy UI en minúscula (`text-transform: lowercase` por componente); paleta Neo-Bauhaus como tokens únicos (terracota/verde/mostaza/celeste); sin jerarquizar tradiciones; moderación de reseñas sin debate religioso. (`docs/DOCS/marca.md` §1, §4, §7)
- **Técnicas** — stack fijo (Next 16/Supabase RLS deny-by-default/Upstash/Vercel); releases solo vía changesets; `pnpm test` fuerza `TEMP=E:/temp` en Windows (quirk vitest+playwright, no remover sin CI completa). (`README.md`)
- **SDD** — PRs stacked-to-main ≤400 líneas, TDD estricto RED→GREEN→REFACTOR. (`docs/ROADMAP-NEXT-SDD.md`)

## 6. Criterios de éxito medibles

- [ ] Funnel e2e completo (home → PLP filtros → PDP → carrito → checkout invitado → MP sandbox → confirmación → orden en historial) verde en Playwright.
- [ ] 0 MUSTs legales pendientes en la checklist pre-launch (`docs/legal/01` §6) sobre el catálogo real.
- [ ] Lighthouse mobile Performance ≥ 90 con gate LHCI en CI; LCP < 2.5s, CLS < 0.1, INP < 200ms (lab). (`docs/ROADMAP-NEXT-SDD.md` P1/P3)
- [ ] Checkout recomputa total desde DB: 0 `price_mismatch` sin manejar; stock OCC con 409 en conflicto.
- [ ] JSON-LD Product validado en rich-results; hreflang x4.
- [ ] Suite ≥ 359 tests verde, coverage ≥ 58%, `tsc` 0, `pnpm lint` 0, `pnpm build` 75/75 (verify gate del roadmap).
- [ ] 4 locales renderizando sin claves faltantes.

## 7. Fases SDD sugeridas

1. **F1 — catálogo + storefront:** triple entrada como filtros combinables + PLP/PDP con tokens Neo-Bauhaus (dep: P1 `tooling-ci-regeneration` para types frescos).
2. **F2 — carrito + checkout invitado + pagos MP:** UC-001..006 end-to-end + MUSTs legales en PDP/checkout.
3. **F3 — cuenta + wishlist + reseñas moderadas:** Turnstile auth + historial de órdenes.
4. **F4 — admin mínimo + cultura/SEO:** backoffice catálogo/órdenes + blog + JSON-LD.
5. **Harden pre-launch:** P2 `security-csp-nonce` y P3 `client-mobile-perf` según `docs/ROADMAP-NEXT-SDD.md`; lanzar con ~500 SKUs solo después de P3; luego backlog `ecommerce-client-v2`.

Cada fase: propose → spec → tasks → apply (TDD) → verify, 1 PR ≤ 400 stacked-to-main.

## 8. Presupuesto líneas/tokens

- Líneas nuevas: N/A — este PRD es un documento de producto, no un cambio de código; cada cambio SDD derivado define el suyo (heurística fleet: ≤400 líneas por PR, ≤150 por archivo).
- Archivos tocados: 1 (este archivo: `docs/plans/PRD-trino-minimo.md`, 96 líneas, 9.81 KB).
- Tokens aprox: N/A (documento).

---

Fuentes por sección: §1 `docs/overview.md`, `docs/DOCS/marca.md` §2-§4 · §2 idem + `README.md` + auditoría 2026-10-16 · §3 rutas `src/app/[locale]/` + planes + `docs/ux-flows/use-cases.md` · §4 plan tienda §10/§12 + marca §5-§6 + roadmap · §5 `docs/legal/01` + ADRs 0002/0003 + `README.md` · §6 roadmap verify gates + legal §6 · §7 roadmap execution order + plan tienda §12.
