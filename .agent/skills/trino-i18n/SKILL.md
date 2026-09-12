---
name: trino-i18n
description: >
  Locale-aware storefront for trino.: es-AR default routing, ICU plurals, Intl formatting, zero
  hardcoded strings, locale-aware emails. Trigger: When adding any user-facing string, routing under
  /[locale]/, pluralization, currency/date formatting, or email content.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. i18n

Trace: I18N-01..03, I18N-COMM-01..03, ARCH-02, marca.md §8.4.

**Locales**: `es-AR` (default), `en`, `fr`, `pt-BR`. Cultural — not literal — translation.

## Locale Routing & Fallback (I18N-01)

- Every public route served under `/{locale}/` via **next-intl 4.x** with App Router.
- **`es-AR` is default**; a request to `/` MUST `308`-redirect to `/es-AR/` with
  `html lang="es-AR"`.
- **Missing translation key MUST fall back to `es-AR` value** — never render the raw key
  (`checkout.pay` must not appear literally).
- Namespaces `messages/{locale}/{ns}.json`: `common, auth, checkout, admin, errors, emails`.
- `hreflang` + `sitemap.xml` MUST list all 4 locales.

```ts
// es-AR default documented — make sure you don't hardcode "en" as fallback
```

## Zero String Literals

Every user-facing string MUST use `t()` with **ICU plural**:

```tsx
t('cart.count', { count }); // → {count, plural, one{# item} other{# items}}
```

Rendered in `pt-BR` for count=1 → "1 item", not a hardcoded "1 item(s)".

## Locale-Aware Formatting

- Currency: `new Intl.NumberFormat(locale, { style:'currency', currency:'ARS' })` — never manual
  concat.
- Dates: `Intl.DateTimeFormat` with the **user's IANA zone**; DB stores UTC (DB-01/TZ-01).

```ts
const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' });
fmt.format(199990 / 100); // fr locale → "1 999,90 $AR" — no manual string building
```

## Emails in Recipient Locale

Emails (order confirmation, coupons, abandoned cart, culture sync) render in the **recipient's
locale** via react-email + next-intl. A user with `pref=fr` checking out from an `es-AR` session
gets an **fr** email body.

## Traps

- **Raw-key fallthrough is a bug** — always fall back to `es-AR`, never display the key.
- **Plurals must use ICU** (`{count, plural, one{#} other{#}}`), not `count === 1 ? ... : ...`
  string holds.
- **Do not hardcode currency/date strings** — `Intl` per locale, ARS currency.
- **Emails use recipient locale**, not the active storefront (session) locale.
- All strings live in `messages/` — hardcoded UI strings fail this spec and the lint/audit gates.
