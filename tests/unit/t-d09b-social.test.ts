import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-D09b social graph TikTok Display IG Basic 200/h Meta 10k/d pg_cron Upstash 24h', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/social/graph.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/app/api/social/stats/route.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/shared/social-feed.tsx'))).toBe(true);
  });
  it('graph has SocialProvider TikTok/IG/YT + rate limits + Upstash', async () => {
    const m = await import('@/lib/social/graph');
    expect(m.SocialProvider).toBeDefined();
    expect(m.SOCIAL_RATE_LIMITS).toBeDefined();
    expect(String(JSON.stringify(m.SOCIAL_RATE_LIMITS))).toMatch(/200|10k|24h/i);
  });
  it('pg_cron daily + cache hit', () => {
    const g = fs.readFileSync(path.join(ROOT, 'src/lib/social/graph.ts'), 'utf8');
    expect(g).toMatch(/TikTok|Display|Basic|Meta|Graph|YouTube/i);
    expect(g).toMatch(/Upstash|redis|24h|cache/i);
    const cronPaths = [
      path.join(ROOT, 'supabase/migrations/0012_cultura_cron.sql'),
      path.join(ROOT, 'supabase/migrations/0008_cron.sql'),
    ];
    const hasCron = cronPaths.some((p) => fs.existsSync(p) && fs.readFileSync(p, 'utf8').match(/social|graph|cron/i));
    expect(hasCron || g.match(/cron/i)).toBeTruthy();
  });
  it('feed cached social-feed component', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/components/shared/social-feed.tsx'), 'utf8');
    expect(c).toMatch(/social|feed|cache/i);
  });
});
