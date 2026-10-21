---
'@santisima-trinidad/lockfile': patch
---

fix(webhooks): enforce signature timestamp freshness on POST /api/webhooks/mercadopago (audit P-03, CWE-294/384 / OWASP A02): the 't' component of the x-signature envelope is now mandatory, must be a unix second integer, and must fall inside a ±300s tolerance window of server time (same contract as the Stripe route T-P01) — previously a captured request bearing a valid HMAC was replayable forever because the timestamp was parsed but never checked, and a signature without 't' (bare-payload HMAC fallback) was accepted with no freshness bound at all. Stale, future, non-numeric and timestamp-less envelopes now reject with 401 before any DB work; processed_events dedup semantics are unchanged.
