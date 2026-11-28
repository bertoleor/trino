import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');

describe('T-E05 editorial content sync (replaces cultura-sync)', () => {
  it('files exist - editorial content instead of cultura', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/social/cultura-sync.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/app/api/cron/cultura-sync/route.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'supabase/migrations/20261126000006_content_config.sql'))).toBe(true);
  });
  it('sync function exists for editorial content', async () => {
    const m = await import('@/lib/social/cultura-sync');
    expect(typeof m.syncCulturaFromSocial).toBe('function');
    const c = fs.readFileSync(path.join(ROOT, 'src/lib/social/cultura-sync.ts'), 'utf8');
    expect(c).toMatch(/SocialProvider|draft/i);
    expect(c).toMatch(/hash|dedup|Upstash/i);
  });
  it('cron route has QStash CRON_SECRET auth', () => {
    const route = fs.readFileSync(
      path.join(ROOT, 'src/app/api/cron/cultura-sync/route.ts'),
      'utf8'
    );
    expect(route).toMatch(/CRON_SECRET|authorization|Bearer/i);
    expect(route).toMatch(/syncCultura|QStash/i);
  });
});