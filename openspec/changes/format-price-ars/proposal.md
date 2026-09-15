# Proposal: formatPriceARS — pure ARS price formatter (pesos input)

## Intent

Provide one minimal pure function `formatPriceARS(value)` that formats a price
expressed in **pesos** (number or numeric string) as `es-AR` ARS currency for UI
display. Existing helpers (`formatCents`, `formatArs`) take **cents**; this covers
the pesos-denominated call sites without ad-hoc `Intl.NumberFormat` inline.

## Scope

### In Scope
- New pure function `formatPriceARS` in `src/lib/money/format-price-ars.ts`.
- Unit test `tests/unit/format-price-ars.test.ts` (Strict TDD: RED then GREEN).
- SDD chain in `openspec/changes/format-price-ars/` (proposal/spec/design/tasks/verify).

### Out of Scope
- Cents-based helpers untouched (`formatCents`, `formatArs` stay as-is).
- No FX conversion, no rounding-policy change, no UI wiring.
- No DB, i18n dictionaries, or routing changes.

## Approach

Pure function, no dependencies: validate finite numeric input (reject NaN,
Infinity, non-numeric strings with `RangeError`/`TypeError`), format with
`Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`.
Zero-config default locale `es-AR`, optional locale override param.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/money/format-price-ars.ts` | Added | Pure formatter, ~25 lines |
| `tests/unit/format-price-ars.test.ts` | Added | RED→GREEN unit coverage |
| `openspec/changes/format-price-ars/` | Added | SDD chain artifacts |
