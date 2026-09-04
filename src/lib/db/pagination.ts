export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;

export function paginate(opts: { page?: number; perPage?: number } = {}) {
  let page = Math.floor(Number(opts.page ?? DEFAULT_PAGE));
  let perPage = Math.floor(Number(opts.perPage ?? DEFAULT_PER_PAGE));
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(perPage) || perPage < 1) perPage = DEFAULT_PER_PAGE;
  if (perPage > MAX_PER_PAGE) perPage = MAX_PER_PAGE;
  return { page, perPage, limit: perPage, offset: (page - 1) * perPage };
}

export function parsePagination(sp: URLSearchParams) {
  const page = Number(sp.get('page') ?? sp.get('p') ?? 1);
  const perPage = Number(sp.get('per_page') ?? sp.get('perPage') ?? sp.get('limit') ?? DEFAULT_PER_PAGE);
  return paginate({ page, perPage });
}
