import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Lead, Booking, Enrollment, ResearchRequest, Service, Course, BlogPost, CaseStudy, Subscriber, Payment, Upload, Setting, User, AuditLog } from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { paginate, pageMeta } from '../lib/pagination.js';
import { crudRouter } from '../lib/crud.js';
import { audit } from '../services/audit.js';
import { getStorage } from '../services/storage/index.js';
import { scheduleRebuild } from '../services/deployHook.js';
import * as reports from '../services/reports.js';
import { passwordSchema } from './auth.js';
import { email, name, optStr, slug } from './schemas.js';
import { LEAD_STATUSES } from '../models/Lead.js';

const r = Router();
r.use(requireAuth);

const ALL = ['owner', 'admin', 'editor'];
const OPS = ['owner', 'admin'];
const contentRoles = { read: ALL, write: ALL, del: OPS };
const opsRoles = { read: OPS, write: OPS, del: OPS };

const markResponded = (doc, body) => {
  if (body.status && body.status !== 'new' && !doc.firstRespondedAt) doc.firstRespondedAt = new Date();
};
const trackSlug = (doc, body) => {
  if (body.slug && body.slug !== doc.slug) body.previousSlugs = [...new Set([...(doc.previousSlugs || []), doc.slug])];
};
const removeFiles = async (doc) => {
  if (!doc.files?.length) return;
  const storage = await getStorage();
  const files = await Upload.find({ _id: { $in: doc.files } });
  for (const f of files) {
    await storage.remove(f.key).catch(() => {});
    f.deletedAt = new Date();
    await f.save();
  }
};
const rebuild = (doc) => doc.status === 'published' && scheduleRebuild();

// ---- Overview ----
r.get('/dashboard', requireRole(...OPS), asyncHandler(async (_req, res) => send(res, await reports.dashboard())));
r.get('/analytics', requireRole(...OPS), asyncHandler(async (req, res) => send(res, await reports.analyticsSummary(Math.min(365, parseInt(req.query.days, 10) || 30)))));

// ---- Pipeline (customer data: owner/admin only) ----
r.use('/leads', crudRouter({
  Model: Lead, entity: 'lead', roles: opsRoles,
  searchFields: ['name', 'email', 'company', 'message', 'goal'],
  filters: ['status', 'pillar', 'type', 'isDemo'],
  updateSchema: z.object({ status: z.enum(LEAD_STATUSES).optional(), internalNotes: optStr(5000) }),
  beforeUpdate: markResponded,
  afterDelete: removeFiles,
  csvFields: ['createdAt', 'type', 'pillar', 'serviceSlug', 'name', 'email', 'phone', 'company', 'status', 'timeline', 'budget', 'attribution.utmSource', 'attribution.utmCampaign', 'attribution.referrer'],
}));

r.use('/bookings', crudRouter({
  Model: Booking, entity: 'booking', roles: opsRoles,
  searchFields: ['name', 'email', 'company', 'topic'],
  filters: ['status', 'pillar'],
  sortable: ['createdAt', 'scheduledAt'],
  updateSchema: z.object({
    status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']).optional(),
    scheduledAt: z.coerce.date().optional().nullable(),
    internalNotes: optStr(5000),
  }),
  csvFields: ['createdAt', 'name', 'email', 'phone', 'company', 'pillar', 'topic', 'mode', 'status', 'scheduledAt'],
}));

r.use('/enrollments', crudRouter({
  Model: Enrollment, entity: 'enrollment', roles: opsRoles,
  searchFields: ['name', 'email', 'organization', 'courseTitle'],
  filters: ['status', 'courseSlug'],
  updateSchema: z.object({ status: z.enum(['interested', 'pending_payment', 'paid', 'cancelled', 'completed']).optional(), internalNotes: optStr(5000) }),
  csvFields: ['createdAt', 'courseTitle', 'name', 'email', 'phone', 'organization', 'status', 'amount', 'currency', 'paymentReference'],
}));

