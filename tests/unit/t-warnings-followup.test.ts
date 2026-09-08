import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// warnings-pr-followup RED-first guards:
// 1. Eight pre-existing complexity warnings get per-site ticket-justified disables
//    (zero behavior change; keeps CI --max-warnings 0 green).
// 2. cron/fx `rows as never` narrows via the shared TypedSupabase/isRecord boundary.
const COMPLEXITY_SITES: Array<{
  file: string;
  ticket: string;
  value: number;
  anchor: RegExp;
}> = [
  {
    file: 'src/app/api/admin/shipping/batch/route.ts',
    ticket: 'warnings-pr-followup/COMP-1',
    value: 27,
    anchor: /export async function POST/,
  },
  {
    file: 'src/app/api/checkout/route.ts',
    ticket: 'warnings-pr-followup/COMP-2',
    value: 15,
    anchor: /export async function POST/,
  },
  {
    file: 'src/app/api/webhooks/mercadopago/route.ts',
    ticket: 'warnings-pr-followup/COMP-3',
    value: 19,
    anchor: /export async function POST/,
  },
  {
    file: 'src/lib/actions/reviews.ts',
    ticket: 'warnings-pr-followup/COMP-4',
    value: 16,
    anchor: /export async function createReview/,
  },
  {
    file: 'src/lib/actions/wishlist.ts',
    ticket: 'warnings-pr-followup/COMP-5',
    value: 22,
    anchor: /export async function toggleWishlist/,
  },
  {
    file: 'src/lib/validations/money.ts',
    ticket: 'warnings-pr-followup/COMP-6',
    value: 18,
    anchor: /export function toCents/,
  },
  {
    file: 'src/app/api/webhooks/stripe/route.ts',
    ticket: 'warnings-pr-followup/COMP-7',
    value: 13,
    anchor: /export async function POST/,
  },
  {
    file: 'src/app/api/webhooks/paypal/route.ts',
    ticket: 'warnings-pr-followup/COMP-8',
    value: 14,
    anchor: /export async function POST/,
  },
];

describe('t-followup per-site complexity disables (ticket-justified, no refactor)', () => {
  it('every flagged site carries its COMP ticket + pre-existing value', () => {
    const missing: string[] = [];
    for (const s of COMPLEXITY_SITES) {
      const c = read(s.file);
      const line = c
        .split('\n')
        .find((l) => l.includes('eslint-disable-next-line complexity') && l.includes(s.ticket));
      if (!line || !line.includes(`pre-existing ${s.value}`)) missing.push(`${s.file} ${s.ticket}`);
    }
    expect(missing).toEqual([]);
  });
  it('each disable sits on its own line directly above the flagged function', () => {
    const bad: string[] = [];
    for (const s of COMPLEXITY_SITES) {
      const lines = read(s.file).split('\n');
      const anchorIdx = lines.findIndex((l) => s.anchor.test(l));
      const disableIdx = lines.findIndex(
        (l) => l.includes('eslint-disable-next-line complexity') && l.includes(s.ticket)
      );
      if (anchorIdx === -1 || disableIdx === -1 || disableIdx !== anchorIdx - 1)
        bad.push(`${s.file} ${s.ticket}`);
    }
    expect(bad).toEqual([]);
  });
  it('disables satisfy the t-s1 justification+ticket gate', () => {
    const bad: string[] = [];
    for (const s of COMPLEXITY_SITES) {
      read(s.file)
        .split('\n')
        .forEach((l, i) => {
          if (/eslint-disable/.test(l) && !/--\s+\S.*ticket:/.test(l))
            bad.push(`${s.file}:${i + 1}`);
        });
    }
    expect(bad).toEqual([]);
  });
});

describe('t-followup fx rows narrowing (TypedSupabase/isRecord boundary)', () => {
  it('cron/fx route keeps zero as-never casts', () => {
    const bad = read('src/app/api/cron/fx/route.ts')
      .split('\n')
      .filter((l) => l.includes('as never'));
    expect(bad).toEqual([]);
  });
  it('narrows via the shared boundary (same pattern as S2)', () => {
    const c = read('src/app/api/cron/fx/route.ts');
    expect(c).toMatch(/toTypedSupabase/);
    expect(c).toMatch(/isRecord/);
    expect(c).toMatch(/from\('fx_rates'\)\.insert/);
  });
  it('accepts the same rows (base ARS, frankfurter source, fetched_at)', () => {
    const c = read('src/app/api/cron/fx/route.ts');
    expect(c).toMatch(/Object\.entries\(rates\)/);
    expect(c).toMatch(/base:\s*'ARS'/);
    expect(c).toMatch(/source:\s*'frankfurter'/);
    expect(c).toMatch(/fetched_at:\s*new Date\(\)\.toISOString\(\)/);
  });
  it('preserves fx behavior keywords (fallback last rate, upstash 24h cache)', () => {
    const c = read('src/app/api/cron/fx/route.ts');
    expect(c).toMatch(/fallback last rate/);
    expect(c).toMatch(/86400/);
    expect(c).toMatch(/isCronAuthorized/);
  });
});
