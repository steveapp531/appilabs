import { Router } from 'express';
import { z } from 'zod';
import { ResearchRequest, Service } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { sanitize } from '../middleware/sanitize.js';
import { uploadFiles, parseMultipartJson } from '../middleware/upload.js';
import { storeFiles, attachOwner } from '../services/uploads.js';
import { notifyCustomer, notifyAdmin } from '../services/notify.js';
import { templates } from '../services/email/templates.js';
import { email, name, phone, optStr, attribution, slug, honeypot } from './schemas.js';

const r = Router();

export const researchSchema = z.object({
  serviceSlug: slug,
  academicLevel: z.enum(['undergraduate', 'masters', 'doctoral', 'professional', 'other']),
  discipline: z.string().trim().min(2, 'Enter your discipline').max(120),
  institution: optStr(160),
  topic: z.string().trim().min(5, 'Describe your topic in a few words').max(300),
  requirements: z.string().trim().min(20, 'Tell us a bit more so we can plan properly (at least 20 characters)').max(5000),
  deadline: z.coerce.date().refine((d) => d.getTime() > Date.now(), 'Choose a deadline in the future'),
  supportMode: z.enum(['sessions', 'written_feedback', 'both']).default('both'),
  name,
  email,
  phone,
  integrityAcknowledged: z.literal(true, { errorMap: () => ({ message: 'Please confirm the academic integrity statement' }) }),
  attribution,
  website: honeypot,
});

r.post(
  '/research-requests',
  formLimiter,
  uploadFiles,
  parseMultipartJson,
  sanitize,
  validate({ body: researchSchema }),
  asyncHandler(async (req, res) => {
    const { website, ...data } = req.body;
    if (website === '__bot__') return send(res, { id: null, status: 'new' }, { status: 201 });
    const service = await Service.findOne({ slug: data.serviceSlug, track: 'research', status: 'published' }).lean();
    if (!service) throw new ApiError(422, 'validation_error', 'Choose a research support service', [{ path: 'serviceSlug', message: 'Unknown service' }]);
    const uploads = await storeFiles(req.files, 'ResearchRequest');
    const request = await ResearchRequest.create({ ...data, files: uploads.map((u) => u._id) });
    await attachOwner(uploads, request._id);
    notifyCustomer(request.email, templates.researchReceived(request));
    notifyAdmin('research request', `${request.name} <${request.email}>\n${service.title} (${request.academicLevel}, ${request.discipline})\nDeadline: ${request.deadline.toISOString().slice(0, 10)}\nFiles: ${uploads.length}`);
    send(res, { id: request._id, status: request.status }, { status: 201 });
  }),
);

export default r;
