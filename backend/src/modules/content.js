import { Router } from 'express';
import { Service, Course, BlogPost, CaseStudy, Setting } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { paginate, pageMeta } from '../lib/pagination.js';
import { site, resources } from '../../../shared/content/index.js';

const r = Router();
const cache = (res, seconds = 300) => res.set('Cache-Control', `public, max-age=60, s-maxage=${seconds}`);

// Finds a published doc by slug, or redirects (308) when the slug was renamed.
const bySlug = (Model, projection) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findOne({ slug: req.params.slug, status: 'published' }, projection).lean();
    if (doc) return cache(res) && send(res, doc);
    const moved = await Model.findOne({ previousSlugs: req.params.slug, status: 'published' }, { slug: 1 }).lean();
    if (moved) return res.redirect(308, `${req.baseUrl}/${moved.slug}`);
    throw ApiError.notFound('This page does not exist or is no longer published.');
  });

r.get('/services', asyncHandler(async (req, res) => {
  const where = { status: 'published' };
  if (['solutions', 'consulting', 'academy'].includes(req.query.pillar)) where.pillar = req.query.pillar;
  if (['training', 'research'].includes(req.query.track)) where.track = req.query.track;
  const items = await Service.find(where).sort('order').lean();
  cache(res);
  send(res, items);
}));
r.get('/services/:slug', bySlug(Service));

r.get('/courses', asyncHandler(async (_req, res) => {
  const items = await Course.find({ status: 'published' }).sort('order').lean();
  cache(res);
  send(res, items);
}));
r.get('/courses/:slug', bySlug(Course));

r.get('/blog', asyncHandler(async (req, res) => {
  const p = paginate(req.query, { defaultSort: '-publishedAt', sortable: ['publishedAt'] });
  const where = { status: 'published' };
  if (typeof req.query.tag === 'string' && req.query.tag) where.tags = req.query.tag;
  const [items, total] = await Promise.all([
    BlogPost.find(where, { body: 0 }).sort(p.sort).skip(p.skip).limit(p.limit).lean(),
    BlogPost.countDocuments(where),
  ]);
  cache(res);
  send(res, items, { meta: pageMeta(p, total) });
}));
r.get('/blog/:slug', bySlug(BlogPost));

r.get('/case-studies', asyncHandler(async (_req, res) => {
  const items = await CaseStudy.find({ status: 'published' }).sort('-createdAt').lean();
  cache(res);
  send(res, items);
}));
r.get('/case-studies/:slug', bySlug(CaseStudy));

r.get('/settings/public', asyncHandler(async (_req, res) => {
  const s = await Setting.findOne({ key: 'site' }).lean();
  cache(res, 600);
  send(res, {
    businessName: s?.businessName ?? site.name,
    email: s?.email ?? site.email,
    phone: s?.phone ?? site.phone,
    whatsapp: s?.whatsapp ?? site.whatsapp,
    address: s?.address ?? site.address,
    hours: s?.hours ?? site.hours,
    serviceAreas: s?.serviceAreas?.length ? s.serviceAreas : site.serviceAreas,
    socials: s?.socials ?? site.socials,
    showPrices: s?.showPrices ?? true,
    bookingEnabled: s?.bookingEnabled ?? true,
    announcement: s?.announcement ?? '',
  });
}));

r.get('/resources', (_req, res) => send(res, resources));

// Used by the frontend build to add newly published content to the sitemap and prerender list.
r.get('/sitemap-entries', asyncHandler(async (_req, res) => {
  const pick = { slug: 1, updatedAt: 1, _id: 0 };
  const [services, courses, posts, cases] = await Promise.all([
    Service.find({ status: 'published' }, { ...pick, pillar: 1, track: 1 }).lean(),
    Course.find({ status: 'published' }, pick).lean(),
    BlogPost.find({ status: 'published' }, pick).lean(),
    CaseStudy.find({ status: 'published' }, pick).lean(),
  ]);
  send(res, { services, courses, posts, caseStudies: cases });
}));

export default r;
