# Verify: format-price-ars

## Strict TDD Evidence

- RED (`14:33`, before impl): `tests/unit/format-price-ars.test.ts` failed on
  collection — `import '@/lib/money/format-price-ars'` unresolvable
  (`Test Files 1 failed, Tests no tests`). Module did not exist.
- GREEN (`14:39`, after impl): `Test Files 1 passed (1), Tests 8 passed (8)`.

## Regression Gate (real output, `14:47`)

Targeted run `npx vitest run tests/unit/format-price-ars.test.ts
tests/unit/t-b03-money.test.ts` (vitest v4.1.11):

```
Test Files  2 passed (2)
     Tests  16 passed (16)
Duration 18.86s
EXIT=0
```

8 pre-existing `t-b03-money` tests still green — `formatCents`/`toCents`
untouched, no regression.

## Sample Outputs (Node 20, `Intl es-AR/ARS`)

- `formatPriceARS(1999.99)` → `$ 1.999,99`
- `formatPriceARS(0)` → `$ 0,00`
- `formatPriceARS("1.500,50")` → `$ 1.500,50` (== `formatPriceARS(1500.5)`)

## Error Contract (covered by tests)

- `NaN` / `Infinity` → `RangeError`; `"abc"` / `""` → `TypeError`.

## Not Run

- Full `tsc --noEmit` and `eslint` on the repo: exceed the sandbox time budget
  on this box (timed out at 300s). New files are dependency-free, alias-only
  imports (`@/...` per `vitest.config.ts`), same style as sibling modules.
  Recommend CI gate (`pnpm typecheck && pnpm lint`) on the PR.

## Gate Verdict

PASS — RED→GREEN recorded, 16/16 targeted tests, zero modified files
(`git status`: only new files under `openspec/changes/format-price-ars/`,
`src/lib/money/format-price-ars.ts`, `tests/unit/format-price-ars.test.ts`).
