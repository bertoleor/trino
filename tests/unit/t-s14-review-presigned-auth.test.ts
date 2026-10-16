import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const a = path.join(ROOT, 'src/lib/actions/reviews.ts');
const m = path.join(ROOT, 'supabase/migrations/0024_review_image_storage.sql');
const read = () => fs.readFileSync(a, 'utf8');

describe('S-14 getPresignedReviewImageUrl auth/ownership/sanitización (CWE-639/434/22)', () => {
  it('RED-GUARD: fixture base actual NO debe seguir siendo el código vulnerable', () => {
    // El código vulnerable resolvia cualquier filename client-supplied sin auth.
    // Si este assert falla, alguien restauró la versión vulnerable.
    const c = read();
    const vulnerable = /storage\.example\.com\/reviews\/\$\{filename\}/.test(c);
    expect(vulnerable).toBe(false);
  });

  it('auth: exige sesión (getUser) y devuelve 401 sin usuario', () => {
    const c = read();
    const fn = c.slice(c.indexOf('getPresignedReviewImageUrl'));
    expect(fn).toMatch(/getUser/);
    expect(fn).toMatch(/auth required|unauthorized/i);
    expect(fn).toMatch(/401/);
  });

  it('ownership/sanitización: path server-side con uuid, jamás filename client-supplied interpolado', () => {
    const c = read();
    const fn = c.slice(c.indexOf('getPresignedReviewImageUrl'));
    expect(fn).toMatch(/randomUUID/);
    expect(fn).toMatch(/reviews\/\$\{user\.id\}/);
    expect(fn).not.toMatch(/storage\.example\.com/);
    // CWE-22: el nombre de archivo del cliente no viaja al storage path
    expect(fn).not.toMatch(/reviews\/\$\{filename\}/);
  });

  it('CWE-434: whitelist MIME de imagen + límite 5MB declarado', () => {
    const c = read();
    const fn = c.slice(c.indexOf('REVIEW_IMAGE_MAX_BYTES'));
    expect(fn).toMatch(/image\/jpeg/);
    expect(fn).toMatch(/image\/png/);
    expect(fn).toMatch(/image\/webp/);
    expect(fn).toMatch(/5 \* 1024 \* 1024|MAX_IMAGE_BYTES/);
    expect(fn).toMatch(/422/);
  });

  it('rate-limit: checkRateLimit review-upload:{user.id} tier public', () => {
    const c = read();
    const fn = c.slice(c.indexOf('getPresignedReviewImageUrl'));
    expect(fn).toMatch(/review-upload:\$\{user\.id\}/);
    expect(fn).toMatch(/'public'/);
    expect(fn).toMatch(/429/);
  });

  it('presign real con createSignedUploadUrl, fail-closed 503 sin fallback directo', () => {
    const c = read();
    const fn = c.slice(c.indexOf('getPresignedReviewImageUrl'));
    expect(fn).toMatch(/createSignedUploadUrl/);
    expect(fn).toMatch(/storage\.from\('reviews'\)/);
    expect(fn).toMatch(/503/);
    // sin fallback a URL directa sin firmar (el error de storage no regala capability)
    expect(fn).not.toMatch(/upload\/sign/);
  });

  it('migración 0024: bucket reviews privado + policies owner-scoped storage.foldername auth.uid()', () => {
    expect(fs.existsSync(m)).toBe(true);
    const sql = fs.readFileSync(m, 'utf8');
    expect(sql).toMatch(/storage\.buckets/i);
    expect(sql).toMatch(/'reviews'/);
    expect(sql).toMatch(/public\s*=\s*false|,\s*false\b/);
    expect(sql).toMatch(/storage\.foldername/);
    expect(sql).toMatch(/auth\.uid\(\)::text/);
    expect(sql).toMatch(/on conflict \(id\) do update/i);
  });
});
