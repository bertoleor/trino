import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const mig = path.join(ROOT, 'supabase/migrations/0015_launches.sql');
const page = path.join(ROOT, 'src/app/[locale]/admin/lanzamientos/page.tsx');
const comp = path.join(ROOT, 'src/components/shared/launch-countdown.tsx');
describe('T-H02 launches drop/collection/restock countdown', () => {
  it('migration exists with launches table and indexes', () => {
    expect(fs.existsSync(mig)).toBe(true);
    const c = fs.readFileSync(mig, 'utf8');
    expect(c).toMatch(/create table.*launches/i);
    expect(c).toMatch(/id uuid primary key default gen_random_uuid/i);
    expect(c).toMatch(/product_id uuid.*references.*products/i);
    expect(c).toMatch(/launch_date timestamptz not null/i);
    expect(c).toMatch(/type text.*check.*drop.*collection.*restock/i);
    expect(c).toMatch(/status text.*check.*scheduled.*live.*ended/i);
    expect(c).toMatch(/teaser_image text/i);
    expect(c).toMatch(/created_at timestamptz/i);
    expect(c).toMatch(/idx_launches_launch_date/i);
  });
  it('admin lanzamientos page exists with is_admin 403', () => {
    expect(fs.existsSync(page)).toBe(true);
    const c = fs.readFileSync(page, 'utf8');
    expect(c).toMatch(/is_admin/i);
    expect(c).toMatch(/403/i);
    expect(c).toMatch(/lanzamientos|launches/i);
  });
  it('launch-countdown SSR tick Intl.RelativeTimeFormat 4 locales 44px', () => {
    expect(fs.existsSync(comp)).toBe(true);
    const c = fs.readFileSync(comp, 'utf8');
    expect(c).toMatch(/Intl\.RelativeTimeFormat/);
    expect(c).toMatch(/es-AR/);
    expect(c).toMatch(/en/);
    expect(c).toMatch(/fr/);
    expect(c).toMatch(/pt-BR/);
    expect(c).toMatch(/44/);
    expect(c).toMatch(/useEffect|setInterval|tick/i);
  });
});
