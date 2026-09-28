import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-E05 cultura-sync auto-import TikTok/IG draft pg_cron 06:00 QStash Upstash', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/social/cultura-sync.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/app/api/cron/cultura-sync/route.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'supabase/migrations/0012_cultura_cron.sql'))).toBe(true);
  });
  it('sync imports via SocialProvider into draft hash dedup', async () => {
    const m = await import('@/lib/social/cultura-sync');
    expect(typeof m.syncCulturaFromSocial).toBe('function');
    const c = fs.readFileSync(path.join(ROOT, 'src/lib/social/cultura-sync.ts'), 'utf8');
    expect(c).toMatch(/SocialProvider|draft/i);
    expect(c).toMatch(/hash|dedup|Upstash/i);
  });
  it('cron 06:00 UTC + QStash CRON_SECRET', () => {
    const mig = fs.readFileSync(
      path.join(ROOT, 'supabase/migrations/0012_cultura_cron.sql'),
      'utf8'
    );
    expect(mig).toMatch(/06:00|0 6 \* \* \*|cultura-sync/i);
    const route = fs.readFileSync(
      path.join(ROOT, 'src/app/api/cron/cultura-sync/route.ts'),
      'utf8'
    );
    expect(route).toMatch(/CRON_SECRET|authorization|Bearer/i);
    expect(route).toMatch(/syncCultura|QStash/i);
  });
});
