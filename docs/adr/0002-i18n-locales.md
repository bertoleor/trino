# ADR-0002 — i18n es-AR default + en/fr/pt-BR

- Status: accepted
- Decision: es-AR default; dictionaries per locale (admin/auth/checkout/common/consent/emails/errors/legal).
- Consequences: every user-facing string must exist in 4 locales; missing-key test exists (t-a07-i18n). Risk: drift if keys added only in es-AR.
