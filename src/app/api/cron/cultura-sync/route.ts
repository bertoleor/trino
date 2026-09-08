import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron/auth';
import { syncCulturaFromSocial } from '@/lib/social/cultura-sync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Gate: isCronAuthorized — Bearer CRON_SECRET check, fail-closed (see src/lib/cron/auth.ts).
  if (!isCronAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await syncCulturaFromSocial();
  return NextResponse.json({ ok: true, ...result, dedup: 'Upstash hash', source: 'QStash' });
}
