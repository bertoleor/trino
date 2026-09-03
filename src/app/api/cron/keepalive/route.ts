import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const urlSecret = req.nextUrl.searchParams.get('secret');
  if (urlSecret === secret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supabase = await createClient();
    const { error: selError } = await supabase.from('keepalive_logs').select('id').limit(1);
    if (selError) throw selError;
    const checkedAt = new Date().toISOString();
    const source = req.headers.get('x-cron-source') ?? 'vercel-cron';
    const { error: insError } = await supabase.from('keepalive_logs').insert({ source, status: 'ok', checked_at: checkedAt });
    if (insError) throw insError;
    return NextResponse.json({ ok: true, checkedAt, source, heartbeat: 1 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
