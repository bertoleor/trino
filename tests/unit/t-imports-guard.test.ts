import { beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

interface LintMessage {
  ruleId: string | null;
}

// T1 RED-first guard: repo-wide import order must be fully mechanical-clean.
// Counts come from a real `eslint . -f json` scan (single run in beforeAll),
// scoped to the two T1 rules only: sort-imports + consistent-type-imports.
let sortErrors = -1;
let typeImportErrors = -1;

function runEslintJson(): Array<{ messages: LintMessage[] }> {
  try {
    const out = execFileSync('npx eslint . -f json', {
      cwd: ROOT,
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300000,
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(out) as Array<{ messages: LintMessage[] }>;
  } catch (err) {
    const withStdout = err as { stdout?: string };
    if (typeof withStdout.stdout === 'string' && withStdout.stdout.trim().length > 0) {
      // eslint exits non-zero when errors exist; the JSON payload is still on stdout.
      return JSON.parse(withStdout.stdout) as Array<{ messages: LintMessage[] }>;
    }
    throw err;
  }
}

describe('t-imports-guard T1 import order (RED-first)', () => {
  it('keeps sort-imports and consistent-type-imports at error in eslint config', () => {
    const c = read('eslint.config.mjs');
    expect(c).toMatch(/['"]sort-imports['"]/);
    expect(c).toMatch(/consistent-type-imports.*['"]error['"]/);
  });

  beforeAll(() => {
    const results = runEslintJson();
    const messages = results.flatMap((f) => f.messages);
    sortErrors = messages.filter((m) => m.ruleId === 'sort-imports').length;
    typeImportErrors = messages.filter(
      (m) => m.ruleId === '@typescript-eslint/consistent-type-imports'
    ).length;
  }, 300000);

  it('reports 0 sort-imports errors repo-wide', () => {
    expect(sortErrors).toBe(0);
  });

  it('reports 0 consistent-type-imports errors repo-wide', () => {
    expect(typeImportErrors).toBe(0);
  });
});
