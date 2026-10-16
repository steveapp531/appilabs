import express, { Router } from 'express';
import { z } from 'zod';
import env from '../config/env.js';
import { Course, Enrollment, Payment } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { reference as makeRef } from '../lib/crypto.js';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { getPaymentProvider } from '../services/payments/index.js';
import * as paystack from '../services/payments/paystack.js';
import { notifyCustomer, notifyAdmin } from '../services/notify.js';
import { templates } from '../services/email/templates.js';
import logger from '../lib/logger.js';
import { email, name, phone, optStr, attribution, slug, honeypot } from './schemas.js';

const r = Router();

export const enrollmentSchema = z.object({
  courseSlug: slug,
  name,
  email,
  phone,
  organization: optStr(160),
  experienceLevel: z.enum(['new', 'some', 'experienced']).optional(),
  goals: optStr(1500),
  payNow: z.coerce.boolean().default(true),
  attribution,
  website: honeypot,
});

r.post(
  '/enrollments',
  formLimiter,
  validate({ body: enrollmentSchema }),
  asyncHandler(async (req, res) => {
    const { website, payNow, courseSlug, ...data } = req.body;
    if (website === '__bot__') return send(res, { id: null, status: 'interested' }, { status: 201 });
    const course = await Course.findOne({ slug: courseSlug, status: 'published' });
    if (!course) throw ApiError.notFound('This course is not open for enrollment.');

    const provider = getPaymentProvider();
    const needsPayment = course.price > 0 && provider && payNow;

    const enrollment = await Enrollment.create({
      ...data,
      course: course._id,
      courseSlug: course.slug,
      courseTitle: course.title,
      amount: course.price,
      currency: course.currency,
      status: needsPayment ? 'pending_payment' : 'interested',
    });

    if (!needsPayment) {
      notifyCustomer(enrollment.email, templates.enrollmentReceived(enrollment));
      notifyAdmin('course enrollment', `${enrollment.name} <${enrollment.email}> for ${course.title} (no payment taken)`);
      return send(res, { id: enrollment._id, status: enrollment.status, payment: null }, { status: 201 });
    }

    const ref = makeRef('ENR');
    await Payment.create({ reference: ref, provider: provider.name, enrollment: enrollment._id, email: enrollment.email, amount: course.price, currency: course.currency });
    enrollment.paymentReference = ref;
    await enrollment.save();

    const callbackUrl = `${env.PUBLIC_SITE_URL}/payment/callback`;
    const init = await provider.initialize({
      email: enrollment.email,
      amount: course.price,
      currency: course.currency,
      reference: ref,
      callbackUrl,
      metadata: { enrollmentId: String(enrollment._id), course: course.slug },
    });
    send(res, { id: enrollment._id, status: enrollment.status, payment: { reference: ref, authorizationUrl: init.authorizationUrl, provider: provider.name } }, { status: 201 });
  }),
);

/** Idempotently marks a payment and its enrollment as paid. Safe to call from both verify and webhook. */
export async function markPaymentSuccess(reference, { amount, currency, channel, id }) {
  const existing = await Payment.findOne({ reference });
  if (!existing) throw ApiError.notFound('Payment not found');
  if (existing.status === 'success') return { payment: existing, alreadyProcessed: true };
  if (amount < existing.amount || (currency && currency !== existing.currency)) {
    existing.status = 'failed';
    existing.failureReason = `Amount or currency mismatch: got ${amount} ${currency}`;
    await existing.save();
    logger.warn({ reference }, 'Payment amount mismatch');
    return { payment: existing, mismatch: true };
  }
  // Atomic transition guards against verify + webhook racing each other.
  const payment = await Payment.findOneAndUpdate(
    { reference, status: { $ne: 'success' } },
    { status: 'success', verifiedAt: new Date(), channel, providerTransactionId: id },
    { new: true },
  );
  if (!payment) return { payment: await Payment.findOne({ reference }), alreadyProcessed: true };
  const enrollment = await Enrollment.findByIdAndUpdate(payment.enrollment, { status: 'paid', paidAt: new Date() }, { new: true });
  if (enrollment) {
    notifyCustomer(enrollment.email, templates.paymentConfirmed(enrollment));
    notifyAdmin('paid enrollment', `${enrollment.name} paid for ${enrollment.courseTitle}. Reference ${reference}`);
  }
  return { payment, enrollment };
}

r.get(
  '/payments/verify/:reference',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ reference: req.params.reference }).populate('enrollment', 'courseTitle courseSlug name status');
    if (!payment) throw ApiError.notFound('Payment not found');
    if (payment.status === 'success') return send(res, { status: 'success', reference: payment.reference, enrollment: payment.enrollment });
    const provider = getPaymentProvider();
    if (!provider || provider.name !== payment.provider) throw new ApiError(503, 'payments_unavailable', 'Payments are not configured');
    const result = await provider.verify(payment.reference);
    if (result.status === 'success') {
      const out = await markPaymentSuccess(payment.reference, result);
      const status = out.mismatch ? 'failed' : 'success';
      return send(res, { status, reference: payment.reference, enrollment: payment.enrollment });
    }
    if (['failed', 'abandoned'].includes(result.status)) {
      payment.status = result.status;
      await payment.save();
    }
    send(res, { status: result.status, reference: payment.reference, enrollment: payment.enrollment });
  }),
);

// Paystack webhook: needs the raw body for HMAC verification, so it is mounted before express.json().
export const paystackWebhook = [
  express.raw({ type: 'application/json', limit: '200kb' }),
  asyncHandler(async (req, res) => {
    if (env.PAYMENT_PROVIDER !== 'paystack') return res.status(404).end();
    if (!paystack.verifyWebhook(req.body, req.headers)) return res.status(401).json({ error: { code: 'invalid_signature', message: 'Invalid signature' } });
    const event = JSON.parse(req.body.toString('utf8'));
    const eventKey = `${event.event}:${event.data?.id}`;
    if (event.event === 'charge.success' && event.data?.reference) {
      const payment = await Payment.findOne({ reference: event.data.reference });
      if (payment && !payment.processedEvents.includes(eventKey)) {
        await Payment.updateOne({ _id: payment._id }, { $addToSet: { processedEvents: eventKey } });
        await markPaymentSuccess(event.data.reference, {
          amount: event.data.amount,
          currency: event.data.currency,
          channel: event.data.channel,
          id: String(event.data.id),
        });
      }
    }
    res.status(200).json({ received: true });
  }),
];

export default r;
