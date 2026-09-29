---
'@santisima-trinidad/lockfile': patch
---

fix(shipping): bound the remaining module-level rate Maps (audit S-04, CWE-400/CWE-770): shared bounded-map helper (cap 1000 + FIFO eviction) wired at every MEM.set site in shipping/index.ts and carriers/international.ts, with test observability exports.
