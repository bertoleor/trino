# i18n-routing Specification

## Purpose
Locale-aware storefront for trino. (es-AR default, en, fr, pt-BR) with cultural — not literal — translation. Trace: I18N-01..03, I18N-COMM-01..03, ARCH-02 (src/i18n), marca.md §8.4, Plan tienda §10.7.

## Requirements

### Requirement: Locale Routing and Fallback
The system MUST serve every public route under `/{locale}/` via next-intl 4.x with App Router. `es-AR` SHALL be default; missing prefix MUST redirect (308) to `es-AR`. Missing translation key MUST fallback to `es-AR` — never raw key. `messages/{locale}/{ns}.json` (ns: common, auth, checkout, admin, errors, emails) SHALL be single source. hreflang + sitemap.xml MUST list all 4 locales. (Trace: I18N-01, I18N-COMM-03)

#### Scenario: Visitor without locale
- GIVEN a request to `/`
- WHEN middleware resolves locale
- THEN response is 308 to `/es-AR/` and html lang="es-AR"

#### Scenario: Missing key fallback
- GIVEN `fr` lacks `checkout.pay`
- WHEN component renders `t('checkout.pay')`
- THEN it displays the `es-AR` value and logs `MISSING_KEY` warning

#### Scenario: Hreflang coverage
- GIVEN sitemap generated
- WHEN crawler reads `/sitemap.xml`
- THEN every URL has `<xhtml:link hreflang="es-AR|en|fr|pt-BR">`

### Requirement: Zero String Literals and Locale-Aware Formatting
Every user-facing string MUST use `t()` with ICU plural (`{count, plural, one{#} other{#}}`). The system MUST format currency via `Intl.NumberFormat(locale, {currency:'ARS'})` and dates via `Intl.DateTimeFormat` with user IANA zone; DB dates are UTC (DB-01, TZ-01). Emails MUST render in recipient locale via react-email + next-intl.

#### Scenario: Plural rendering
- GIVEN cart count 1 in pt-BR
- WHEN rendering badge
- THEN text is "1 item" (pt-BR) not hardcoded string

#### Scenario: ARS formatting
- GIVEN amount 199990 centavos
- WHEN rendered in fr locale
- THEN shows via Intl (e.g. "1.999,90 ARS") not manual concat

#### Scenario: Email locale
- GIVEN user pref fr but checkout from es-AR session
- WHEN order confirmation queued
- THEN email body uses fr messages namespace
