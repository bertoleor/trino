import { NextRequest, NextResponse } from 'next/server';
import { syncCulturaFromSocial } from '@/lib/social/cultura-sync';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await syncCulturaFromSocial();
  return NextResponse.json({ ok: true, ...result, dedup: 'Upstash hash', source: 'QStash' });
}
