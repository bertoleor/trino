# Spec: formatPriceARS

## Function

`formatPriceARS(value: number | string, locale?: string): string`

Input is a price in **pesos** (mayor units, decimals allowed).
Default locale `es-AR`; output currency `ARS`.

## Requirements

- REQ-01: Accept finite numbers (integers, decimals, negatives, zero).
- REQ-02: Accept numeric strings (`"1999.99"`, `" 1500 "`, `"1.500,50"` AR form).
  Trim whitespace; support both `1,500.50` and `1.500,50` thousand/decimal forms.
- REQ-03: Format via `Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' })`.
- REQ-04: Throw `TypeError` for non-numeric strings, `null`, `undefined`, objects.
- REQ-05: Throw `RangeError` for `NaN`, `Infinity`, `-Infinity` (number or string).
- REQ-06: Pure: no I/O, no globals, no mutation; same input → same output.
- REQ-07: Empty/whitespace-only string → `TypeError`.

## Acceptance Scenarios

1. `formatPriceARS(1999.99)` → contains `1.999,99` and `$`.
2. `formatPriceARS(0)` → zero ARS string, no throw.
3. `formatPriceARS("1.500,50")` → same as `formatPriceARS(1500.5)`.
4. `formatPriceARS(NaN)` throws `RangeError`; `formatPriceARS("abc")` throws `TypeError`.
5. `formatPriceARS(100, "en-US")` → uses `en-US` grouping with `ARS` currency.

## Non-Goals

- No cents conversion (use `toCents`/`formatCents` for cents).
- No FX, no rounding-mode options.
