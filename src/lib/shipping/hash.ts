import crypto from 'node:crypto';
export function computeShippingHash(postalCode: string, items: unknown[]): string {
  const sorted = [...items].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const inner = crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  return crypto.createHash('sha256').update(postalCode + inner).digest('hex');
}
export const hashVersion = 'sha256';
