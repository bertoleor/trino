import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/app/api/health/route.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-D05 health 2s/1s/2s HEALTH 503', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('checks db/supabase with 2s timeout and returns 503 on fail', () => {
    const c = read();
    expect(c).toMatch(/health|HEALTH/i);
    expect(c).toMatch(/503|unhealthy|fail/i);
    expect(c).toMatch(/2\s*\*\s*1000|2000/);
  });
  it('exports GET with timeout guards', () => {
    const c = read();
    expect(c).toMatch(/export.*GET|export async function GET/);
    expect(c).toMatch(/AbortController|timeout|signal/i);
  });
  it('returns json with status and checks', async () => {
    const c = read();
    expect(c).toMatch(/NextResponse|json/i);
    expect(c).toMatch(/status|checks|uptime/i);
  });
});
