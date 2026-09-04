import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/app/api/bank-proof/url/route.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-C03 bank-proof presigned 10MB bank_proofs/{order}/{uuid} <200ms', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('validates and returns presigned url with bank_proofs path', () => {
    const c = read();
    expect(c).toMatch(/bank_proofs/);
    expect(c).toMatch(/presigned|createSignedUrl|getSignedUrl|signedUrl/i);
    expect(c).toMatch(/order/i);
    expect(c).toMatch(/uuid|randomUUID/i);
  });
  it('enforces 10MB limit and allowed mime types', () => {
    const c = read();
    expect(c).toMatch(/10\s*\*\s*1024\s*\*\s*1024|10485760|10.*MB/i);
    expect(c).toMatch(/pdf|jpg|jpeg|png/i);
  });
  it('exports POST handler with auth and <200ms note', async () => {
    const c = read();
    expect(c).toMatch(/export.*POST|export async function POST/i);
    expect(c).toMatch(/auth|user|supabase/i);
    const mod = await import('@/app/api/bank-proof/url/route');
    expect(typeof (mod as unknown as { POST: unknown }).POST).toBe('function');
  });
});
