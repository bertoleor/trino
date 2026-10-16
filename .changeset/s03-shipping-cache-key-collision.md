---
'@santisima-trinidad/lockfile': patch
---

fix(shipping): eliminate cross-cart cache collisions in shipping rate caches (audit S-03, CWE-706/CWE-20): replace weight-sum cache keys (index.ts weightHash, international.ts hashItems) with the composition-sensitive sha256 `shippingHash`, so distinct carts with equal total weight no longer share a cached quote.
