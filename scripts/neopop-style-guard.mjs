#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS = path.join(ROOT, 'docs/brand/trino-tokens.css');
const SRC = path.join(ROOT, 'src');
const DEFINITIONS = path.join(ROOT, 'src/styles/tokens.css');
const EXTENSIONS = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const LEGACY = [
  {
    message: 'legacy font or icon font',
    // Rubik and Plus Jakarta Sans are the Neo-Pop HTML reference fonts and are allowed here.
    test: /\bGeist\b|material-symbols-outlined/i,
  },
  { message: 'blur/glass is not Neo-Pop', test: /backdrop-blur|backdrop-filter/i },
];

export function readCanonicalHexes() {
  const content = fs.readFileSync(TOKENS, 'utf8');
  return new Set(Array.from(content.matchAll(HEX), (match) => match[0].toLowerCase()));
}

export function lintSource(filePath, content, allowedHexes) {
  const violations = [];
  content.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    for (const match of line.matchAll(HEX)) {
      if (!allowedHexes.has(match[0].toLowerCase())) {
        violations.push({ filePath, line: index + 1, value: match[0], rule: 'non-canonical hex' });
      }
    }
    for (const legacy of LEGACY) {
      if (legacy.test.test(line)) {
        violations.push({ filePath, line: index + 1, value: trimmed, rule: legacy.message });
      }
    }
  });
  return violations;
}

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, files);
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

export function scanSourceStyle() {
  const allowed = readCanonicalHexes();
  return collectFiles(SRC)
    .filter((file) => path.resolve(file) !== DEFINITIONS)
    .flatMap((file) => lintSource(file, fs.readFileSync(file, 'utf8'), allowed));
}

function report(violations) {
  if (violations.length === 0) {
    process.stdout.write('neo-pop style guard: ok\n');
    return;
  }
  const details = violations
    .map(
      (item) => `${path.relative(ROOT, item.filePath)}:${item.line} [${item.rule}] ${item.value}`
    )
    .join('\n');
  process.stderr.write(`neo-pop style guard: ${violations.length} violation(s)\n${details}\n`);
  process.exitCode = 1;
}

function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0) {
    const target = path.resolve(args[fileIndex + 1] ?? '');
    report(lintSource(target, fs.readFileSync(target, 'utf8'), readCanonicalHexes()));
    return;
  }
  report(scanSourceStyle());
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
