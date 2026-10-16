export function paginate(query, { defaultSort = '-createdAt', maxLimit = 100, sortable = [] } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || 20));
  let sort = defaultSort;
  if (typeof query.sort === 'string') {
    const field = query.sort.replace(/^-/, '');
    if (sortable.includes(field)) sort = query.sort;
  }
  return { page, limit, skip: (page - 1) * limit, sort };
}

export const pageMeta = ({ page, limit }, total) => ({ page, limit, total, pages: Math.ceil(total / limit) || 1 });

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
