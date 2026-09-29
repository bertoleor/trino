---
'@santisima-trinidad/lockfile': patch
---

fix(shipping): bound and validate the `items` array at the lib boundary (audit S-02, CWE-20/CWE-770): shared `shippingItemsSchema` exported from validations, `assertShippingItems` fail-fast in `getShippingRates` and `getInternationalRates` before any hash/cache/carrier fetch, single source of truth for the 25-item bound (`MAX_SHIPPING_ITEMS` imported in cache.ts, local `MAX_HASH_ITEMS` removed).
