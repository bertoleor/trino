import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isCronAuthorized } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Gate: isCronAuthorized — Bearer CRON_SECRET check, fail-closed (see src/lib/cron/auth.ts).
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supabase = await createClient();
    const { error: selError } = await supabase.from('keepalive_logs').select('id').limit(1);
    if (selError) throw selError;
    const checkedAt = new Date().toISOString();
    const source = req.headers.get('x-cron-source') ?? 'vercel-cron';
    const { error: insError } = await supabase
      .from('keepalive_logs')
      .insert({ source, status: 'ok', checked_at: checkedAt });
    if (insError) throw insError;
    return NextResponse.json({ ok: true, checkedAt, source, heartbeat: 1 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
