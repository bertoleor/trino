import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- boot-validated public env via src/config/env.ts validateEnv (t-a03-env); ticket: repo-cleanup-final/COMP-15
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- boot-validated public env via src/config/env.ts validateEnv (t-a03-env); ticket: repo-cleanup-final/COMP-15
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
