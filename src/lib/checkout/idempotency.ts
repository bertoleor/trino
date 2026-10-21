// T-P04 (auditoría 34-auditor, P-04 HIGH, CWE-362/CWE-799): atomic idempotency
// claim decision for POST /api/checkout. The idempotency_keys INSERT is the
// race barrier (migration 0020: `key text primary key`); this module turns the
// claim outcome into an explicit decision so the route never proceeds on an
// unchecked (or lost) claim.

export interface IdempotencyClaimError {
  /** Postgres SQLSTATE, e.g. '23505' for unique_violation. */
  code?: string | null;
}

export type IdempotencyClaim = 'won' | 'lost' | 'failed';

/**
 * Decide the outcome of an idempotency-key claim.
 *
 * - existing key → 'lost': a fast-path SELECT found the key already claimed
 *   (replay of an earlier request).
 * - no insert error → 'won': this request owns the key atomically.
 * - insert error 23505 → 'lost': a racing request claimed the key first —
 *   the PK barrier held, so respond idempotently (never double-process).
 * - any other insert error → 'failed': fail-closed — without a won claim
 *   at-most-once cannot be guaranteed, so the caller must NOT proceed.
 */
export function decideIdempotencyClaim(
  existing: boolean,
  insertError: IdempotencyClaimError | null
): IdempotencyClaim {
  if (existing) return 'lost';
  if (!insertError) return 'won';
  if (insertError.code === '23505') return 'lost';
  return 'failed';
}

/** True only for a Postgres unique_violation (SQLSTATE 23505). */
export function isUniqueViolation(error: unknown): boolean {
  return (error as IdempotencyClaimError | null | undefined)?.code === '23505';
}
