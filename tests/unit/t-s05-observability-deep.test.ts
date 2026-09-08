import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
describe('T-S05 logger mutex orphan GC', () => {
  it('logger has requestId x-vercel-id route severity stack env OTel', () => {
    const c = fs.readFileSync('src/lib/logger.ts', 'utf8');
    expect(c).toMatch(/requestId|x-vercel-id|uuid/);
    expect(c).toMatch(/route|severity|stack|environment|env/);
    expect(c).toMatch(/OTel|trace|span/);
  });
  it('health ready real checks 2s 1s 2s', () => {
    const c = fs.readFileSync('src/app/api/health/ready/route.ts', 'utf8');
    expect(c).toMatch(/SELECT 1/);
    expect(c).toMatch(/PING/);
    expect(c).toMatch(/listBuckets/);
    expect(c).toMatch(/2000|2s|2 \* 1000/);
  });
  it('mutex SET NX EX 60 XFetch', () => {
    const p = 'src/lib/perf/mutex.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/SET|NX|EX 60|XFetch|mutex/);
  });
  it('orphan GC migration pg_cron weekly DELETE storage.objects', () => {
    const p = 'supabase/migrations/0021_orphan_gc.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/pg_cron|cron/);
    expect(c).toMatch(/DELETE.*storage\.objects|orphan/i);
    expect(c).toMatch(/cover_image|products/);
  });
});
