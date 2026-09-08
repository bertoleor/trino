import { beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T2 RED-first guard: config repair + touched-scope format + archive exclusion.
// TOUCHED SCOPE (T2 slice files only — never archive/**, never unrelated):
// - openspec/config.yaml (task 2.2 minimal repair)
// - tests/unit/t-prettier-guard.test.ts (this guard)
// - openspec/changes/repo-cleanup-final/tasks.md (checkboxes + evidence)
// `.prettierignore` has no prettier parser, so it is content-asserted, not --check asserted.
const TOUCHED = [
  'openspec/config.yaml',
  'tests/unit/t-prettier-guard.test.ts',
  'openspec/changes/repo-cleanup-final/tasks.md',
];

// Archive/generated paths that MUST carry no tracked modifications from this slice.
const ARCHIVE_PATHS = ['openspec/changes/archive', 'sdd', 'DOCS'];

function run(cmd: string): { exit: number; output: string } {
  try {
    const out = execFileSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000,
      maxBuffer: 64 * 1024 * 1024,
    });
    return { exit: 0, output: out };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    return { exit: 1, output: `${e.stdout ?? ''}\n${e.stderr ?? ''}` };
  }
}

function trackedDiff(paths: string[]): string {
  const worktree = run(`git diff --name-only -- ${paths.join(' ')}`).output.trim();
  const staged = run(`git diff --cached --name-only -- ${paths.join(' ')}`).output.trim();
  return [worktree, staged].filter((s) => s.length > 0).join('\n');
}

let configCheckExit = -1;
let configCheckOutput = '';
let touchedCheckExit = -1;
let touchedCheckOutput = '';
let archiveDiff = 'unset';

describe('t-prettier-guard T2 config + format (RED-first)', () => {
  beforeAll(() => {
    const c = run('npx prettier --check openspec/config.yaml');
    configCheckExit = c.exit;
    configCheckOutput = c.output;
    const t = run(`npx prettier --check ${TOUCHED.join(' ')}`);
    touchedCheckExit = t.exit;
    touchedCheckOutput = t.output;
    archiveDiff = trackedDiff(ARCHIVE_PATHS);
  }, 300000);

  it('openspec/config.yaml parses and is tooling-readable (prettier --check exit 0)', () => {
    expect(`${configCheckOutput}\n exit=${configCheckExit}`).not.toMatch(/SyntaxError/);
    expect(configCheckExit).toBe(0);
  });

  it('touched scope is prettier --check clean', () => {
    expect(touchedCheckOutput).not.toMatch(/Code style issues/);
    expect(touchedCheckExit).toBe(0);
  });

  it('.prettierignore excludes archives and generated history', () => {
    const ignore = read('.prettierignore');
    expect(ignore).toMatch(/openspec\/changes\/archive\/\*\*/);
    expect(ignore).toMatch(/openspec\/\*\*\/verify-report\*\.md/);
    expect(ignore).toMatch(/^sdd\/\*\*/m);
    expect(ignore).toMatch(/^DOCS\/\*\*/m);
  });

  it('no archive file carries tracked modifications from this slice', () => {
    expect(archiveDiff).toBe('');
  });
});
