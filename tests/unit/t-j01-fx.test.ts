import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const fx = path.join(ROOT, 'src/lib/money/fx.ts');
const comp = path.join(ROOT, 'src/components/shared/currency-switcher.tsx');
const mig = path.join(ROOT, 'supabase/migrations/0016_fx_rates.sql');
const cron = path.join(ROOT, 'src/app/api/cron/fx/route.ts');
describe('T-J01 FX ARS display-only Frankfurter Upstash', () => {
  it('fx.ts Intl.NumberFormat convert display only Decimal fallback', () => {
    expect(fs.existsSync(fx)).toBe(true);
    const c = fs.readFileSync(fx, 'utf8');
    expect(c).toMatch(/Intl\.NumberFormat/);
    expect(c).toMatch(/convert|toFixed|Decimal/i);
    expect(c).toMatch(/ARS|USD|EUR|BRL/i);
  });
  it('currency-switcher exists 44px', () => {
    expect(fs.existsSync(comp)).toBe(true);
    const c = fs.readFileSync(comp, 'utf8');
    expect(c).toMatch(/44/);
    expect(c).toMatch(/USD|EUR|BRL|ARS/i);
  });
  it('migration fx_rates base ARS target USD/EUR/BRL numeric 12,6', () => {
    expect(fs.existsSync(mig)).toBe(true);
    const c = fs.readFileSync(mig, 'utf8');
    expect(c).toMatch(/fx_rates/i);
    expect(c).toMatch(/base.*ARS|ARS.*base/i);
    expect(c).toMatch(/target.*USD.*EUR.*BRL|USD.*EUR.*BRL/i);
    expect(c).toMatch(/numeric.*12.*6/i);
    expect(c).toMatch(/fetched_at/i);
    expect(c).toMatch(/source/i);
  });
  it('cron fx Frankfurter Upstash 24h fallback', () => {
    expect(fs.existsSync(cron)).toBe(true);
    const c = fs.readFileSync(cron, 'utf8');
    expect(c).toMatch(/frankfurter|exchangerate/i);
    expect(c).toMatch(/upstash|redis|cache/i);
    expect(c).toMatch(/24h|86400|24/i);
    expect(c).toMatch(/fallback|last.*rate/i);
  });
});
