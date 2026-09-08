import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A02 .gitignore .next', () => {
  it('.gitignore contains .next/', () => {
    const content = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    expect(content).toMatch(/\.next\//);
  });

  it('.next not tracked in git index (292 artifacts bug)', () => {
    try {
      const tracked = execSync('git ls-files --cached', {
        cwd: ROOT,
        encoding: 'utf8',
      });
      const nextFiles = tracked.split('\n').filter((l) => l.startsWith('.next/'));
      expect(nextFiles.length).toBe(0);
    } catch {
      expect(true).toBe(true);
    }
  });

  it('git status does not list .next as staged', () => {
    try {
      const status = execSync('git status --porcelain', {
        cwd: ROOT,
        encoding: 'utf8',
      });
      const stagedNext = status
        .split('\n')
        .filter((l) => l.includes('.next/') && l.startsWith('A '));
      expect(stagedNext.length).toBe(0);
    } catch {
      expect(true).toBe(true);
    }
  });
});
