import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { api } from './helpers.js';
import { runMigrations } from '../src/migrations/runner.js';
import { seedContent, seedDemoPipeline } from '../src/scripts/seedData.js';
import { Service, Course, Lead } from '../src/models/index.js';

describe('system', () => {
  it('reports health and readiness', async () => {
    const h = await api().get('/api/v1/health');
    expect(h.status).toBe(200);
    expect(h.body.status).toBe('ok');
    const r = await api().get('/api/v1/ready');
    expect(r.status).toBe(200);
    expect(r.body.checks.database).toBe('ok');
    expect(r.headers['x-request-id']).toBeTruthy();
  });

  it('returns a consistent JSON error for unknown routes', async () => {
    const res = await api().get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'not_found' });
    expect(res.body.error.requestId).toBeTruthy();
  });

  it('serves the OpenAPI spec', async () => {
    const res = await api().get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.paths['/leads']).toBeDefined();
  });

  it('migrations are recorded and idempotent', async () => {
    const applied = await mongoose.connection.db.collection('_migrations').countDocuments();
    expect(applied).toBeGreaterThanOrEqual(2);
    expect(await runMigrations({ log: () => {} })).toEqual([]);
  });

  it('seeds content idempotently and keeps admin edits', async () => {
    const first = await seedContent();
    expect(first.services).toBe(35);
    await Service.updateOne({ slug: 'fractional-cto' }, { title: 'Edited by admin' });
    const second = await seedContent();
    expect(second.services).toBe(0);
    expect((await Service.findOne({ slug: 'fractional-cto' })).title).toBe('Edited by admin');
    expect(await Course.countDocuments()).toBe(8);
  });

  it('seeds demo pipeline records flagged as demo', async () => {
    await seedDemoPipeline();
    const demo = await Lead.find({ isDemo: true });
    expect(demo.length).toBe(5);
    expect(demo.every((l) => l.name.startsWith('Demo:'))).toBe(true);
  });
});
