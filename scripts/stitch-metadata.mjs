import { BANNED_COPY, DECISION_RULES, PUBLICATION_GATE } from './stitch-rules.mjs';
import {
  classify,
  collectImages,
  collectMatches,
  guardText,
  styleSignals,
  visibleText,
} from './stitch-html.mjs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export async function loadInventory(inventoryPath) {
  const entries = new Map();
  try {
    const tsv = await readFile(inventoryPath, 'utf8');
    for (const line of tsv.split(/\r?\n/).slice(1)) {
      const [tag, shell, , , folder] = line.split('\t').map((value) => value?.trim());
      if (!folder) continue;
      entries.set(folder, { tag, shell });
    }
  } catch {
    // Fall back to signals computed from the HTML when no inventory is present.
  }
  return entries;
}

export async function loadPlanIds(planPath) {
  const ids = new Map();
  try {
    const plan = await readFile(planPath, 'utf8');
    for (const match of plan.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`/gm)) {
      if (!ids.has(match[2])) ids.set(match[2], Number(match[1]));
    }
  } catch {
    // Plan IDs are optional metadata; the manifest still carries the folder name.
  }
  return ids;
}

export function buildScreen({
  folder,
  html,
  group,
  inventory,
  planIds,
  sourceSha256,
  baselineSha256,
  inventoryLabel,
}) {
  const recorded = inventory.get(folder);
  const text = guardText(html);
  const computedClassification = classify(html);
  const images = collectImages(html);
  const shell =
    recorded?.shell ||
    html.match(/<meta[^>]+name="shell-type"[^>]*content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]*name="shell-type"/i)?.[1] ||
    'NONE';

  return {
    planId: planIds.get(folder) ?? null,
    folder,
    source: path.join(group, folder, 'code.html'),
    sourceSha256,
    shell,
    classification: recorded?.tag || computedClassification,
    classificationSource: recorded?.tag ? inventoryLabel : 'html-signals',
    computedClassification,
    styleSignals: styleSignals(html),
    textPreview: visibleText(html).slice(0, 240),
    classes: [
      ...new Set(
        collectMatches(html, /\bclass="([^"]+)"/gi).flatMap((value) =>
          value.split(/\s+/).filter(Boolean)
        )
      ),
    ].sort(),
    aria: [...new Set(collectMatches(html, /\b(aria-[a-z-]+="[^"]+")/gi))].sort(),
    dataPaths: collectMatches(html, /\bdata-path="([^"]+)"/gi),
    images: images.map((image, index) => ({
      ...image,
      localPath: `public/stitch/${folder}/${String(index + 1).padStart(2, '0')}.jpg`,
      mirrored: false,
      licenseStatus: 'pending-owner-legal',
    })),
    baseline: {
      source: path.join(group, folder, 'screen.png'),
      localPath: `docs/stitch/baseline/${folder}.png`,
      sha256: baselineSha256,
      qaOnly: true,
    },
    bannedCopy: BANNED_COPY.filter(([, pattern]) => pattern.test(text)).map(([label]) => label),
  };
}

export function buildManifest({ config, screens, inventorySha256, planSha256 }) {
  const { EXPORT_ROOT, GROUP, INVENTORY, PLAN, OUT_DIR } = config;
  const snapshot = [inventorySha256, planSha256, ...screens.map((screen) => screen.sourceSha256)]
    .join('\n');
  return {
    schemaVersion: 2,
    frozen: true,
    snapshotSha256: createHash('sha256').update(snapshot).digest('hex'),
    inputHashes: { inventory: inventorySha256, plan: planSha256 },
    exportRoot: EXPORT_ROOT,
    group: GROUP,
    inventory: INVENTORY,
    plan: path.relative(process.cwd(), PLAN),
    scope: 'desktop-presentation-only',
    decisionRules: DECISION_RULES,
    bannedCopy: BANNED_COPY.map(([label]) => label),
    screens,
    summary: {
      screens: screens.length,
      byClassification: screens.reduce((counts, screen) => {
        counts[screen.classification] = (counts[screen.classification] ?? 0) + 1;
        return counts;
      }, {}),
      screensWithBannedCopy: screens.filter((screen) => screen.bannedCopy.length > 0).length,
      imageRefs: screens.reduce((total, screen) => total + screen.images.length, 0),
      googleusercontentRefs: screens.reduce(
        (total, screen) => total + screen.images.filter((image) => image.googleusercontent).length,
        0
      ),
      mirroredAssets: 0,
      baselinesVerified: screens.filter((screen) => screen.baseline.sha256).length,
    },
    publicationGate: PUBLICATION_GATE,
    output: path.relative(process.cwd(), path.join(OUT_DIR, 'manifiesto.json')),
  };
}