r.use('/research-requests', crudRouter({
  Model: ResearchRequest, entity: 'research_request', roles: opsRoles,
  searchFields: ['name', 'email', 'topic', 'discipline', 'institution'],
  filters: ['status', 'serviceSlug', 'academicLevel'],
  sortable: ['createdAt', 'deadline'],
  populate: { path: 'files', select: 'originalName mimeType size createdAt deletedAt expiresAt' },
  updateSchema: z.object({
    status: z.enum(['new', 'reviewing', 'quoted', 'in_progress', 'completed', 'declined', 'closed']).optional(),
    quoteAmount: z.coerce.number().int().min(0).optional(),
    internalNotes: optStr(5000),
  }),
  beforeUpdate: markResponded,
  afterDelete: removeFiles,
  csvFields: ['createdAt', 'serviceSlug', 'academicLevel', 'discipline', 'name', 'email', 'deadline', 'status', 'quoteAmount'],
}));

r.use('/subscribers', crudRouter({
  Model: Subscriber, entity: 'subscriber', roles: opsRoles,
  searchFields: ['email', 'name'],
  filters: ['status'],
  updateSchema: z.object({ status: z.enum(['pending', 'active', 'unsubscribed']) }),
  csvFields: ['email', 'name', 'status', 'source', 'consentAt', 'confirmedAt'],
}));

r.use('/payments', crudRouter({ Model: Payment, entity: 'payment', roles: { read: OPS, write: [], del: ['owner'] }, searchFields: ['reference', 'email'], filters: ['status', 'provider'] }));

// Private file download. Files are never exposed at public URLs.
r.get('/files/:id', requireRole(...OPS), asyncHandler(async (req, res) => {
  const file = await Upload.findById(req.params.id);
  if (!file || file.deletedAt) throw ApiError.notFound('File not found or already deleted');
  const stream = await (await getStorage()).get(file.key);
  await audit(req, 'download_file', 'upload', file._id, { ownerType: file.ownerType });
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
  res.setHeader('Cache-Control', 'no-store');
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}));

// ---- Content (editors allowed) ----
const seo = z.object({ title: optStr(70), description: optStr(170) }).partial().optional();
const strList = z.array(z.string().trim().min(1).max(300)).max(30);
const status = z.enum(['published', 'draft']);

const serviceSchema = z.object({
  slug, pillar: z.enum(['solutions', 'consulting', 'academy']), track: z.enum(['training', 'research']).nullable().optional(),
  title: z.string().trim().min(3).max(140), summary: z.string().trim().min(10).max(400), outcome: optStr(400), description: optStr(5000),
  deliverables: strList.optional(), useCases: strList.optional(),
  pricing: z.object({ model: z.enum(['quote', 'from', 'fixed', 'retainer']), amount: z.coerce.number().int().min(0).optional(), currency: z.string().length(3).optional(), interval: optStr(20), isDemoPrice: z.boolean().optional() }).optional(),
  order: z.coerce.number().int().optional(), status: status.optional(), isDemo: z.boolean().optional(), seo,
});
r.use('/services', crudRouter({ Model: Service, entity: 'service', roles: contentRoles, searchFields: ['title', 'slug', 'summary'], filters: ['pillar', 'track', 'status'], defaultSort: 'order', sortable: ['order', 'title', 'updatedAt'], createSchema: serviceSchema, updateSchema: serviceSchema.partial(), beforeUpdate: trackSlug, afterWrite: rebuild }));

const courseSchema = z.object({
  slug, title: z.string().trim().min(3).max(140), summary: z.string().trim().min(10).max(400), description: optStr(5000),
  level: optStr(80), format: optStr(80), duration: optStr(80), price: z.coerce.number().int().min(0), currency: z.string().length(3).optional(), isDemoPrice: z.boolean().optional(),
  audience: z.enum(['individual', 'corporate', 'both']).optional(), outcomes: strList.optional(), prerequisites: strList.optional(),
  modules: z.array(z.object({ title: z.string().max(140), topics: strList })).max(30).optional(),
  nextCohort: optStr(120), seats: z.coerce.number().int().min(0).optional(), order: z.coerce.number().int().optional(), status: status.optional(), isDemo: z.boolean().optional(), seo,
});
r.use('/courses', crudRouter({ Model: Course, entity: 'course', roles: contentRoles, searchFields: ['title', 'slug'], filters: ['status', 'audience'], defaultSort: 'order', sortable: ['order', 'title', 'price'], createSchema: courseSchema, updateSchema: courseSchema.partial(), beforeUpdate: trackSlug, afterWrite: rebuild }));

