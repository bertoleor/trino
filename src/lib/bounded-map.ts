// T-S04 (CWE-400/CWE-770): shared bound for the module-level shipping rate
// Maps. The audit found them unbounded — distinct session/country keys grew
// the Maps without limit until OOM on a long-running instance. Entries still
// expire lazily on read; this cap + FIFO eviction bounds the worst case.
// Declared here once (S-02 doctrine: bound constants have a single source
// of truth) and re-exported by the modules that own the Maps.
export const MAX_RATE_MEM_ENTRIES = 1000;

// Map preserves insertion order: first key = oldest entry. FIFO matches the
// precedent set by S-01 (shipping/cache.ts) — rate entries are 60s-TTL
// shipping quotes, so oldest-first is sufficient for a bounded working set.
export function evictOldestIfNeeded<V>(map: Map<string, V>, cap = MAX_RATE_MEM_ENTRIES): void {
  if (map.size < cap) return;
  const oldest = map.keys().next().value;
  if (oldest !== undefined) map.delete(oldest);
}
