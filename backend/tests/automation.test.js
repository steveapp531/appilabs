import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './helpers.js';
import { seedContent, seedDemoPipeline } from '../src/scripts/seedData.js';

beforeAll(async () => {
  await seedContent();
  await seedDemoPipeline();
});

const key = { 'X-API-Key': 'test-automation-key' };

describe('automation API', () => {
  it('requires the API key', async () => {
    expect((await api().get('/api/v1/automation/stale-inquiries')).status).toBe(401);
    expect((await api().get('/api/v1/automation/stale-inquiries').set('X-API-Key', 'wrong')).status).toBe(401);
  });

  it('finds inquiries that have waited longer than the threshold', async () => {
    const res = await api().get('/api/v1/automation/stale-inquiries?hours=48').set(key);
    expect(res.status).toBe(200);
    expect(res.body.data.leads.map((l) => l.email)).toContain('ama.demo@example.com');
    expect(res.body.data.researchRequests.map((r) => r.email)).toContain('abena.demo@example.com');
  });

  it('produces daily, booking, enrollment and weekly reports', async () => {
    for (const path of ['daily-summary', 'upcoming-bookings?days=7', 'enrollment-summary?days=30', 'weekly-activity']) {
      const res = await api().get(`/api/v1/automation/${path}`).set(key);
      expect(res.status, path).toBe(200);
    }
    const bookings = await api().get('/api/v1/automation/upcoming-bookings?days=7').set(key);
    expect(bookings.body.data.confirmed.length).toBe(1);
    expect(bookings.body.data.awaitingConfirmation.length).toBe(1);
    const enroll = await api().get('/api/v1/automation/enrollment-summary').set(key);
    expect(enroll.body.data.revenueMinor).toBeGreaterThan(0);
  });
});
