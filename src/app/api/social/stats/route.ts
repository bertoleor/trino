import { NextRequest, NextResponse } from 'next/server';
import { getSocialStats } from '@/lib/social/graph';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const platform = (req.nextUrl.searchParams.get('platform') as 'tiktok' | 'instagram' | 'youtube') ?? 'instagram';
  const allowed = ['tiktok', 'instagram', 'youtube'] as const;
  if (!allowed.includes(platform)) return NextResponse.json({ error: 'invalid platform' }, { status: 422 });
  const stats = await getSocialStats(platform);
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=300' },
  });
}
