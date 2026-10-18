# Identidad visual verificada en código — 9 proyectos

> Fuente: @10-uiux · 2026-09-14 · Check run sobre archivos **trackeados** (git ls-files) — no sobre supuestos.
> Complementa la auditoría estructural de @21-content: esta columna mide **identidad REAL en código**, no solo presencia de doc.

## Método

Para cada proyecto verifiqué sobre el working tree (git ls-files, ignora node_modules):
1. **Tokens**: `tokens.css` dedicado + variables `--x` en `:root` de `globals.css`.
2. **Doc de sistema**: `design-system*.md` / rules de design-system trackeados.
3. **Primitivas UI**: carpeta `components/ui` (o `src/components/ui`).
4. **Tests**: tests de UI/design sistem trackeados.

## Tabla

| Proyecto | tokens.css dedicado | vars en :root (globals) | design-system doc | primitivas UI | tests UI | Veredicto identidad |
|---|---|---|---|---|---|---|
| PAEONIA | ✗ | 53 | ✓ `.agents/rules/02-design-system.md` | ✓ | ✓ | ✅ Sólida (tokens en globals) |
| KHAL | ✗ (pkg `packages/ui`) | 2 (mínimo) | ✗ (solo skill) | ✓ (packages/ui) | ? | ⚠️ Token mínima, sin doc de sistema |
| EROS | ✗ | 95 | ✗ (solo skill) | ✓ | ✗ | ✅ Tokens ricos, sin doc ni test |
| OMAKASE | ✗ | 17 | ✗ | ✓ | ✗ | ⚠️ Tokens parciales, sin doc |
| TRINO | ✅ `src/styles/tokens.css` | 8 (2 bloques) | ✅ `components/ui/design-system.md` | ✓ | ✅ 8/8 PASS | ✅ ✅ Referencia (verificado real) |
| NAILAPP | ✗ | 96 | ✓ `.agents/rules/02-design-system.md` | ✓ | ✓ | ✅ Sólida + tests por componente |
| SACRE | ✗ | 10 (paleta burdeos) | ✗ | ✗ (0 tracked) | ✗ | ❌ Sin sistema — confirma P1 |
| SOCIALPIP | n/a (Python/RN, no web UI) | n/a | skills RN | n/a | n/a | ⚠️ No aplica check web |
| VICKY | ✗ | 15 | ✗ | ✓ | ✗ | ⚠️ Tokens básicos, sin doc |

## Hallazgos

- **Solo TRINO tiene `tokens.css` dedicado + doc de sistema + test real** (t-a08/t-a08b, 8/8 PASS). Es la referencia.
- **PAEONIA y NAILAPP** son los que mejor modelo de token en `globals.css` (53 y 96 vars) y tienen doc de design-system trackado + tests por componente → identidad real fuerte.
- **EROS** define la mayor cantidad de tokens en `:root` (95) pero **sin doc de sistema ni test** → identidad escrita en código pero no documentada.
- **SACRE: 0 archivos de UI primitives trackeados** + solo 10 vars en globals → **confirma el P1 de @21-content**: sin sistema de diseño en código. Es el único con veredicto ❌.
- **KHAL** (monorepo) tiene `packages/ui` como lib de componentes pero `globals.css` con solo 2 vars → tokens casi inexistentes, identidad por definir.
- **VICKY/OMAKASE**: tokens básicos presentes, sin doc de sistema ni tests.

## Recomendación

- Sacar SACRE a identidad explícita (no la tiene en código) = misma severidad que el P1 estructural.
- EROS y KHAL: token en código fuerte/parcial pero sin doc → para el estándar TRINO les falta el `design-system.md`.