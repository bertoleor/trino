import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('t-s0 tooling baseline (S0 RED-first)', () => {
  describe('eslint.config.mjs deltas', () => {
    it('sets @typescript-eslint/no-explicit-any to error', () => {
      expect(read('eslint.config.mjs')).toMatch(/no-explicit-any.*['"]error['"]/);
    });

    it('sets @typescript-eslint/no-unused-vars to error', () => {
      expect(read('eslint.config.mjs')).toMatch(/no-unused-vars.*['"]error['"]/);
    });

    it('sets consistent-type-imports to error', () => {
      expect(read('eslint.config.mjs')).toMatch(/consistent-type-imports.*['"]error['"]/);
    });

    it('sets no-non-null-assertion to warn with justification', () => {
      const c = read('eslint.config.mjs');
      expect(c).toMatch(/no-non-null-assertion.*['"]warn['"]/);
    });

    it('bounds complexity / max-depth / max-params (native, sonarjs rejected)', () => {
      const c = read('eslint.config.mjs');
      expect(c).toMatch(/\bcomplexity\b/);
      expect(c).toMatch(/['"]max-depth['"]/);
      expect(c).toMatch(/['"]max-params['"]/);
      expect(c).not.toMatch(/sonarjs/);
    });

    it('sorts imports natively (simple-import-sort rejected)', () => {
      const c = read('eslint.config.mjs');
      expect(c).toMatch(/['"]sort-imports['"]/);
      expect(c).not.toMatch(/simple-import-sort/);
    });

    it('keeps next/* presets, max-lines, no-console, emoji ban, globalIgnores', () => {
      const c = read('eslint.config.mjs');
      expect(c).toMatch(/core-web-vitals/);
      expect(c).toMatch(/next\/typescript/);
      expect(c).toMatch(/max-lines/);
      expect(c).toMatch(/no-console/);
      expect(c).toMatch(/no-restricted-syntax/);
      expect(c).toMatch(/globalIgnores/);
      expect(c).toMatch(/database\.types/);
    });
  });

  describe('package.json scripts + lint-staged', () => {
    it('fixes lint script to bare "eslint ."', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg.scripts.lint).toBe('eslint .');
    });

    it('exposes format and format:check scripts', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(typeof pkg.scripts.format).toBe('string');
      expect(typeof pkg.scripts['format:check']).toBe('string');
    });

    it('declares lint-staged block with staged-only eslint --fix + prettier', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg['lint-staged']).toBeDefined();
      const block = JSON.stringify(pkg['lint-staged']);
      expect(block).toMatch(/eslint --fix/);
      expect(block).toMatch(/prettier --write/);
    });

    it('pins husky + lint-staged devDeps', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg.devDependencies.husky).toBeDefined();
      expect(pkg.devDependencies['lint-staged']).toBeDefined();
    });
  });

  describe('husky pre-commit hook (staged-only)', () => {
    it('exists and runs lint-staged (staged-only, no bare eslint .)', () => {
      const hookPath = path.join(ROOT, '.husky/pre-commit');
      expect(fs.existsSync(hookPath)).toBe(true);
      const hook = fs.readFileSync(hookPath, 'utf8');
      expect(hook).toMatch(/lint-staged/);
      expect(hook).not.toMatch(/eslint \.(?!\s)/);
    });
  });

  describe('prettier baseline + editorconfig + vscode', () => {
    it('prettier enforces printWidth/singleQuote/semi/trailingComma/lf/arrowParens', () => {
      const rc = JSON.parse(read('.prettierrc.json'));
      expect(rc.printWidth).toBe(100);
      expect(rc.singleQuote).toBe(true);
      expect(rc.semi).toBe(true);
      expect(rc.trailingComma).toBe('es5');
      expect(rc.endOfLine).toBe('lf');
      expect(rc.arrowParens).toBe('always');
    });

    it('.editorconfig declares lf/utf-8/2-space/trim', () => {
      const ec = read('.editorconfig');
      expect(ec).toMatch(/end_of_line\s*=\s*lf/);
      expect(ec).toMatch(/charset\s*=\s*utf-8/);
      expect(ec).toMatch(/indent_size\s*=\s*2/);
      expect(ec).toMatch(/trim_trailing_whitespace\s*=\s*true/);
    });

    it('.vscode/settings.json sets formatOnSave + prettier default', () => {
      const s = JSON.parse(read('.vscode/settings.json'));
      expect(s['editor.formatOnSave']).toBe(true);
      expect(s['editor.defaultFormatter']).toMatch(/prettier/i);
    });
  });

  describe('CI drift gate', () => {
    it('ci.yml fails on eslint warnings + prettier --check drift', () => {
      const ci = read('.github/workflows/ci.yml');
      expect(ci).toMatch(/--max-warnings\s*0|--max-warnings=0/);
      expect(ci).toMatch(/prettier --check/);
      expect(ci).toMatch(/git diff --name-only/);
    });
  });
});
