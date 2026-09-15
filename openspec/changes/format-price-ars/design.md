# Design: formatPriceARS

## Decision

Single-file pure module, no imports. String normalization reuses the
thousand/decimal disambiguation rule already proven in `toCents`
(`src/lib/validations/money.ts`): both separators present → dots are thousands,
comma is decimal; only comma → decimal comma.

| # | Decision | Rejected | Why |
|---|----------|----------|-----|
| AD-01 | Own pesos-input parser (~15 lines), no reuse of `toCents` | Reuse `toCents`/100 | `toCents` rounds to 2dp + throws on 3rd decimal; formatter must preserve full peso precision, no cents round-trip |
| AD-02 | `Intl.NumberFormat` directly, no fallback string | Manual `$` concat fallback | Node 20 + browsers always have `es-AR` ICU; manual fallback would diverge from locale output |
| AD-03 | `TypeError` (non-numeric) vs `RangeError` (non-finite) split | Single `Error` | Matches JS convention (`Number` semantics), lets callers distinguish bad-type from out-of-range |

## File Changes

| File | Action | Lines |
|------|--------|-------|
| `src/lib/money/format-price-ars.ts` | Add | ≤40 |
| `tests/unit/format-price-ars.test.ts` | Add | ≤60 |

## Test Plan (RED → GREEN)

RED: test imports `@/lib/money/format-price-ars` (missing) → suite fails on
collection. GREEN: implement → 8 assertions pass. Full gate: targeted vitest
run + `tsc --noEmit` must stay green.
