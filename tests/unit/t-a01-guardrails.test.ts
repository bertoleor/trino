import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A01 guardrails CQ-03 enforcement', () => {
  it('eslint enforces max 150 lines', () => {
    const content = fs.readFileSync(path.join(ROOT, 'eslint.config.mjs'), 'utf8');
    expect(content).toMatch(/max-lines/);
    expect(content).toMatch(/150/);
  });

  it('eslint bans console and emojis', () => {
    const content = fs.readFileSync(path.join(ROOT, 'eslint.config.mjs'), 'utf8');
    expect(content).toMatch(/no-console/);
    expect(content).toMatch(/no-restricted-syntax|emoji/i);
  });

  it('tsconfig strict with noUncheckedIndexedAccess', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8'));
    expect(cfg.compilerOptions.strict).toBe(true);
    expect(cfg.compilerOptions.noUncheckedIndexedAccess).toBe(true);
  });

  it('vitest coverage gates 90 critical 80 global', () => {
    const content = fs.readFileSync(path.join(ROOT, 'vitest.config.ts'), 'utf8');
    expect(content).toMatch(/thresholds|threshold/i);
    expect(content).toMatch(/90/);
    expect(content).toMatch(/80/);
  });

  it('package.json scripts include lint typecheck coverage', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts['test:coverage']).toBeDefined();
    const hasTypeCheck =
      pkg.scripts.typecheck !== undefined || pkg.scripts['type:check'] !== undefined;
    expect(hasTypeCheck).toBe(true);
  });
});
