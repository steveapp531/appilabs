import crypto from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './helpers.js';
import { seedContent } from '../src/scripts/seedData.js';
import { Enrollment, Payment } from '../src/models/index.js';
import { markPaymentSuccess } from '../src/modules/enrollments.js';
import { verifyWebhook } from '../src/services/payments/paystack.js';

beforeAll(async () => {
  await seedContent();
});

describe('courses and enrollment', () => {
  it('lists published courses', async () => {
    const res = await api().get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(8);
  });

  it('returns 404 for unknown course', async () => {
    expect((await api().get('/api/v1/courses/does-not-exist')).status).toBe(404);
  });

  it('enrolls without payment when payNow is false', async () => {
    const res = await api().post('/api/v1/enrollments').send({ courseSlug: 'sql-fundamentals', name: 'Esi Quaye', email: 'esi@example.com', payNow: false });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('interested');
    expect(res.body.data.payment).toBeNull();
  });

  it('runs the full test payment flow and verifies on the backend', async () => {
    const res = await api().post('/api/v1/enrollments').send({ courseSlug: 'power-bi', name: 'Nana Ofori', email: 'nana@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending_payment');
    const { reference, authorizationUrl } = res.body.data.payment;
    expect(authorizationUrl).toContain(reference);

    const verify = await api().get(`/api/v1/payments/verify/${reference}`);
    expect(verify.status).toBe(200);
    expect(verify.body.data.status).toBe('success');

    const enrollment = await Enrollment.findById(res.body.data.id);
    expect(enrollment.status).toBe('paid');
    expect((await Payment.findOne({ reference })).verifiedAt).toBeTruthy();
  });

  it('is idempotent: processing the same success twice changes nothing', async () => {
    const res = await api().post('/api/v1/enrollments').send({ courseSlug: 'power-bi', name: 'Kojo Mensah', email: 'kojo@example.com' });
    const { reference } = res.body.data.payment;
    const payment = await Payment.findOne({ reference });
    const first = await markPaymentSuccess(reference, { amount: payment.amount, currency: 'GHS', channel: 'card', id: '1' });
    const second = await markPaymentSuccess(reference, { amount: payment.amount, currency: 'GHS', channel: 'card', id: '1' });
    expect(first.enrollment.status).toBe('paid');
    expect(second.alreadyProcessed).toBe(true);
  });

  it('fails the payment when the amount does not match', async () => {
    const res = await api().post('/api/v1/enrollments').send({ courseSlug: 'power-bi', name: 'Short Payer', email: 'short@example.com' });
    const { reference } = res.body.data.payment;
    const out = await markPaymentSuccess(reference, { amount: 100, currency: 'GHS' });
    expect(out.mismatch).toBe(true);
    expect((await Enrollment.findById(res.body.data.id)).status).toBe('pending_payment');
  });
});

describe('paystack webhook signature', () => {
  it('accepts a correctly signed body and rejects tampering', () => {
    const body = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'X' } }));
    const sig = crypto.createHmac('sha512', 'sk_test_unit_secret').update(body).digest('hex');
    expect(verifyWebhook(body, { 'x-paystack-signature': sig })).toBe(true);
    expect(verifyWebhook(Buffer.from(body.toString().replace('X', 'Y')), { 'x-paystack-signature': sig })).toBe(false);
    expect(verifyWebhook(body, {})).toBe(false);
  });

  it('ignores the webhook route unless paystack is the active provider', async () => {
    const res = await api().post('/api/v1/payments/webhook/paystack').set('Content-Type', 'application/json').send('{}');
    expect(res.status).toBe(404);
  });
});
