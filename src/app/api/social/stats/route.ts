import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getSocialStats } from '@/lib/social/graph';

export const dynamic = 'force-dynamic';

// T-S12 (auditoría 34-auditor, LOW, CWE-770 / OWASP A04): this route had no
// per-route rate limit; on cache MISS it calls the social provider whose budget
// is 200/h per provider (SOCIAL_RATE_LIMITS). The generic per-IP proxy tier does
// not protect that global budget (IP rotation, cold instances with an empty
// in-memory cache). Fail fast with the per-platform limiter BEFORE any fetch;
// platform validation runs first so garbage requests cannot drain the budget.

export async function GET(req: NextRequest) {
  const platform =
    (req.nextUrl.searchParams.get('platform') as 'tiktok' | 'instagram' | 'youtube') ?? 'instagram';
  const allowed = ['tiktok', 'instagram', 'youtube'] as const;
  if (!allowed.includes(platform))
    return NextResponse.json({ error: 'invalid platform' }, { status: 422 });
  const rl = await checkRateLimit(`social:${platform}`, 'social');
  if (!rl.success) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429, headers: rl.headers });
  }
  const stats = await getSocialStats(platform);
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=300',
      ...rl.headers,
    },
  });
}
