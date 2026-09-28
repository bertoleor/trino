---
'@santisima-trinidad/lockfile': patch
---

fix(shipping): harden POST /api/shipping/rates against anonymous resource exhaustion (audit S-01, CWE-770/CWE-400): dedicated 20/m rate-limit tier applied before any work, 32KB body cap (413), zod validation before hashing (422), session-id cache-key length cap, bounded in-memory shipping cache with FIFO eviction.
