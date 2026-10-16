import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import env from '../config/env.js';
import { Subscriber } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { randomToken, sha256, safeEqual } from '../lib/crypto.js';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { sendMail } from '../services/email/index.js';
import { templates } from '../services/email/templates.js';
import { email, optStr, attribution, honeypot } from './schemas.js';

const r = Router();
export const unsubscribeToken = (addr) => crypto.createHmac('sha256', env.JWT_SECRET).update(`unsub:${addr}`).digest('hex').slice(0, 32);

// Double opt-in: subscribers are "pending" until they confirm via the emailed link.
r.post(
  '/newsletter/subscribe',
  formLimiter,
  validate({
    body: z.object({
      email,
      name: optStr(120),
      consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you want to receive emails' }) }),
      source: optStr(80),
      attribution,
      website: honeypot,
    }),
  }),
  asyncHandler(async (req, res) => {
    const { website, consent: _c, ...data } = req.body;
    if (website === '__bot__') return send(res, { status: 'pending' }, { status: 202 });
    const existing = await Subscriber.findOne({ email: data.email });
    if (existing?.status === 'active') return send(res, { status: 'pending' }, { status: 202 }); // do not reveal membership
    const token = randomToken(24);
    await Subscriber.updateOne(
      { email: data.email },
      { $set: { ...data, status: 'pending', confirmTokenHash: sha256(token), consentAt: new Date() } },
      { upsert: true },
    );
    const url = `${env.PUBLIC_SITE_URL}/newsletter/confirm?token=${token}`;
    await sendMail({ to: data.email, ...templates.confirmSubscription(url) });
    send(res, { status: 'pending' }, { status: 202 });
  }),
);

r.post(
  '/newsletter/confirm',
  validate({ body: z.object({ token: z.string().min(10).max(100) }) }),
  asyncHandler(async (req, res) => {
    const sub = await Subscriber.findOne({ confirmTokenHash: sha256(req.body.token) }).select('+confirmTokenHash');
    if (!sub) throw ApiError.notFound('This confirmation link is invalid or has already been used.');
    sub.status = 'active';
    sub.confirmedAt = new Date();
    sub.confirmTokenHash = undefined;
    await sub.save();
    send(res, { status: 'active' });
  }),
);

r.post(
  '/newsletter/unsubscribe',
  validate({ body: z.object({ email, token: z.string().length(32) }) }),
  asyncHandler(async (req, res) => {
    if (!safeEqual(req.body.token, unsubscribeToken(req.body.email))) throw ApiError.badRequest('This unsubscribe link is invalid.');
    await Subscriber.updateOne({ email: req.body.email }, { status: 'unsubscribed', unsubscribedAt: new Date() });
    send(res, { status: 'unsubscribed' });
  }),
);

export default r;
