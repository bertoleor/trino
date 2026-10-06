import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T3 RED-first guard: 6 live complexity sites get per-site ticket-justified
// disables (zero behavior change; auth-critical proxy paths are T4-owned for
// substantive hardening). Precedent: warnings-pr-followup COMP-1…8 (pinned by
// t-warnings-followup — reused, never re-ticketed, no double-ticketing).
type Site = { file: string; ticket: string; value: number; anchor: RegExp };
const COMPLEXITY_SITES: Site[] = [
  {
    file: 'src/proxy.ts',
    ticket: 'repo-cleanup-final/COMP-9',
    value: 20,
    anchor: /export async function proxy\(/,
  },
  {
    file: 'src/proxy.ts',
    ticket: 'repo-cleanup-final/COMP-10',
    value: 17,
    anchor: /export async function updateSession\(/,
  },
  {
    file: 'src/lib/customer360.ts',
    ticket: 'repo-cleanup-final/COMP-11',
    value: 17,
    anchor: /export async function getCustomer360\(/,
  },
  {
    file: 'src/app/api/shipping/rates/route.ts',
    ticket: 'repo-cleanup-final/COMP-12',
    value: 17,
    anchor: /export async function POST\(/,
  },
  {
    file: 'src/app/api/internal/audit/route.ts',
    ticket: 'repo-cleanup-final/COMP-13',
    value: 15,
    anchor: /export async function POST\(/,
  },
  {
    file: 'src/lib/logger.ts',
    ticket: 'repo-cleanup-final/COMP-14',
    value: 13,
    anchor: /function emit\(/,
  },
];

// Non-null sites fixed by behavior change are T4-owned or boot-guaranteed:
// per-site ticket-justified disables (no blanket disable). All other sites
// are remediated with guard / ?. / ?? (asserted zero-assertion below).
const NONNULL_JUSTIFIED: Array<{ file: string; ticket: string; lines: number }> = [
  { file: 'src/lib/supabase/client.ts', ticket: 'repo-cleanup-final/COMP-15', lines: 2 },
  { file: 'src/lib/supabase/server.ts', ticket: 'repo-cleanup-final/COMP-15', lines: 2 },
  { file: 'src/lib/rate-limit.ts', ticket: 'repo-cleanup-final/COMP-16', lines: 2 },
  // 3 sites post prettier-100 re-wrap: the createServerClient env pair needed
  // one disable per line (URL/ANON_KEY), plus the rows[0] reduce site.
  { file: 'src/proxy.ts', ticket: 'repo-cleanup-final/COMP-17', lines: 3 },
];

// Files whose non-null sites MUST be remediated in code (no ticket disable).
const NONNULL_FIXED = [
  'src/lib/rate-limit.ts',
  'tests/integration/rls-two-role.test.ts',
  'tests/unit/auth-sync.test.ts',
  'tests/unit/shipping-labels.test.ts',
  'tests/unit/t-d03b-international.test.ts',
  'tests/unit/t-pr1-next-config-private.test.ts',
  'tests/unit/t-s03-security.test.ts',
  'tests/unit/t-s04-shipping-fix.test.ts',
];

function assertionLines(content: string): string[] {
  const lines = content.split('\n');
  return lines.filter((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.includes('eslint-disable')) return false;
    const prev = i > 0 ? lines[i - 1] : '';
    if ((prev ?? '').includes('eslint-disable-next-line @typescript-eslint/no-non-null-assertion'))
      return false;
    const code = l.replace(/!==?/g, '');
    return /[\w)'\]"?]!(?=[.([,);]|\s|$)/.test(code);
  });
}

describe('t3 complexity per-site disables (ticket-justified, no refactor)', () => {
  it('every live site carries its COMP ticket + pre-existing value', () => {
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
  it('8 prior COMP tickets are reused untouched (no double-ticketing)', () => {
    const all = [
      'src/app/api/admin/shipping/batch/route.ts',
      'src/app/api/checkout/route.ts',
      'src/app/api/webhooks/mercadopago/route.ts',
      'src/lib/actions/reviews.ts',
      'src/lib/actions/wishlist.ts',
      'src/lib/validations/money.ts',
      'src/app/api/webhooks/stripe/route.ts',
      'src/app/api/webhooks/paypal/route.ts',
    ];
    const hits = all.filter((f) => read(f).includes('warnings-pr-followup/COMP-'));
    expect(hits).toHaveLength(8);
  });
});

describe('t3 non-null dispositions (fix or per-site ticket)', () => {
  it('justified sites carry per-site ticket disables with rationale', () => {
    const bad: string[] = [];
    for (const s of NONNULL_JUSTIFIED) {
      const assertion = 'eslint-disable-next-line @typescript-eslint/no-non-null-assertion';
      const count = read(s.file)
        .split('\n')
        .filter((l) => l.includes(assertion) && l.includes(s.ticket)).length;
      if (count !== s.lines) bad.push(`${s.file} ${s.ticket}: found ${count}, want ${s.lines}`);
    }
    expect(bad).toEqual([]);
  });
  it('fixed files carry zero non-null assertions', () => {
    const bad: string[] = [];
    for (const f of NONNULL_FIXED) {
      for (const l of assertionLines(read(f))) bad.push(`${f}: ${l.trim()}`);
    }
    expect(bad).toEqual([]);
  });
  it('disables satisfy the t-s1 justification+ticket gate (src scope)', () => {
    const bad: string[] = [];
    const files = COMPLEXITY_SITES.map((s) => s.file);
    const srcFiles = [...new Set([...files, 'src/lib/rate-limit.ts'])];
    for (const f of srcFiles) {
      read(f)
        .split('\n')
        .forEach((l, i) => {
          if (/eslint-disable/.test(l) && !/--\s+\S.*ticket:/.test(l)) bad.push(`${f}:${i + 1}`);
        });
    }
    expect(bad).toEqual([]);
  });
});
