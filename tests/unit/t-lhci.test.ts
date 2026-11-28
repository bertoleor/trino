import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LH = path.join(ROOT, 'lighthouserc.json');
const CI = path.join(ROOT, '.github/workflows/ci.yml');
const config = () => JSON.parse(fs.readFileSync(LH, 'utf8'));

describe('T-lhci lighthouse CI gate', () => {
  it('lighthouserc.json exists', () => {
    expect(fs.existsSync(LH)).toBe(true);
  });

  it('asserts categories:performance with minScore 0.9', () => {
    const cfg = config();
    expect(cfg.ci.assert.assertions['categories:performance']).toBeDefined();
    expect(cfg.ci.assert.assertions['categories:performance'][1].minScore).toBe(0.9);
  });

  it('collect url targets /es-AR/tienda', () => {
    const cfg = config();
    expect(JSON.stringify(cfg.ci.collect.url)).toMatch(/es-AR\/tienda/);
  });

  it('keeps LCP/CLS as error assertions', () => {
    const a = config().ci.assert.assertions;
    expect(a['largest-contentful-paint'][0]).toBe('error');
    expect(a['cumulative-layout-shift'][0]).toBe('error');
  });

  it('starts the production server before collecting runs', () => {
    const collect = config().ci.collect;
    expect(collect.startServerCommand).toMatch(/next start/);
    expect(collect.startServerReadyPattern).toMatch(/Ready|Local/);
    expect(collect.startServerReadyTimeout).toBeGreaterThanOrEqual(60_000);
  });

  it('drops assertions Lighthouse 13 cannot collect here', () => {
    const a = config().ci.assert.assertions;
    expect(a['categories:pwa']).toBeUndefined();
    expect(a['interaction-to-next-paint']).toBeUndefined();
  });

  it('ci.yml workflow exists', () => {
    expect(fs.existsSync(CI)).toBe(true);
  });

  it('ci.yml runs lhci autorun --assert --upload', () => {
    const c = fs.readFileSync(CI, 'utf8');
    expect(c).toMatch(/lhci autorun/);
    expect(c).toMatch(/--assert/);
    expect(c).toMatch(/--upload/);
  });

  it('ci.yml gates tsc, eslint, vitest, build', () => {
    const c = fs.readFileSync(CI, 'utf8');
    expect(c).toMatch(/tsc --noEmit/);
    expect(c).toMatch(/eslint/);
    expect(c).toMatch(/vitest run/);
    expect(c).toMatch(/pnpm build/);
  });

  it('ci.yml includes drift guard gen types --local', () => {
    const c = fs.readFileSync(CI, 'utf8');
    expect(c).toMatch(/gen types typescript --local/);
    expect(c).toMatch(/diff --exit-code/);
  });

  it('ci.yml runs on main pushes without a duplicated refs prefix', () => {
    const c = fs.readFileSync(CI, 'utf8');
    expect(c).toMatch(/github\.ref == 'refs\/heads\/main'/);
    expect(c).not.toMatch(/refs\/refs\/heads\/main/);
  });

  it('ci.yml uses placeholder-only credentials for the local server', () => {
    const c = fs.readFileSync(CI, 'utf8');
    expect(c).toMatch(/NEXT_PUBLIC_SUPABASE_URL: https:\/\/placeholder\.supabase\.co/);
    expect(c).toMatch(/NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key/);
    expect(c).toMatch(/SUPABASE_SERVICE_ROLE: placeholder-service-role/);
    expect(c).not.toMatch(/SUPABASE_SERVICE_ROLE: (?!placeholder)/);
  });
});