const postSchema = z.object({
  slug, title: z.string().trim().min(3).max(160), excerpt: z.string().trim().min(10).max(400), body: z.string().min(20).max(100000),
  tags: z.array(z.string().trim().max(40)).max(10).optional(), author: optStr(120), coverImage: optStr(500), readingMinutes: z.coerce.number().int().min(1).max(120).optional(),
  status: status.optional(), publishedAt: z.coerce.date().optional(), isDemo: z.boolean().optional(), seo,
});
r.use('/blog', crudRouter({
  Model: BlogPost, entity: 'blog_post', roles: contentRoles, searchFields: ['title', 'slug', 'excerpt'], filters: ['status', 'isDemo'], defaultSort: '-publishedAt', sortable: ['publishedAt', 'title', 'updatedAt'],
  createSchema: postSchema, updateSchema: postSchema.partial(),
  beforeUpdate: (doc, body) => { trackSlug(doc, body); if (body.status === 'published' && !doc.publishedAt && !body.publishedAt) body.publishedAt = new Date(); },
  afterWrite: rebuild,
}));

const caseSchema = z.object({
  slug, title: z.string().trim().min(3).max(160), pillar: z.enum(['solutions', 'consulting', 'academy']).optional(), sector: optStr(80), summary: optStr(400),
  challenge: optStr(3000), approach: strList.optional(), deliverables: strList.optional(), result: optStr(2000), status: status.optional(), isDemo: z.boolean().optional(), seo,
});
r.use('/case-studies', crudRouter({ Model: CaseStudy, entity: 'case_study', roles: contentRoles, searchFields: ['title', 'slug', 'sector'], filters: ['status', 'pillar'], createSchema: caseSchema, updateSchema: caseSchema.partial(), beforeUpdate: trackSlug, afterWrite: rebuild }));

// ---- Settings ----
const settingsSchema = z.object({
  businessName: optStr(120), email: email.optional(), phone: optStr(40), whatsapp: optStr(20), address: optStr(200), city: optStr(80), country: optStr(2), hours: optStr(120),
  serviceAreas: z.array(z.string().max(80)).max(20).optional(),
  socials: z.object({ linkedin: optStr(200), x: optStr(200), github: optStr(200), youtube: optStr(200) }).partial().optional(),
  showPrices: z.boolean().optional(), bookingEnabled: z.boolean().optional(), announcement: optStr(200),
});
r.get('/settings', requireRole(...OPS), asyncHandler(async (_req, res) => send(res, (await Setting.findOne({ key: 'site' }).lean()) || {})));
r.put('/settings', requireRole(...OPS), validate({ body: settingsSchema }), asyncHandler(async (req, res) => {
  const doc = await Setting.findOneAndUpdate({ key: 'site' }, { ...req.body, key: 'site' }, { upsert: true, new: true });
  await audit(req, 'update', 'settings', doc._id, { changed: Object.keys(req.body) });
  scheduleRebuild();
  send(res, doc);
}));

// ---- Users (owner only) ----
r.get('/users', requireRole('owner'), asyncHandler(async (_req, res) => send(res, await User.find().sort('createdAt').lean().then((u) => u.map(({ passwordHash: _p, ...rest }) => rest)))));
r.post('/users', requireRole('owner'), validate({ body: z.object({ name, email, role: z.enum(['admin', 'editor']), password: passwordSchema }) }), asyncHandler(async (req, res) => {
  const { password, ...rest } = req.body;
  const user = await User.create({ ...rest, passwordHash: await bcrypt.hash(password, 12) });
  await audit(req, 'create', 'user', user._id, { role: user.role });
  send(res, { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active }, { status: 201 });
}));
r.patch('/users/:id', requireRole('owner'), validate({ body: z.object({ role: z.enum(['owner', 'admin', 'editor']).optional(), active: z.boolean().optional() }) }), asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw ApiError.badRequest('You cannot change your own role or status');
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) throw ApiError.notFound();
  await audit(req, 'update', 'user', user._id, req.body);
  send(res, { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
}));

// ---- Audit log ----
r.get('/audit-logs', requireRole(...OPS), asyncHandler(async (req, res) => {
  const p = paginate(req.query, { defaultSort: '-createdAt' });
  const where = typeof req.query.entity === 'string' && req.query.entity ? { entity: req.query.entity } : {};
  const [items, total] = await Promise.all([AuditLog.find(where).sort(p.sort).skip(p.skip).limit(p.limit).lean(), AuditLog.countDocuments(where)]);
  send(res, items, { meta: pageMeta(p, total) });
}));

export default r;
