import { Router } from 'express';
import { asyncHandler, send, ApiError } from './http.js';
import { paginate, pageMeta, escapeRegex } from './pagination.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { audit } from '../services/audit.js';

const toCsv = (rows, fields) => {
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString() : typeof v === 'object' ? JSON.stringify(v) : String(v);
    // Prevent CSV formula injection when opened in spreadsheet software.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(get(r, f))).join(','))].join('\n');
};

/**
 * Builds a standard admin router: list (search, filter, paginate, sort, CSV), read, create, update, delete.
 */
export function crudRouter({
  Model,
  entity,
  searchFields = [],
  filters = [],
  sortable = ['createdAt', 'updatedAt'],
  defaultSort = '-createdAt',
  createSchema,
  updateSchema,
  populate,
  roles = { read: ['owner', 'admin'], write: ['owner', 'admin'], del: ['owner', 'admin'] },
  csvFields,
  beforeUpdate,
  afterWrite,
  afterDelete,
}) {
  const r = Router();

  r.get(
    '/',
    requireRole(...roles.read),
    asyncHandler(async (req, res) => {
      const p = paginate(req.query, { defaultSort, sortable });
      const where = {};
      for (const f of filters) {
        const v = req.query[f];
        if (typeof v === 'string' && v !== '') where[f] = v === 'true' ? true : v === 'false' ? false : v;
      }
      const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
      if (q && searchFields.length) {
        const rx = new RegExp(escapeRegex(q), 'i');
        where.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      if (req.query.format === 'csv' && csvFields) {
        const rows = await Model.find(where).sort(p.sort).limit(5000).lean();
        await audit(req, 'export', entity, null, { count: rows.length });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${entity}-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.send(toCsv(rows, csvFields));
      }
      const [items, total] = await Promise.all([
        Model.find(where).sort(p.sort).skip(p.skip).limit(p.limit).lean(),
        Model.countDocuments(where),
      ]);
      send(res, items, { meta: pageMeta(p, total) });
    }),
  );

  r.get(
    '/:id',
    requireRole(...roles.read),
    asyncHandler(async (req, res) => {
      let query = Model.findById(req.params.id);
      if (populate) query = query.populate(populate);
      const doc = await query.lean();
      if (!doc) throw ApiError.notFound();
      send(res, doc);
    }),
  );

  if (createSchema) {
    r.post(
      '/',
      requireRole(...roles.write),
      validate({ body: createSchema }),
      asyncHandler(async (req, res) => {
        const doc = await Model.create(req.body);
        await audit(req, 'create', entity, doc._id);
        await afterWrite?.(doc, req);
        send(res, doc, { status: 201 });
      }),
    );
  }

  if (updateSchema) {
    r.patch(
      '/:id',
      requireRole(...roles.write),
      validate({ body: updateSchema }),
      asyncHandler(async (req, res) => {
        const doc = await Model.findById(req.params.id);
        if (!doc) throw ApiError.notFound();
        const before = doc.toObject();
        await beforeUpdate?.(doc, req.body, req);
        doc.set(req.body);
        await doc.save();
        const changed = Object.keys(req.body).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(doc.get(k)));
        await audit(req, 'update', entity, doc._id, { changed });
        await afterWrite?.(doc, req);
        send(res, doc);
      }),
    );
  }

  r.delete(
    '/:id',
    requireRole(...roles.del),
    asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw ApiError.notFound();
      await audit(req, 'delete', entity, doc._id);
      await afterDelete?.(doc, req);
      res.status(204).end();
    }),
  );

  return r;
}
