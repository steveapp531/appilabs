import { describe, it, expect } from 'vitest';
import { api, loginAs } from './helpers.js';
import { User } from '../src/models/index.js';

describe('authentication and authorization', () => {
  it('reports setup status and creates the first owner with the setup token', async () => {
    await User.deleteMany({});
    const status = await api().get('/api/v1/auth/setup-status');
    expect(status.body.data).toEqual({ needsSetup: true, setupEnabled: true });

    const bad = await api().post('/api/v1/auth/setup').send({ setupToken: 'wrong', name: 'Owner', email: 'owner@test.dev', password: 'a-long-password' });
    expect(bad.status).toBe(403);

    const ok = await api().post('/api/v1/auth/setup').send({ setupToken: 'test-setup-token', name: 'Owner', email: 'owner@test.dev', password: 'a-long-password' });
    expect(ok.status).toBe(201);
    expect(ok.body.data.user.role).toBe('owner');

    const again = await api().post('/api/v1/auth/setup').send({ setupToken: 'test-setup-token', name: 'Owner2', email: 'o2@test.dev', password: 'a-long-password' });
    expect(again.status).toBe(409);
  });

  it('rejects wrong passwords without revealing which field was wrong', async () => {
    const res = await api().post('/api/v1/auth/login').send({ email: 'owner@test.dev', password: 'incorrect-pass' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Email or password is incorrect');
  });

  it('protects admin endpoints', async () => {
    expect((await api().get('/api/v1/admin/dashboard')).status).toBe(401);
    expect((await api().get('/api/v1/admin/dashboard').set('Authorization', 'Bearer garbage')).status).toBe(401);
  });

  it('lets owners read pipeline data and blocks editors', async () => {
    const owner = await loginAs('owner');
    const dash = await api().get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${owner.token}`);
    expect(dash.status).toBe(200);
    expect(dash.body.data.metrics).toHaveProperty('newLeads');

    const editor = await loginAs('editor');
    expect((await api().get('/api/v1/admin/leads').set('Authorization', `Bearer ${editor.token}`)).status).toBe(403);
    expect((await api().get('/api/v1/admin/services').set('Authorization', `Bearer ${editor.token}`)).status).toBe(200);
    expect((await api().get('/api/v1/admin/users').set('Authorization', `Bearer ${editor.token}`)).status).toBe(403);
  });

  it('rotates refresh tokens and requires the CSRF header', async () => {
    const owner = await loginAs('owner');
    const noHeader = await api().post('/api/v1/auth/refresh').set('Cookie', owner.cookie);
    expect(noHeader.status).toBe(403);
    const ok = await api().post('/api/v1/auth/refresh').set('Cookie', owner.cookie).set('X-Requested-With', 'appilabs');
    expect(ok.status).toBe(200);
    expect(ok.body.data.accessToken).toBeTruthy();
    const reused = await api().post('/api/v1/auth/refresh').set('Cookie', owner.cookie).set('X-Requested-With', 'appilabs');
    expect(reused.status).toBe(401);
  });

  it('records an audit log when a lead status changes', async () => {
    const owner = await loginAs('owner');
    const created = await api().post('/api/v1/leads').send({ name: 'Audit Person', email: 'audit@example.com', message: 'Testing audit trail' });
    const id = created.body.data.id;
    const patch = await api().patch(`/api/v1/admin/leads/${id}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'contacted' });
    expect(patch.status).toBe(200);
    expect(patch.body.data.firstRespondedAt).toBeTruthy();
    const logs = await api().get('/api/v1/admin/audit-logs?entity=lead').set('Authorization', `Bearer ${owner.token}`);
    expect(logs.body.data.some((l) => l.entityId === id && l.action === 'update')).toBe(true);
    const csv = await api().get('/api/v1/admin/leads?format=csv').set('Authorization', `Bearer ${owner.token}`);
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.text.split('\n')[0]).toContain('email');
  });
});
