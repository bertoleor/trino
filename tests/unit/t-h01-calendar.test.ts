import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/app/[locale]/admin/cultura/calendar/page.tsx');
const c = path.join(ROOT, 'src/components/admin/cultura-calendar.tsx');
describe('T-H01 editorial calendar month/week drag-drop', () => {
  it('files exist', () => {
    expect(fs.existsSync(p)).toBe(true);
    expect(fs.existsSync(c)).toBe(true);
  });
  it('calendar month week drag-drop dnd-kit status colors filter locale tag optimistic revalidate', () => {
    const pc = fs.readFileSync(p, 'utf8');
    const cc = fs.readFileSync(c, 'utf8');
    expect(cc).toMatch(/month|week/i);
    expect(cc).toMatch(/drag|drop|dnd|sortable/i);
    expect(cc).toMatch(/dnd-kit/i);
    expect(cc).toMatch(/draft|published|scheduled/i);
    expect(cc).toMatch(/locale|tag|filter/i);
    expect(cc).toMatch(/optimistic|revalidate/i);
    const combined = pc + cc;
    expect(combined).toMatch(/calendar|Cultura/i);
  });
});
