import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '../..');
const GUARD = path.join(ROOT, 'scripts/neopop-style-guard.mjs');

function runGuard(args: string[] = []) {
  return spawnSync(process.execPath, [GUARD, ...args], { encoding: 'utf8' });
}

function withSource(content: string, check: (file: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trino-style-'));
  const file = path.join(dir, 'screen.tsx');
  fs.writeFileSync(file, content);
  try {
    check(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('neo-pop style guard', () => {
  it('passes on the current src tree', () => {
    const result = runGuard();
    expect(result.status, result.stderr).toBe(0);
  });

  it('rejects legacy hex, fonts and blur', () => {
    const source =
      'const a = "#fef7ff";\nconst font = "Geist";\nconst blur = "backdrop-blur-md";\n';
    withSource(source, (file) => {
      const result = runGuard(['--file', file]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/non-canonical hex/);
      expect(result.stderr).toMatch(/legacy font or icon font/);
      expect(result.stderr).toMatch(/blur\/glass is not Neo-Pop/);
    });
  });

  it('accepts the Neo-Pop HTML reference fonts', () => {
    const source = 'const display = "Rubik";\nconst body = "Plus Jakarta Sans";\n';
    withSource(source, (file) => {
      const result = runGuard(['--file', file]);
      expect(result.status, result.stderr).toBe(0);
    });
  });

  it('accepts canonical brand hex', () => {
    withSource('const a = "#FFF8E8";\n', (file) => {
      const result = runGuard(['--file', file]);
      expect(result.status, result.stderr).toBe(0);
    });
  });
});
