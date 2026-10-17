import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/db/pagination.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-D01 pagination 25/100 PERF-01', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('defaults 25 max 100 PERF-01', async () => {
    const c = read();
    expect(c).toMatch(/25/);
    expect(c).toMatch(/100/);
    const mod = await import('@/lib/db/pagination');
    expect(typeof mod.paginate).toBe('function');
    expect(typeof mod.parsePagination).toBe('function');
  });
  it('paginate clamps and returns offset/limit', async () => {
    const { paginate, parsePagination } = await import('@/lib/db/pagination');
    expect(paginate({ page: 1, perPage: 25 })).toEqual({
      limit: 25,
      offset: 0,
      page: 1,
      perPage: 25,
    });
    expect(paginate({ page: 2, perPage: 25 })).toEqual({
      limit: 25,
      offset: 25,
      page: 2,
      perPage: 25,
    });
    expect(paginate({ page: 0, perPage: 200 }).perPage).toBe(100);
    expect(paginate({ page: -1, perPage: 5 }).page).toBe(1);
    expect(parsePagination(new URLSearchParams('page=2&per_page=10'))).toMatchObject({
      page: 2,
      perPage: 10,
    });
    expect(parsePagination(new URLSearchParams('page=abc'))).toMatchObject({
      page: 1,
      perPage: 25,
    });
  });
  it('enforces max 100 and min 1', async () => {
    const { paginate } = await import('@/lib/db/pagination');
    expect(paginate({ perPage: 1000 }).perPage).toBe(100);
    expect(paginate({ perPage: 0 }).perPage).toBe(25);
    expect(paginate({ page: 999 }).page).toBe(999);
  });
});
