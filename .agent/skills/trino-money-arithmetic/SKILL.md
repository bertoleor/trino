---
name: trino-money-arithmetic
description: >
  ARS-only deterministic money handling for trino. using integer centavos and Decimal.js. Trigger:
  When computing, storing, rendering, or validating prices, totals, discounts, IVA, shipping, or
  sale prices.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Money Arithmetic

Trace: MONEY-01..03, DB-SYNC-01, ECOM-04, Plan backoffice §5.3.

## Core Invariant

Every monetary amount is **INTEGER centavos** (`1 ARS = 100`) stored with companions
`currency CHAR(3) DEFAULT 'ARS' CHECK currency='ARS'`. Only ARS is permitted; any other currency is
rejected `400`.

### MUST

- Store amounts as INTEGER centavos in DB columns (e.g. `price_cents`, `total_cents`,
  `fixed_shipping_cents`).
- Convert to display ONLY at render: `(cents / 100).toFixed(2)`.
- Validate user/locale-input prices (e.g. `"AR$ 1.999,90"`) via Zod on the Server Action, converting
  to centavos (`199990`) before persisting.
- Use **Decimal.js** for every multi-step calculation (subtotal + shipping + discount + 21% IVA).

### NEVER

- ❌ `numeric`/`float` columns for money.
- ❌ `as unknown as` type escapes.
- ❌ Direct `process.env` access for prices.
- ❌ Sky-high float math like `price * 0.21` with JS `number` in money paths. ESLint/TS gate rejects
  it.

## Multi-Step Precision (MONEY-02)

Use Decimal.js with **explicit rounding per stage** — `ROUND_HALF_UP` for user-facing totals,
`ROUND_DOWN` for internal splits. Document the rounding strategy at each calculation site.

```ts
import Decimal from 'decimal.js';

const qty = new Decimal(2);
const unit = new Decimal(199990); // cents
const shipping = new Decimal(150000);
const coupon = new Decimal(10); // percent → 0.10
const iva = new Decimal(21); // 21% IVA

const subtotal = unit.times(qty); // 399980
const discount = subtotal.times(coupon.div(100));
const net = subtotal.minus(discount);
// user-facing total: HALF_UP
const totalReported = net
  .plus(shipping)
  .times(new Decimal(1).plus(iva.div(100)))
  .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
```

Snapshot-test the result against a manually computed Decimal.js value — must match within 1 centavo.

## Sale Price Integrity (ECOM-04)

- Columns: `sale_price_cents`, `sale_start`, `sale_end` (UTC timestamptz).
- Only when `now() UTC` is within the window: render tachado base + sale price.
- Out of window → render base only.
- Discount % is computed at render, never stored: `((base - sale) / base * 100)`.

## Migration Pattern (DB-03, expand→migrate→contract)

1. **Expand**: add `price_cents INT`.
2. **Migrate**: backfill `ROUND(price * 100)` from legacy `price`.
3. **Dual-write**: write both columns during transition.
4. **Contract**: drop legacy `price` only after verified.

## Traps

- **Currency check**: a product payload from another currency MUST be rejected `400` by the Zod
  schema, not truncated to ARS.
- **`.toFixed(2)` is render-only** — never feed a string back into arithmetic or storage.
- **IVA 21% is Argentine-specific** — hardcode only because ARS-only; do not generalize.
- `noUncheckedIndexedAccess` makes `arr[i]` return `T | undefined`; check before arithmetic on
  arrays of prices.
