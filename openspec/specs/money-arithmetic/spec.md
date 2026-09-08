# money-arithmetic Specification

## Purpose
ARS-only deterministic money handling with zero float drift. Trace: MONEY-01..03, DB-SYNC-01, Plan backoffice §5.3.

## Requirements

### Requirement: Integer Centavos Storage (ARS Only)
The system MUST store every monetary amount as INTEGER centavos (1 ARS = 100) with companion `currency CHAR(3) DEFAULT 'ARS' CHECK currency='ARS'`. Prohibited: numeric/float columns, `as unknown as` escapes, direct `process.env` price access. Display MUST convert only at render: `(cents/100).toFixed(2)`. Migration SHALL follow expand→migrate→contract (DB-03): add `price_cents INT`, backfill `ROUND(price*100)`, dual-write, then drop `price`. (Trace: MONEY-01, MONEY-03, ENV-01, CQ-06)

#### Scenario: Storage invariant
- GIVEN product create payload price "AR$ 1.999,90"
- WHEN Server Action validates via Zod
- THEN DB stores `199990` and `currency='ARS'`; any other currency is rejected 400

#### Scenario: Float prohibition
- GIVEN code attempts `price * 0.21` with number
- WHEN ESLint/TS check runs
- THEN it fails — only `Decimal.js` or integer arithmetic allowed

### Requirement: Multi-Step Calculation Precision
Multi-step totals (subtotal + shipping + discount + 21% IVA) MUST use `Decimal.js` with explicit `ROUND_HALF_UP` for user-facing and `ROUND_DOWN` for internal splits. Rounding strategy MUST be documented per calculation. (Trace: MONEY-02)

#### Scenario: Cart total with discount and tax
- GIVEN cart 2×199990 + shipping 150000, 10% coupon, 21% IVA
- WHEN total computed
- THEN result matches Decimal.js manual calc within 1 centavo and snapshot test passes

#### Scenario: Sale price integrity
- GIVEN `sale_price_cents`, `sale_start`, `sale_end` (UTC)
- WHEN current UTC is within window
- THEN frontend shows tachado base + sale price; otherwise base only (ECOM-04)
