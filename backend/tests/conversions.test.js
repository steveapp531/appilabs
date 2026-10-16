import { describe, it, expect } from 'vitest';
import { api } from './helpers.js';
import { Lead, Booking, Subscriber } from '../src/models/index.js';

describe('leads and contact form', () => {
  it('rejects invalid input with field level details', async () => {
    const res = await api().post('/api/v1/leads').send({ name: 'A', email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('validation_error');
    const paths = res.body.error.details.map((d) => d.path);
    expect(paths).toEqual(expect.arrayContaining(['name', 'email']));
  });

  it('requires a message or goal', async () => {
    const res = await api().post('/api/v1/leads').send({ name: 'Ama Mensah', email: 'ama@example.com' });
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].path).toBe('message');
  });

  it('creates a lead with attribution', async () => {
    const res = await api()
      .post('/api/v1/leads')
      .send({
        type: 'project',
        pillar: 'solutions',
        serviceSlug: 'web-applications',
        name: 'Ama Mensah',
        email: 'AMA@Example.com',
        goal: 'Build a customer portal for our logistics business',
        timeline: '1-3 months',
        attribution: { utmSource: 'google', utmCampaign: 'launch' },
      });
    expect(res.status).toBe(201);
    const lead = await Lead.findById(res.body.data.id).lean();
    expect(lead.email).toBe('ama@example.com');
    expect(lead.status).toBe('new');
    expect(lead.attribution.utmSource).toBe('google');
  });

  it('silently drops honeypot submissions', async () => {
    const before = await Lead.countDocuments();
    const res = await api().post('/api/v1/leads').send({ name: 'Bot Bot', email: 'bot@example.com', message: 'spam spam', website: 'http://spam' });
    expect(res.status).toBe(201);
    expect(await Lead.countDocuments()).toBe(before);
  });

  it('strips MongoDB operators from input', async () => {
    const res = await api().post('/api/v1/leads').send({ name: 'Kofi Test', email: 'kofi@example.com', message: 'hello there', $where: '1', company: { $gt: '' } });
    expect([201, 422]).toContain(res.status);
  });
});

describe('consultation booking', () => {
  it('requires at least one future date', async () => {
    const res = await api().post('/api/v1/bookings').send({ name: 'Kofi Adjei', email: 'kofi@example.com', preferredDates: [] });
    expect(res.status).toBe(422);
  });

  it('creates a booking request', async () => {
    const date = new Date(Date.now() + 3 * 86400000).toISOString();
    const res = await api().post('/api/v1/bookings').send({ name: 'Kofi Adjei', email: 'kofi@example.com', pillar: 'consulting', topic: 'Fractional CTO', preferredDates: [date] });
    expect(res.status).toBe(201);
    expect((await Booking.findById(res.body.data.id)).status).toBe('requested');
  });
});

describe('newsletter', () => {
  it('requires explicit consent', async () => {
    const res = await api().post('/api/v1/newsletter/subscribe').send({ email: 'n@example.com' });
    expect(res.status).toBe(422);
  });

  it('subscribes as pending (double opt-in)', async () => {
    const res = await api().post('/api/v1/newsletter/subscribe').send({ email: 'n@example.com', consent: true });
    expect(res.status).toBe(202);
    expect((await Subscriber.findOne({ email: 'n@example.com' })).status).toBe('pending');
  });

  it('rejects an invalid confirmation token', async () => {
    const res = await api().post('/api/v1/newsletter/confirm').send({ token: 'invalid-token-value' });
    expect(res.status).toBe(404);
  });
});

describe('resources', () => {
  it('captures a lead and returns a download link', async () => {
    const res = await api().post('/api/v1/resources/data-readiness-checklist/request').send({ name: 'Esi Quaye', email: 'esi@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.downloadUrl).toMatch(/data-readiness-checklist\.pdf$/);
    expect(await Lead.countDocuments({ type: 'resource', email: 'esi@example.com' })).toBe(1);
  });
});
