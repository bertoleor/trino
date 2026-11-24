import { LEGACY_SIGNAL, NEOPOP_SIGNAL } from './stitch-rules.mjs';

export function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

export function visibleText(html) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function collectMatches(html, pattern, index = 1) {
  const values = new Set();
  for (const match of html.matchAll(pattern)) {
    const value = decodeEntities(match[index] ?? '').trim();
    if (value) values.add(value);
  }
  return [...values].sort();
}

export function guardText(html) {
  return [
    visibleText(html),
    ...collectMatches(html, /\b(?:alt|placeholder|title|aria-label)="([^"]*)"/gi),
  ].join(' ');
}

export function collectImages(html) {
  const images = [];
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = tag[0].match(/\bsrc="([^"]+)"/i)?.[1];
    if (!src) continue;
    images.push({
      src,
      alt: decodeEntities(tag[0].match(/\balt="([^"]*)"/i)?.[1] ?? ''),
      external: /^https?:\/\//i.test(src),
      googleusercontent: /googleusercontent\.com/i.test(src),
    });
  }
  return images;
}

export function classify(html) {
  const legacy = LEGACY_SIGNAL.test(html);
  const neo = NEOPOP_SIGNAL.test(html);
  if (legacy && neo) return 'M';
  if (legacy) return 'L';
  if (neo) return 'N';
  return 'U';
}

export function styleSignals(html) {
  return {
    legacy: LEGACY_SIGNAL.test(html),
    neoPop: NEOPOP_SIGNAL.test(html),
    blur: /backdrop-blur|filter:\s*blur/i.test(html),
    tailwindCdn: /cdn\.tailwindcss\.com/i.test(html),
  };
}
