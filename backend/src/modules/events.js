import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { AnalyticsEvent } from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/http.js';
import { attribution, optStr } from './schemas.js';
import env from '../config/env.js';

export const EVENT_NAMES = [
  'page_view', 'service_view', 'course_view', 'cta_click', 'form_start', 'form_submit',
  'consultation_request', 'enrollment_start', 'payment_success', 'newsletter_subscribe', 'resource_download', 'research_request',
];

const r = Router();
const limiter = rateLimit({ windowMs: 60000, limit: env.isTest ? 10000 : 120, standardHeaders: 'draft-7', legacyHeaders: false });

r.post(
  '/events',
  limiter,
  validate({
    body: z.object({
      name: z.enum(EVENT_NAMES),
      path: optStr(300),
      props: z.record(z.union([z.string().max(200), z.number(), z.boolean()])).refine((o) => Object.keys(o).length <= 10, 'Too many props').optional(),
      sessionId: optStr(64),
      attribution,
    }),
  }),
  asyncHandler(async (req, res) => {
    await AnalyticsEvent.create(req.body);
    res.status(202).json({ data: { accepted: true } });
  }),
);

export default r;
