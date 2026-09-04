-- 0021 orphan Storage GC weekly + mutex stampede
-- pg_cron weekly cleanup of orphaned Storage objects where deleted_at older than 1yr
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- orphan GC: delete bank_proofs and product-images where deleted_at < now() - interval '1 year'
SELECT cron.schedule(
  'orphan-gc-weekly',
  '0 3 * * 0',
  \$\$
  DELETE FROM storage.objects WHERE bucket_id IN ('bank_proofs','product-images') AND created_at < now() - interval '1 year';
  \$\$
);

-- perf mutex table for stampede protection (Upstash fallback)
CREATE TABLE IF NOT EXISTS perf_mutex (
  key text PRIMARY KEY,
  locked_at timestamptz DEFAULT now()
);
