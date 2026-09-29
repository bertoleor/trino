import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LH = path.join(ROOT, 'lighthouserc.json');
const CI = path.join(ROOT, '.github/workflows/ci.yml');

describe('T-lhci lighthouse CI gate', () => {
  it('lighthouserc.json exists', () => {
    expect(fs.existsSync(LH)).toBe(true);
  });

  it('asserts categories:pwa with minScore 0.9', () => {
    const cfg = JSON.parse(fs.readFileSync(LH, 'utf8'));
    expect(cfg.ci.assert.assertions['categories:pwa']).toBeDefined();
    expect(cfg.ci.assert.assertions['categories:pwa'][1].minScore).toBe(0.9);
  });

  it('asserts categories:performance with minScore 0.9', () => {
    const cfg = JSON.parse(fs.readFileSync(LH, 'utf8'));
    expect(cfg.ci.assert.assertions['categories:performance']).toBeDefined();
    expect(cfg.ci.assert.assertions['categories:performance'][1].minScore).toBe(0.9);
  });

  it('collect url targets /es-AR/tienda', () => {
    const cfg = JSON.parse(fs.readFileSync(LH, 'utf8'));
    expect(JSON.stringify(cfg.ci.collect.url)).toMatch(/es-AR\/tienda/);
  });

  it('keeps LCP/CLS/INP as error assertions', () => {
    const cfg = JSON.parse(fs.readFileSync(LH, 'utf8'));
    const a = cfg.ci.assert.assertions;
    expect(a['largest-contentful-paint'][0]).toBe('error');
    expect(a['cumulative-layout-shift'][0]).toBe('error');
    expect(a['interaction-to-next-paint'][0]).toBe('error');
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
});
