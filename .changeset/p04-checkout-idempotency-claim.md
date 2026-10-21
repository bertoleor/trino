---
'@santisima-trinidad/lockfile': patch
---

fix(checkout): atomic idempotency claim on POST /api/checkout — kill TOCTOU duplicate orders (audit P-04, CWE-362/799). The idempotency_keys INSERT is now the race barrier and its result decides the request via decideIdempotencyClaim: a concurrent request sharing the same Idempotency-Key that loses the claim (check-then-insert window; PK 23505 previously silently ignored so the loser created a duplicate order and double processing) now replays idempotently with 200 {status:'already_processed', order} scoped to the session user; an unknown claim error fails closed with 500 'idempotency claim failed' (never processes without a won claim); an orders.idempotency_key unique violation replays idempotently instead of landing in 500 + failed_webhooks_log; and a failed order insert releases the claim so a client retry with the same key is not poisoned.
