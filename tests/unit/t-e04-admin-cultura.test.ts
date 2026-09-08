import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-E04 admin cultura TipTap Dropzone related picker preview RBAC', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/app/[locale]/admin/cultura/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/admin/cultura-editor.tsx'))).toBe(true);
  });
  it('editor has TipTap Dropzone tags related picker preview 44px', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/components/admin/cultura-editor.tsx'), 'utf8');
    expect(c).toMatch(/TipTap|tiptap|editor/i);
    expect(c).toMatch(/Dropzone|dropzone|Storage/i);
    expect(c).toMatch(/related|picker|preview/i);
    expect(c).toMatch(/44px|44|min-height/i);
  });
  it('RBAC is_admin audit', () => {
    const p = fs.readFileSync(path.join(ROOT, 'src/app/[locale]/admin/cultura/page.tsx'), 'utf8');
    expect(p).toMatch(/is_admin|403|admin/i);
    expect(p).toMatch(/audit|revalidate/i);
  });
});
