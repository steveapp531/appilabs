import { Router } from 'express';
import env from '../config/env.js';
import { z } from 'zod';
import { Lead, Booking } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { sanitize } from '../middleware/sanitize.js';
import { uploadFiles, parseMultipartJson } from '../middleware/upload.js';
import { storeFiles, attachOwner } from '../services/uploads.js';
import { notifyCustomer, notifyAdmin } from '../services/notify.js';
import { templates } from '../services/email/templates.js';
import { resources } from '../../../shared/content/index.js';
import { email, name, phone, optStr, attribution, pillar, honeypot } from './schemas.js';

const r = Router();

export const leadSchema = z.object({
  type: z.enum(['contact', 'project', 'corporate_training']).default('contact'),
  pillar: pillar.default('general'),
  serviceSlug: optStr(80),
  name,
  email,
  phone,
  company: optStr(160),
  message: optStr(4000),
  goal: optStr(2000),
  timeline: optStr(60),
  budget: optStr(60),
  teamSize: optStr(40),
  marketingConsent: z.coerce.boolean().default(false),
  attribution,
  website: honeypot,
}).refine((d) => d.message || d.goal, { message: 'Tell us briefly what you need', path: ['message'] });

const fakeOk = (res) => send(res, { id: null, status: 'received' }, { status: 201 });

r.post(
  '/leads',
  formLimiter,
  uploadFiles,
  parseMultipartJson,
  sanitize,
  validate({ body: leadSchema }),
  asyncHandler(async (req, res) => {
    const { website, ...data } = req.body;
    if (website === '__bot__') return fakeOk(res);
    const uploads = await storeFiles(req.files, 'Lead');
    const lead = await Lead.create({ ...data, files: uploads.map((u) => u._id) });
    await attachOwner(uploads, lead._id);
    notifyCustomer(lead.email, templates.leadReceived(lead));
    notifyAdmin(`${lead.type} enquiry`, `${lead.name} <${lead.email}>\nPillar: ${lead.pillar}\nService: ${lead.serviceSlug || 'n/a'}\n\n${lead.goal || lead.message}`);
    send(res, { id: lead._id, status: 'received' }, { status: 201 });
  }),
);

const futureDate = z.coerce.date().refine((d) => d.getTime() > Date.now() - 86400000, 'Choose a date in the future');

export const bookingSchema = z.object({
  name,
  email,
  phone,
  company: optStr(160),
  pillar: pillar.default('general'),
  topic: optStr(200),
  preferredDates: z.array(futureDate).min(1, 'Choose at least one date').max(3),
  timezone: optStr(60),
  mode: z.enum(['video', 'phone', 'in_person']).default('video'),
  notes: optStr(2000),
  attribution,
  website: honeypot,
});

r.post(
  '/bookings',
  formLimiter,
  validate({ body: bookingSchema }),
  asyncHandler(async (req, res) => {
    const { website, ...data } = req.body;
    if (website === '__bot__') return fakeOk(res);
    const booking = await Booking.create(data);
    notifyCustomer(booking.email, templates.bookingReceived(booking));
    notifyAdmin('consultation request', `${booking.name} <${booking.email}>\nTopic: ${booking.topic || booking.pillar}\nPreferred: ${booking.preferredDates.map((d) => d.toISOString().slice(0, 16)).join(', ')}`);
    send(res, { id: booking._id, status: booking.status }, { status: 201 });
  }),
);

r.post(
  '/resources/:slug/request',
  formLimiter,
  validate({ body: z.object({ name, email, marketingConsent: z.coerce.boolean().default(false), attribution, website: honeypot }) }),
  asyncHandler(async (req, res) => {
    const resource = resources.find((x) => x.slug === req.params.slug);
    if (!resource) throw ApiError.notFound('Resource not found');
    const { website, ...data } = req.body;
    const url = new URL(resource.file, env.PUBLIC_SITE_URL).toString();
    if (website !== '__bot__') {
      const lead = await Lead.create({ ...data, type: 'resource', pillar: resource.pillar, resourceSlug: resource.slug, message: `Downloaded: ${resource.title}` });
      notifyCustomer(lead.email, templates.resourceDelivery(resource.title, url));
    }
    send(res, { downloadUrl: url }, { status: 201 });
  }),
);

export default r;
