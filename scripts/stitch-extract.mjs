#!/usr/bin/env node
// Extracts presentation metadata from the Stitch HTML export.
// Dev-only QA source; nothing written here is imported by runtime code.

import { buildManifest, buildScreen, loadInventory, loadPlanIds } from './stitch-metadata.mjs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { PUBLICATION_GATE } from './stitch-rules.mjs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const EXPORT_ROOT =
  process.env.STITCH_EXPORT ||
  'E:/Archivos Usuario/Descargas/trino/sticht/stitch_tienda_virtual_de_maquillaje';
const GROUP = process.env.STITCH_GROUP || '2.DESKTOP';
const INVENTORY =
  process.env.STITCH_INVENTORY || 'E:/temp/opencode/stitch-inventory-2026-11-24.tsv';
const OUT_DIR = path.resolve('docs/stitch');
const EXTRACTED_DIR = path.join(OUT_DIR, 'extracted');
const BASELINE_DIR = path.join(OUT_DIR, 'baseline');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifiesto.json');
const PLAN = path.resolve('docs/plans/PLAN-migracion-frontend-neopop.md');
const VERIFY = process.argv.includes('--verify');
const REPORT_ONLY = process.argv.includes('--report-only');

async function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function hashFile(file) {
  try {
    return await sha256(await readFile(file));
  } catch {
    return null;
  }
}

async function readScreen(root, folder) {
  try {
    return await readFile(path.join(root, folder, 'code.html'), 'utf8');
  } catch {
    return null;
  }
}

function report(manifest) {
  const { group, ...summary } = manifest.summary;
  process.stdout.write(
    JSON.stringify(
      { group, snapshotSha256: manifest.snapshotSha256, ...summary, manifest: manifest.output },
      null,
      2
    ) + '\n'
  );
  process.stdout.write(`publicationGate: ${PUBLICATION_GATE}\n`);
}

function guardViolations(manifest) {
  const violations = [];
  if (manifest.summary.screensWithBannedCopy > 0) {
    violations.push(`${manifest.summary.screensWithBannedCopy} screens with banned copy`);
  }
  if (manifest.summary.baselinesVerified < manifest.summary.screens) {
    violations.push('missing baseline screenshots');
  }
  return violations;
}

async function main() {
  const config = { EXPORT_ROOT, GROUP, INVENTORY, PLAN, OUT_DIR };
  const inventoryLabel = path.basename(INVENTORY, path.extname(INVENTORY));
  const [inventory, planIds, inventorySha256, planSha256] = await Promise.all([
    loadInventory(INVENTORY),
    loadPlanIds(PLAN),
    hashFile(INVENTORY),
    hashFile(PLAN),
  ]);
  const root = path.join(EXPORT_ROOT, GROUP);
  if (!VERIFY) await mkdir(EXTRACTED_DIR, { recursive: true });

  const folders = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const screens = [];
  for (const folder of folders) {
    const html = await readScreen(root, folder);
    if (!html) continue;
    const screen = buildScreen({
      folder,
      html,
      group: GROUP,
      inventory,
      planIds,
      sourceSha256: await sha256(html),
      baselineSha256: await hashFile(path.join(BASELINE_DIR, `${folder}.png`)),
      inventoryLabel,
    });
    screens.push(screen);
    if (!VERIFY) {
      await writeFile(
        path.join(EXTRACTED_DIR, `${folder}.json`),
        JSON.stringify(screen, null, 2) + '\n',
        'utf8'
      );
    }
  }

  const manifest = buildManifest({ config, screens, inventorySha256, planSha256 });
  const serialized = JSON.stringify(manifest, null, 2) + '\n';
  if (VERIFY) {
    const frozen = await readFile(MANIFEST_PATH, 'utf8').catch(() => null);
    if (frozen !== serialized) {
      process.stderr.write('FAIL: manifest drift or missing file. Re-run the extractor.\n');
      process.exitCode = 1;
    }
  } else {
    await writeFile(MANIFEST_PATH, serialized, 'utf8');
  }
  report(manifest);

  const violations = guardViolations(manifest);
  if (!REPORT_ONLY && !VERIFY && violations.length > 0) {
    process.stderr.write(`FAIL: ${violations.join('; ')}.\n`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});
